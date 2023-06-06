import { get_latest_curve } from "$lib/server/curve";
import type { Application } from "$lib/server/db/types";
import { $t } from "$lib/server/i18n";
import { sys } from "$lib/server/sys";
import { create_token } from "$lib/server/token";
import { create_user } from "$lib/server/user";
import { EmailSchema, UrlSchema, type Cast } from "$lib/validate";
import debug from "debug";
import { z } from "zod";
import { error, json } from "@sveltejs/kit";
import * as JWT from "@tsndr/cloudflare-worker-jwt";
import type { RequestHandler } from "./$types";
import email from "./email";

const log = debug("pea:app:login");
log.enabled = true;

const LoginPayloadSchema = z.object({
	email: EmailSchema,
	callback: UrlSchema,
});

/**
 * Send the login email to the user.
 */
export const POST: RequestHandler = async ({
	platform,
	request,
	params,
	url,
	getClientAddress,
}) => {
	const { db, email } = sys(platform);

	const slug = params.slug.toLowerCase();

	const payload = LoginPayloadSchema.parse(await request.json());

	const ip = getClientAddress();
	const user_agent = request.headers.get("user-agent") || "";
	if (!ip || !user_agent) {
		throw error(400, await $t("error.invalid-request"));
	}

	const app = await db
		.selectFrom("Application")
		.selectAll()
		.where("Application.slug", "=", slug)
		.executeTakeFirst();
	if (!app) {
		throw error(404, await $t("error.application-not-found"));
	}

	if (app.active === 0) {
		throw error(400, await $t("error.application-is-deactivated"));
	}

	if (app.allowlist && !new RegExp(app.allowlist).test(payload.email)) {
		throw error(400, await $t("error.email-blocked-by-application"));
	}

	const regex = new RegExp(app.accept_url);
	if (!regex.test(payload.callback)) {
		throw error(400, await $t("error.invalid-callback"));
	}

	const user_exists = create_user(db, payload.email);
	const latest_curve = await get_latest_curve(db);

	const jti = "x" + Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
	const iat = Math.floor(Date.now() / 1000);
	const exp = iat + 60 * 60 * 24;

	const token = await JWT.sign(
		{
			iss: url.hostname,
			sub: payload.email,
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
	await create_token(db, latest_curve.id, jti, app.id, payload.email, ip, user_agent);

	const link = new URL(payload.callback);
	link.searchParams.set("token", token);
	log("link", link.toString());

	await send(email, payload.email, app, link.toString());

	return json({
		ok: true,
		email: payload.email,
		app: {
			name: app.name,
			logo: app.logo,
		},
	});
};

async function send(from: string, to: string, app: Cast<Application>, link: string): Promise<void> {
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
					}),
				},
			],
		}),
	});

	const res = await fetch(req);
	if (!res.ok) {
		throw new Error(await res.text());
	}
}
