import type { Cast } from "$lib/validate";
import type { Kysely } from "kysely";
import { error } from "@sveltejs/kit";
import type { DB } from "../db/types";

export async function create_app(
	db: Kysely<DB>,
	slug: string,
	owner_email: string,
	name: string,
	allowlist: string,
	accept_url: string,
) {
	const result = await db
		.insertInto("Application")
		.values({
			slug,
			owner_email,
			name,
			allowlist,
			accept_url,
		})
		.executeTakeFirst();

	if (result.numInsertedOrUpdatedRows !== 1n) {
		throw error(400, "Failed to create app");
	}
}

/**
 * @throws 404 - App not found
 */
export async function get_app(db: Kysely<DB>, slug: string) {
	const app = await db
		.selectFrom("Application")
		.selectAll()
		.where("Application.slug", "=", slug)
		.executeTakeFirst();
	if (!app) {
		if (slug === "pea") {
			throw error(
				404,
				"System app not found, it seems the initial setup has not been completed. Please visit /api/sys/setup to complete the setup.",
			);
		}
		throw error(404, "App not found");
	}

	return app;
}

/**
 * @throws 500 - Failed to update app
 */
export async function update_app(
	db: Kysely<DB>,
	slug: string,
	updates: Partial<Cast<Omit<DB["Application"], "id" | "created" | "owner_email">>>,
) {
	const app = await db
		.updateTable("Application")
		.set(updates)
		.where("Application.slug", "=", slug)
		.returningAll()
		.executeTakeFirst();
	if (!app) {
		throw error(500, "Failed to update app");
	}

	return app;
}

/**
 * @throws 500 - Failed to delete app
 */
export async function delete_app(db: Kysely<DB>, slug: string) {
	const result = await db
		.deleteFrom("Application")
		.where("Application.slug", "=", slug)
		.executeTakeFirst();
	if (result.numDeletedRows !== 1n) {
		throw error(500, "Failed to delete app");
	}
}

export * from "./utils";
