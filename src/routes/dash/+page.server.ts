import { get_apps_by_user } from "$lib/server/app";
import { sys } from "$lib/server/sys";
import { get_user } from "$lib/server/user";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ platform, locals }) => {
	if (!locals.email) {
		throw redirect(302, "/login");
	}

	const { db } = sys(platform);

	const [user, apps] = await Promise.all([
		get_user(db, locals.email),
		get_apps_by_user(db, locals.email),
	]);

	return { user, apps };
};
