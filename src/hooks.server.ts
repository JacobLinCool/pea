import { locale, waitLocale } from "svelte-i18n";
import type { Handle } from "@sveltejs/kit";
import * as JWT from "@tsndr/cloudflare-worker-jwt";

export const handle: Handle = async ({ event, resolve }) => {
	const lang = event.request.headers.get("accept-language")?.split(",")[0] || "en";
	locale.set(lang);
	await waitLocale();

	try {
		const auth = event.request.headers.get("Authorization");
		if (auth && event.platform?.env?.PEA_APP_SECRET) {
			const [type, token] = auth.split(" ");
			if (type === "Bearer") {
				await JWT.verify(token, event.platform.env.PEA_APP_SECRET);
				const decoded = JWT.decode(token);
				if (decoded.payload.sub) {
					event.locals.email = decoded.payload.sub;
				}
			}
		}
	} catch (err) {
		console.error("Failed to parse Authorization header", err);
	}

	const result = await resolve(event);

	result.headers.set("Access-Control-Allow-Origin", event.request.headers.get("origin") || "*");
	result.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	result.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
	result.headers.set("Access-Control-Allow-Credentials", "true");

	return result;
};
