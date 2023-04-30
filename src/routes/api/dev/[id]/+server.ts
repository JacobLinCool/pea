import { sys } from "$lib/server/sys";
import { z } from "zod";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const DevUpsertSchema = z.object({
	name: z.string(),
});

/**
 * Get a developer account.
 */
export const GET: RequestHandler = async ({ platform, params }) => {
	const { db } = sys(platform);

	const id = params.id.toLowerCase();

	const dev = await db
		.selectFrom("Developer")
		.selectAll()
		.where("Developer.id", "=", id)
		.executeTakeFirst();
	if (!dev) {
		throw error(404, "Developer not found");
	}

	return json({
		id: dev.id,
		name: dev.name,
		email: dev.email,
		created: dev.created,
	});
};

/**
 * Update a developer account.
 */
export const PUT: RequestHandler = async ({ platform, params, locals, request }) => {
	if (!locals.email) {
		throw error(401, "Unauthorized");
	}

	const { db } = sys(platform);

	const id = params.id.toLowerCase();

	const dev = await db
		.selectFrom("Developer")
		.selectAll()
		.where("Developer.id", "=", id)
		.executeTakeFirst();
	if (dev) {
		if (locals.email !== dev.email) {
			throw error(403, "Forbidden");
		}

		const body = DevUpsertSchema.parse(await request.json());

		const result = await db
			.updateTable("Developer")
			.set(body)
			.where("Developer.id", "=", id)
			.returningAll()
			.executeTakeFirst();
		if (!result) {
			throw error(500, "Failed to update developer");
		}

		console.log("Updated developer", result);

		return json({
			id: dev.id,
			name: result.name,
			email: dev.email,
			created: dev.created,
		});
	}

	const body = DevUpsertSchema.parse(await request.json());

	const new_dev = await db
		.insertInto("Developer")
		.values({
			id: id,
			name: body.name,
			email: locals.email,
			created: Date.now(),
		})
		.returningAll()
		.executeTakeFirst();
	if (!new_dev) {
		throw error(500, "Failed to create developer");
	}

	console.log("Created new developer", new_dev);

	return json({
		id: new_dev.id,
		name: new_dev.name,
		email: new_dev.email,
		created: new_dev.created,
	});
};
