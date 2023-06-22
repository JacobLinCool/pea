import { sys } from "$lib/server/sys";
import { z } from "sveltekit-api";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";
import { Param, Modifier } from "./shared";

export { Param, Modifier };

export const Output = z.object({
	ok: z.boolean().describe("Whether the app was successfully deleted."),
});

export const Error = {
	401: error(401, "Unauthorized"),
	403: error(403, "Forbidden"),
	404: error(404, "App not found"),
};

export default async function (
	param: z.infer<typeof Param>,
	evt: RequestEvent,
): Promise<z.infer<typeof Output>> {
	if (!evt.locals.email) {
		throw Error[401];
	}

	const { db } = sys(evt.platform);

	const app = await db
		.selectFrom("Application")
		.select("Application.owner_email")
		.where("Application.slug", "=", param.slug)
		.executeTakeFirst();
	if (!app) {
		throw Error[404];
	}

	if (evt.locals.email !== app.owner_email) {
		throw Error[403];
	}

	const result = await db
		.deleteFrom("Application")
		.where("Application.slug", "=", param.slug)
		.executeTakeFirst();

	return { ok: result.numDeletedRows === 1n };
}
