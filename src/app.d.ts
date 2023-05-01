import type { D1Database, EventContext, CacheStorage } from "@cloudflare/workers-types";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			email?: string;
		}
		// interface PageData {}
		interface Platform {
			env?: {
				D1?: D1Database;
				__D1_BETA__D1?: D1Database;
				PEA_APP_SECRET?: string;
				PEA_APP_EMAIL?: string;
				PEA_ALLOWLIST?: string;
			};
			context?: EventContext;
			caches?: CacheStorage;
		}
	}

	module "*.sql" {
		const value: string;
		export default value;
	}
}

export {};
