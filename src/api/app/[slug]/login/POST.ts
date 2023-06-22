import { get_latest_curve } from "$lib/server/curve";
import type { Application } from "$lib/server/db/types";
import { $t } from "$lib/server/i18n";
import { sys } from "$lib/server/sys";
import { create_token } from "$lib/server/token";
import { create_user } from "$lib/server/user";
import { EmailSchema, UrlSchema } from "$lib/validate";
import type { Cast } from "$lib/validate";
import debug from "debug";
import { z } from "sveltekit-api";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";
import * as JWT from "@tsndr/cloudflare-worker-jwt";
import { Param, Modifier } from "../shared";
import email from "./email";

const log = debug("pea:app:login");
log.enabled = true;

export { Param, Modifier };

export const Input = z.object({
	email: EmailSchema.describe("Email address of the user"),
	callback: UrlSchema.describe("Callback URL for the application"),
	show_link: z.boolean().default(false).describe("Show the link in the email"),
	ttl: z
		.number()
		.positive()
		.max(60 * 24 * 30 * 12)
		.default(60 * 24)
		.describe("Time to live in minutes"),
});

export const Output = z.object({
	ok: z.literal(true),
	email: EmailSchema.describe("Email address of the user"),
	app: z.object({
		name: z.string().describe("Name of the application"),
		logo: UrlSchema.nullable().describe("Logo of the application"),
	}),
});

export const Error = {
	400: error(400, await $t("error.invalid-request")),
	403: error(403, await $t("error.email-blocked-by-application")),
	404: error(404, await $t("error.application-not-found")),
	409: error(409, await $t("error.application-is-deactivated")),
	421: error(421, await $t("error.invalid-callback")),
	502: error(502, "Unable to send email"),
};

export default async function (
	input: z.infer<typeof Param & typeof Input>,
	{ platform, request, url, getClientAddress }: RequestEvent,
): Promise<z.infer<typeof Output>> {
	const { db, email } = sys(platform);

	const ip = getClientAddress();
	const user_agent = request.headers.get("user-agent") || "";
	if (!ip || !user_agent) {
		throw Error[400];
	}

	const app = await db
		.selectFrom("Application")
		.selectAll()
		.where("Application.slug", "=", input.slug)
		.executeTakeFirst();
	if (!app) {
		throw Error[404];
	}

	if (app.active === 0) {
		throw Error[409];
	}

	if (app.allowlist && !new RegExp(app.allowlist).test(input.email)) {
		throw Error[403];
	}

	const regex = new RegExp(app.accept_url);
	if (!regex.test(input.callback)) {
		throw Error[421];
	}

	const user_exists = create_user(db, input.email);
	const latest_curve = await get_latest_curve(db);

	const jti = "x" + Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
	const iat = Math.floor(Date.now() / 1000);
	const exp = iat + input.ttl * 60;

	const token = await JWT.sign(
		{
			iss: url.hostname,
			sub: input.email,
			aud: app.slug,
			iat,
			exp,
			nbf: iat,
			jti,
		},
		{
			kty: "EC",
			alg: "ES256",
			ext: true,
			key_ops: ["sign", "verify"],
			crv: latest_curve.crv,
			d: latest_curve.d,
			x: latest_curve.x,
			y: latest_curve.y,
		},
		{
			algorithm: "ES256",
			header: {
				typ: "JWT",
				jku: new URL("/jwks.json", url).toString(),
				kid: "pea-" + latest_curve.id.toString(),
			},
		},
	);

	await user_exists;
	await create_token(db, latest_curve.id, jti, app.id, input.email, ip, user_agent);

	const link = new URL(input.callback);
	link.searchParams.set("token", token);
	log("link", link.toString());

	await send(email, input.email, app, link.toString(), input.show_link, input.ttl);

	return {
		ok: true,
		email: input.email,
		app: {
			name: app.name,
			logo: app.logo,
		},
	};
}

async function send(
	from: string,
	to: string,
	app: Cast<Application>,
	link: string,
	show_link: boolean,
	ttl: number,
): Promise<void> {
	const req = new Request("https://api.mailchannels.net/tx/v1/send", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			from: {
				name: app.name,
				email: from,
			},
			personalizations: [{ to: [{ email: to }] }],
			subject: `Login to ${app.name}`,
			content: [
				{
					type: "text/html",
					value: email({
						head: `Login to ${app.name}`,
						body: `You are receiving this email because you requested a login link for ${app.name}. If you did not request this, please ignore this email. <br/> Click the button or link below to login.`,
						link: link,
						login: "Login",
						color: app.color || "#7e22ce",
						show_link,
						ttl,
					}),
				},
			],
		}),
	});

	const res = await fetch(req);
	if (!res.ok) {
		console.error(await res.text());
		throw Error[502];
	}
}
