import type { Kysely } from "kysely";
import { error } from "@sveltejs/kit";
import type { DB } from "../db/types";

export async function create_token(
	db: Kysely<DB>,
	curve_id: number,
	token_id: string,
	app_id: number,
	user_email: string,
	user_ip: string,
	user_agent: string,
) {
	const result = await db
		.insertInto("Token")
		.values({
			id: token_id,
			user_email,
			app_id,
			ip: user_ip,
			user_agent,
			curve_id,
		})
		.executeTakeFirst();

	if (result.numInsertedOrUpdatedRows !== 1n) {
		throw error(400, "Failed to create token");
	}
}
