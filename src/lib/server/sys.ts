import { env } from "$env/dynamic/private";
import type { Kysely } from "kysely";
import { error } from "@sveltejs/kit";
import { DB } from "./db";
import type { DB as Database } from "./db/types";

export function sys(platform?: Readonly<App.Platform>): {
	db: Kysely<Database>;
	email: string;
} {
	if (!env?.PEA_APP_EMAIL) {
		throw error(500, "Missing PEA_APP_EMAIL");
	}

	const db = DB(platform);

	return {
		db,
		email: env.PEA_APP_EMAIL,
	};
}
