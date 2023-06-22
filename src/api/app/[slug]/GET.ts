import { sys } from "$lib/server/sys";
import { ApplicationSchema } from "$lib/validate";
import type { z } from "sveltekit-api";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";
import { Param, Modifier } from "./shared";

export { Param, Modifier };

export const Output = ApplicationSchema.omit({
	id: true,
}).partial({
	accept_url: true,
	allowlist: true,
});

export const Error = {
	404: error(404, "App not found"),
	500: error(
		500,
		"System app not found, it seems the initial setup has not been completed. Please visit /api/sys/setup to complete the setup.",
	),
};

export default async function (
	param: z.infer<typeof Param>,
	evt: RequestEvent,
): Promise<z.infer<typeof Output>> {
	const { db } = sys(evt.platform);

	const app = await db
		.selectFrom("Application")
		.selectAll()
		.where("Application.slug", "=", param.slug)
		.executeTakeFirst();
	if (!app) {
		if (param.slug === "pea") {
			throw Error[500];
		}
		throw Error[404];
	}

	const returns: z.infer<typeof Output> = {
		slug: app.slug,
		name: app.name,
		description: app.description,
		logo: app.logo,
		color: app.color,
		url: app.url,
		created: app.created,
		active: app.active,
		owner_email: app.owner_email,
	};

	if (evt.locals.email === app.owner_email) {
		returns.accept_url = app.accept_url;
		returns.allowlist = app.allowlist;
	}

	return returns;
}
