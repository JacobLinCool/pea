import { get_app } from "$lib/server/app";
import { sys } from "$lib/server/sys";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ platform, params }) => {
	const { db } = sys(platform);
	const app = await get_app(db, params.slug);

	return {
		app: {
			slug: app.slug,
			name: app.name,
			description: app.description,
			logo: app.logo,
			color: app.color,
			url: app.url,
			created: app.created,
			active: app.active,
			owner_email: app.owner_email,
		},
	};
};
