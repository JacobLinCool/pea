import { KnownError } from "$lib/error";
import type { Kysely } from "kysely";
import { D1 } from "./d1";
import type { Database } from "./schema";

export function DB(platform?: Readonly<App.Platform>): Kysely<Database> {
	if (platform?.env?.D1 || platform?.env?.__D1_BETA__D1) {
		return new D1(platform);
	}

	throw new KnownError("No database available");
}
