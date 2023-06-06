import type { Kysely } from "kysely";
import { DB as SDB } from "sveltekit-db";
import type { DB as Database } from "./types";

export function DB(_platform?: Readonly<App.Platform>): Kysely<Database> {
	return SDB();
}
