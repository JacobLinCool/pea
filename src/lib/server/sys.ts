import type { Kysely } from "kysely";
import { error } from "@sveltejs/kit";
import { DB } from "./db";
import type { Database } from "./db/schema";

export function sys(platform?: Readonly<App.Platform>): {
	db: Kysely<Database>;
	email: string;
	secret: string;
	white_list: string;
} {
	if (
		!platform?.env?.PEA_APP_EMAIL ||
		!platform?.env?.PEA_APP_SECRET ||
		!platform?.env?.PEA_WHITE_LIST
	) {
		throw error(500, "Missing environment variables");
	}

	const db = DB(platform);

	return {
		db,
		email: platform.env.PEA_APP_EMAIL,
		secret: platform.env.PEA_APP_SECRET,
		white_list: platform.env.PEA_WHITE_LIST,
	};
}
