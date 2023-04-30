import { sys } from "$lib/server/sys";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/**
 * Get all Applications owned by a Developer.
 * @public
 */
export const GET: RequestHandler = async ({ platform, params }) => {
	const { db } = sys(platform);

	const id = params.id.toLowerCase();

	const apps = await db
		.selectFrom("Application")
		.select(["id", "name", "description", "owner", "created", "domain"])
		.where("Application.owner", "=", id)
		.execute();

	return json({ apps });
};
