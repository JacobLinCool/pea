import { sys } from "$lib/server/sys";
import { verify_token } from "$lib/server/verify";
import debug from "debug";
import { locale, waitLocale } from "svelte-i18n";
import type { Handle, RequestEvent } from "@sveltejs/kit";

const log = debug("pea:entry");
log.enabled = true;

export const handle: Handle = async ({ event, resolve }) => {
	const lang = event.request.headers.get("accept-language")?.split(",")[0] || "en";
	locale.set(lang);
	await waitLocale();

	const options = handle_options(event);
	if (options) {
		return options;
	}

	await try_auth(event);

	const result = await resolve(event);
	set_cors_headers(event, result.headers);

	return result;
};

function set_cors_headers(event: RequestEvent, headers: Headers) {
	headers.set("Access-Control-Allow-Origin", event.request.headers.get("origin") || "*");
	headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
	headers.set("Access-Control-Allow-Credentials", "true");
}

function handle_options(event: RequestEvent) {
	if (event.request.method === "OPTIONS" && event.request.headers.get("Origin") !== null) {
		const headers = new Headers();
		set_cors_headers(event, headers);
		return new Response(null, { headers });
	}
}

async function try_auth(event: RequestEvent) {
	const token =
		event.request.headers.get("authorization")?.split(" ")[1] || event.cookies.get("token");
	if (!token) {
		log("No token found");
		return;
	}

	const { db } = sys(event.platform);

	const email = await verify_token(db, token);
	event.locals.email = email;
	log(`Authenticated as ${email}`);
}
