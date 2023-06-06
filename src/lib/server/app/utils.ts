import type { Kysely } from "kysely";
import { error } from "@sveltejs/kit";
import type { DB } from "../db/types";

/**
 * @throws 404 - User not found
 */
export async function get_apps_by_user(db: Kysely<DB>, email_or_id: string) {
	const email = email_or_id.includes("@")
		? email_or_id
		: await db
				.selectFrom("User")
				.select("User.email")
				.where("User.id", "=", email_or_id)
				.executeTakeFirst()
				.then((user) => user?.email);
	if (!email) {
		throw error(404, "User not found");
	}

	const apps = await db
		.selectFrom("Application")
		.selectAll()
		.where("Application.owner_email", "=", email)
		.orderBy("Application.created", "desc")
		.execute();

	return apps;
}
