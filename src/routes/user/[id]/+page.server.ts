import { get_apps_by_user } from "$lib/server/app";
import { sys } from "$lib/server/sys";
import { get_user } from "$lib/server/user";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ platform, params }) => {
	const { db } = sys(platform);

	const [user, apps] = await Promise.all([
		get_user(db, params.id),
		get_apps_by_user(db, params.id),
	]);

	return {
		user,
		apps: apps.map((a) => ({
			slug: a.slug,
			name: a.name,
			description: a.description,
			url: a.url,
			logo: a.logo,
			color: a.color,
			created: a.created,
		})),
	};
};
