import type { Kysely } from "kysely";
import { error } from "@sveltejs/kit";
import { DB } from "./db";
import type { Database } from "./db/schema";

export function sys(platform?: Readonly<App.Platform>): {
	db: Kysely<Database>;
	email: string;
	secret: string;
	allowlist: string;
} {
	if (
		!platform?.env?.PEA_APP_EMAIL ||
		!platform?.env?.PEA_APP_SECRET ||
		!platform?.env?.PEA_ALLOWLIST
	) {
		throw error(500, "Missing environment variables");
	}

	const db = DB(platform);

	return {
		db,
		email: platform.env.PEA_APP_EMAIL,
		secret: platform.env.PEA_APP_SECRET,
		allowlist: platform.env.PEA_ALLOWLIST,
	};
}
