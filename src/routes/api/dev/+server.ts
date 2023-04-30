import { sys } from "$lib/server/sys";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/**
 * Get a developer by email.
 */
export const GET: RequestHandler = async ({ platform, url }) => {
	const { db } = sys(platform);

	const email = url.searchParams.get("email");
	if (!email) {
		throw error(400, "Missing email");
	}

	const dev = await db
		.selectFrom("Developer")
		.selectAll()
		.where("Developer.email", "=", email)
		.executeTakeFirst();
	if (!dev) {
		throw error(404, "Developer not found");
	}

	return json({
		id: dev.id,
		name: dev.name,
		email: dev.email,
		created: dev.created,
	});
};
