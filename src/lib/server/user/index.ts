import type { Cast } from "$lib/validate";
import type { Kysely } from "kysely";
import { error } from "@sveltejs/kit";
import type { DB } from "../db/types";

export async function create_user(db: Kysely<DB>, email: string) {
	const result = await db
		.insertInto("User")
		.values({
			email,
		})
		.onConflict((oc) => oc.column("email").doNothing())
		.executeTakeFirst();

	return result.numInsertedOrUpdatedRows === 1n;
}

/**
 * @throws 404 - User not found
 */
export async function get_user(db: Kysely<DB>, email_or_id: string) {
	const user = email_or_id.includes("@")
		? await db
				.selectFrom("User")
				.selectAll()
				.where("User.email", "=", email_or_id)
				.executeTakeFirst()
		: await db
				.selectFrom("User")
				.selectAll()
				.where("User.id", "=", email_or_id)
				.executeTakeFirst();
	if (!user) {
		throw error(404, "User not found");
	}

	return user;
}

/**
 * @throws 500 - Failed to update user
 */
export async function update_user(
	db: Kysely<DB>,
	email: string,
	updates: Partial<Cast<Omit<DB["User"], "email" | "created">>>,
) {
	const user = await db
		.updateTable("User")
		.set(updates)
		.where("User.email", "=", email)
		.returningAll()
		.executeTakeFirst();
	if (!user) {
		throw error(500, "Failed to update user");
	}

	return user;
}

/**
 * @throws 500 - Failed to delete user
 */
export async function delete_user(db: Kysely<DB>, email: string) {
	const result = await db.deleteFrom("User").where("User.email", "=", email).executeTakeFirst();
	if (result.numDeletedRows !== 1n) {
		throw error(500, "Failed to delete user");
	}
}
