import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { id } = params;

	const res = await fetch(`/api/app/${id}`);
	if (res.status === 404) {
		throw error(404, "Not Found");
	}

	return {
		app: await res.json<{
			id: string;
			owner: string;
			name: string;
			description: string;
			created: number;
		}>(),
	};
};
