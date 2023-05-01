import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
	throw redirect(301, `/app/pea?cb=${url.origin}/dash`);
};
