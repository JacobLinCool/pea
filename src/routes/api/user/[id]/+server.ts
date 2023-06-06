import { sys } from "$lib/server/sys";
import { delete_user, get_user, update_user } from "$lib/server/user";
import { UserSchema } from "$lib/validate";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ platform, params, locals }) => {
	const { db } = sys(platform);

	const user = await get_user(db, params.id.toLowerCase());

	if (user.id || locals.email === user.email) {
		return json(user);
	}

	throw error(403, "Forbidden");
};

export const PUT: RequestHandler = async ({ platform, params, locals, request }) => {
	const { db } = sys(platform);

	const user = await get_user(db, params.id.toLowerCase());

	if (locals.email !== user.email) {
		throw error(403, "Forbidden");
	}

	const updates = UserSchema.omit({ email: true, created: true }).parse(await request.json());
	const new_user = await update_user(db, user.email, updates);

	return json(new_user);
};

export const DELETE: RequestHandler = async ({ platform, params, locals }) => {
	const { db } = sys(platform);

	const user = await get_user(db, params.id.toLowerCase());

	if (locals.email !== user.email) {
		throw error(403, "Forbidden");
	}

	await delete_user(db, user.email);

	return json({ deleted: true });
};
