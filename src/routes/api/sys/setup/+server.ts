import { sys } from "$lib/server/sys";
import { error, json } from "@sveltejs/kit";
import * as JWT from "@tsndr/cloudflare-worker-jwt";
import type { RequestHandler } from "./$types";

/**
 * Setup the PEA application.
 */
export const GET: RequestHandler = async ({ platform, url, fetch }) => {
	const { db, email, secret } = sys(platform);

	const app = await db
		.selectFrom("Application")
		.select("id")
		.where("id", "=", "pea")
		.executeTakeFirst();
	if (app) {
		console.log("System already setup.");
		return json({ ok: true });
	}

	const jwt = await JWT.sign({ sub: email }, secret);

	const res_a = await fetch("/api/dev/pea", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${jwt}`,
		},
		body: JSON.stringify({
			name: "PEA - Pure Email Auth",
		}),
	});
	if (!res_a.ok) {
		throw error(500, "Failed to create System Developer.");
	}

	const res_b = await fetch("/api/app/pea", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${jwt}`,
		},
		body: JSON.stringify({
			name: "PEA",
			description: "Pure Email Auth.",
			secret: secret,
			domain: `^${url.origin}`,
		}),
	});
	if (!res_b.ok) {
		throw error(500, "Failed to create System Application.");
	}

	return json({ ok: true });
};
