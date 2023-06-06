import { create_app, delete_app, get_app, update_app } from "$lib/server/app";
import { sys } from "$lib/server/sys";
import { ApplicationSchema } from "$lib/validate";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/**
 * Get information about an Application.
 */
export const GET: RequestHandler = async ({ platform, params, locals }) => {
	const { db } = sys(platform);

	const app = await get_app(db, params.slug.toLowerCase());

	const returns: Record<string, unknown> = {
		slug: app.slug,
		name: app.name,
		description: app.description,
		logo: app.logo,
		color: app.color,
		url: app.url,
		created: app.created,
		active: app.active,
		owner_email: app.owner_email,
	};

	if (locals.email === app.owner_email) {
		returns.accept_url = app.accept_url;
		returns.allowlist = app.allowlist;
	}

	return json(returns);
};

/**
 * Update an Application.
 */
export const PUT: RequestHandler = async ({ platform, params, locals, request }) => {
	if (!locals.email) {
		throw error(401, "Unauthorized");
	}

	const { db } = sys(platform);

	const app = await get_app(db, params.slug.toLowerCase());

	if (locals.email !== app.owner_email) {
		throw error(403, "Forbidden");
	}

	const updates = ApplicationSchema.omit({
		id: true,
		created: true,
		owner_email: true,
		slug: true,
	})
		.partial()
		.parse(await request.json());

	const new_app = await update_app(db, params.slug.toLowerCase(), updates);

	return json({
		slug: new_app.slug,
		name: new_app.name,
		description: new_app.description,
		logo: new_app.logo,
		color: new_app.color,
		url: new_app.url,
		created: new_app.created,
		active: new_app.active,
		owner_email: new_app.owner_email,
		accept_url: new_app.accept_url,
		allowlist: new_app.allowlist,
	});
};

/**
 * Create an Application.
 */
export const POST: RequestHandler = async ({ platform, params, locals, request }) => {
	if (!locals.email) {
		throw error(401, "Unauthorized");
	}

	const slug = params.slug.toLowerCase();

	const { db } = sys(platform);

	const data = ApplicationSchema.omit({
		id: true,
		created: true,
		owner_email: true,
		slug: true,
	}).parse(await request.json());

	await create_app(db, slug, locals.email, data.name, data.allowlist, data.accept_url);
	const app = await update_app(db, slug, data);

	return json({
		slug: app.slug,
		name: app.name,
		description: app.description,
		logo: app.logo,
		color: app.color,
		url: app.url,
		created: app.created,
		active: app.active,
		owner_email: app.owner_email,
		accept_url: app.accept_url,
		allowlist: app.allowlist,
	});
};

/**
 * Delete an Application.
 */
export const DELETE: RequestHandler = async ({ platform, params, locals }) => {
	if (!locals.email) {
		throw error(401, "Unauthorized");
	}

	const { db } = sys(platform);

	const app = await get_app(db, params.slug.toLowerCase());

	if (locals.email !== app.owner_email) {
		throw error(403, "Forbidden");
	}

	await delete_app(db, params.slug.toLowerCase());

	return json({ ok: true });
};
