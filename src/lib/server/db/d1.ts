import { KnownError } from "$lib/error";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { D1Database } from "./d1-shim";
import type { Database } from "./schema";

export class D1 extends Kysely<Database> {
	constructor(platform?: Readonly<App.Platform>) {
		const db = platform?.env?.D1 || platform?.env?.__D1_BETA__D1;
		if (!db) {
			throw new KnownError("D1 database not available");
		}

		super({
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			dialect: new D1Dialect({ database: "fetch" in db ? (new D1Database(db) as any) : db }),
		});
	}
}

export default D1;
