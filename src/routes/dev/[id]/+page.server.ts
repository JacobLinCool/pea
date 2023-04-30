import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { id } = params;

	const dev_res = fetch(`/api/dev/${id}`);
	const apps_res = fetch(`/api/dev/${id}/app`);

	const [dev, apps] = await Promise.all([dev_res, apps_res]);

	const dev_json = await dev.json<{ id: string; name: string; email: string; created: number }>();
	const apps_json = await apps.json<{
		apps: { id: string; name: string; created: number; description: string; owner: string }[];
	}>();

	return {
		dev: dev_json,
		apps: apps_json.apps,
	};
};
