import type { Application } from "$lib/server/db/schema";
import { sys } from "$lib/server/sys";
import { z } from "zod";
import { error, json } from "@sveltejs/kit";
import * as JWT from "@tsndr/cloudflare-worker-jwt";
import type { RequestHandler } from "./$types";

const LoginPayloadSchema = z.object({
	email: z.string().max(128).email(),
	callback: z.string().max(1024).url(),
	secret: z.string().max(128).optional(),
	extend: z.record(z.string(), z.any()).optional(),
});

/**
 * Send the login email to the user.
 */
export const POST: RequestHandler = async ({ platform, request, params, url }) => {
	const { db, email, white_list } = sys(platform);

	const id = params.id.toLowerCase();

	const payload = LoginPayloadSchema.parse(await request.json());

	if (
		!white_list
			.split(",")
			.map((x) => new RegExp(x))
			.some((x) => x.test(payload.email))
	) {
		throw error(400, "Invalid email");
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
		throw error(404, "Application not found");
	}

	const regex = new RegExp(app.domain);
	if (!regex.test(payload.callback)) {
		throw error(400, "Invalid callback");
	}

	let additionals: Record<string, unknown> = {};
	if (payload.secret) {
		if (payload.secret !== app.secret) {
			throw error(400, "Invalid secret");
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
					value: `You are receiving this email because you requested a login link for ${app.name}.<br><br><a href="${link}">Click here to login</a>`,
				},
			],
		}),
	});

	const res = await fetch(req);
	if (!res.ok) {
		throw new Error(await res.text());
	}
}
