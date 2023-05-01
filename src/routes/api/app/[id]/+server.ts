import { ApplicationSchema } from "$lib/server/db/schema";
import { sys } from "$lib/server/sys";
import { z } from "zod";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const AppUpsertSchema = z.object({
	name: ApplicationSchema.shape.name,
	description: ApplicationSchema.shape.description,
	secret: ApplicationSchema.shape.secret,
	domain: ApplicationSchema.shape.domain,
	active: ApplicationSchema.shape.active,
	allowlist: ApplicationSchema.shape.allowlist,
});

/**
 * Get information about an Application.
 * @public
 */
export const GET: RequestHandler = async ({ platform, params, locals }) => {
	const { db } = sys(platform);

	const id = params.id.toLowerCase();

	const app = await db
		.selectFrom("Application")
		.select([
			"Application.id",
			"Application.name",
			"Application.description",
			"Application.owner",
			"Application.domain",
			"Application.created",
			"Application.active",
			"Application.allowlist",
		])
		.where("Application.id", "=", id)
		.innerJoin("Developer", "Developer.id", "Application.owner")
		.select("Developer.email")
		.executeTakeFirst();
	if (!app) {
		throw error(404, "Application not found");
	}

	if (locals.email !== app.email) {
		return json({
			id: app.id,
			name: app.name,
			description: app.description,
			owner: app.owner,
			created: app.created,
		});
	} else {
		return json({
			id: app.id,
			name: app.name,
			description: app.description,
			owner: app.owner,
			domain: app.domain,
			created: app.created,
			active: app.active,
			allowlist: app.allowlist,
		});
	}
};

/**
 * Upsert an Application.
 * @protected
 */
export const PUT: RequestHandler = async ({ platform, params, locals, request }) => {
	if (!locals.email) {
		throw error(401, "Unauthorized");
	}

	const { db } = sys(platform);

	const id = params.id.toLowerCase();

	const app = await db
		.selectFrom("Application")
		.select([
			"Application.id",
			"Application.name",
			"Application.description",
			"Application.owner",
			"Application.domain",
			"Application.created",
			"Application.active",
			"Application.allowlist",
		])
		.where("Application.id", "=", id)
		.innerJoin("Developer", "Developer.id", "Application.owner")
		.select("Developer.email")
		.executeTakeFirst();
	if (app) {
		if (locals.email !== app.email) {
			throw error(403, "Forbidden");
		}

		const body = AppUpsertSchema.parse(await request.json());

		const result = await db
			.updateTable("Application")
			.set(body)
			.where("Application.id", "=", id)
			.returningAll()
			.executeTakeFirst();
		if (!result) {
			throw error(500, "Failed to update application");
		}

		console.log("Updated application", result);

		return json({
			id: app.id,
			name: result.name,
			description: app.description,
			owner: app.owner,
			created: app.created,
			domain: app.domain,
			active: app.active,
			allowlist: app.allowlist,
		});
	}

	const dev = await db
		.selectFrom("Developer")
		.select("Developer.id")
		.where("Developer.email", "=", locals.email)
		.executeTakeFirst();
	if (!dev) {
		throw error(404, "Developer not found");
	}

	const body = await request.json();
	const data = AppUpsertSchema.parse(body);

	const new_app = await db
		.insertInto("Application")
		.values({
			id: id,
			name: data.name,
			description: data.description,
			owner: dev.id,
			domain: data.domain,
			secret: data.secret,
			created: Date.now(),
			active: true,
			allowlist: "",
		})
		.returningAll()
		.executeTakeFirst();
	if (!new_app) {
		throw error(500, "Failed to create application");
	}

	console.log("Created new application", new_app);

	return json({
		id: new_app.id,
		name: new_app.name,
		description: new_app.description,
		owner: new_app.owner,
		domain: new_app.domain,
		created: new_app.created,
		active: new_app.active,
		allowlist: new_app.allowlist,
	});
};
