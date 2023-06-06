import { get_apps_by_user } from "$lib/server/app";
import { sys } from "$lib/server/sys";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ platform, params }) => {
	const { db } = sys(platform);

	const apps = await get_apps_by_user(db, params.id.toLowerCase());

	return json(apps);
};
