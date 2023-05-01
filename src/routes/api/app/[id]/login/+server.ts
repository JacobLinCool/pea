import { ApplicationSchema, type Application } from "$lib/server/db/schema";
import { UserSchema } from "$lib/server/db/schema";
import { $t } from "$lib/server/i18n";
import { sys } from "$lib/server/sys";
import { z } from "zod";
import { error, json } from "@sveltejs/kit";
import * as JWT from "@tsndr/cloudflare-worker-jwt";
import type { RequestHandler } from "./$types";
import email from "./email";

const LoginPayloadSchema = z.object({
	email: UserSchema.shape.email,
	callback: z.string().max(1024).url(),
	secret: ApplicationSchema.shape.secret.optional(),
	extend: z.record(z.string(), z.any()).optional(),
});

/**
 * Send the login email to the user.
 */
export const POST: RequestHandler = async ({ platform, request, params, url }) => {
	const { db, email, allowlist } = sys(platform);

	const id = params.id.toLowerCase();

	const payload = LoginPayloadSchema.parse(await request.json());

	if (
		!allowlist
			.split(",")
			.map((x) => new RegExp(x))
			.some((x) => x.test(payload.email))
	) {
		throw error(400, await $t("error.invalid-email"));
	}

	const ip =
		request.headers.get("cf-connecting-ip") ||
		request.headers.get("x-forwarded-for") ||
		"0.0.0.0";

	const app = await db
		.selectFrom("Application")
		.selectAll()
		.where("Application.id", "=", id)
		.executeTakeFirst();
	if (!app) {
		throw error(404, await $t("error.application-not-found"));
	}

	if (app.active === false) {
		throw error(400, await $t("error.application-is-deactivated"));
	}

	if (
		app.allowlist &&
		!app.allowlist
			.split(",")
			.map((x) => new RegExp(x))
			.some((x) => x.test(payload.email))
	) {
		throw error(400, await $t("error.email-blocked-by-application"));
	}

	const regex = new RegExp(app.domain);
	if (!regex.test(payload.callback)) {
		throw error(400, await $t("error.invalid-callback"));
	}

	let additionals: Record<string, unknown> = {};
	if (payload.secret) {
		if (payload.secret !== app.secret) {
			throw error(400, await $t("error.invalid-secret"));
		}
		additionals = payload.extend || {};
	}

	await db
		.insertInto("User")
		.values({
			email: payload.email,
			created: Date.now(),
		})
		.onConflict((oc) => oc.column("email").doNothing())
		.execute();

	const jti = Date.now().toString(36) + Math.random().toString(36).substring(2, 10);

	await db
		.insertInto("Login")
		.values({
			id: jti,
			app: app.id,
			user: payload.email,
			time: Date.now(),
			ip: ip,
		})
		.execute();

	const token = await JWT.sign(
		{
			iss: `pea (${url.host})`,
			sub: payload.email,
			aud: app.id,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
			nbf: Math.floor(Date.now() / 1000),
			jti: jti,
			...additionals,
		},
		app.secret,
	);

	const link = new URL(payload.callback);
	link.searchParams.set("token", token);

	await send(email, payload.email, app, link.href);

	return json({ ok: true, email: payload.email });
};

async function send(from: string, to: string, app: Application, link: string): Promise<void> {
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
						body: `You are receiving this email because you requested a login link for ${app.name}. If you did not request this, please ignore this email. Otherwise, please click the button or link below to login.`,
						link: link,
						login: "Login",
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
