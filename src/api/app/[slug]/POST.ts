import { sys } from "$lib/server/sys";
import { ApplicationSchema } from "$lib/validate";
import type { z } from "sveltekit-api";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";
import { Param, Modifier } from "./shared";

export { Param, Modifier };

export const Input = ApplicationSchema.omit({
	id: true,
	created: true,
	owner_email: true,
	slug: true,
});

export const Output = ApplicationSchema.omit({
	id: true,
});

export const Error = {
	401: error(401, "Unauthorized"),
	409: error(409, "App already exists"),
	500: error(500, "App created but failed to set additional properties"),
};

export default async function (
	input: z.infer<typeof Param & typeof Input>,
	{ platform, locals }: RequestEvent,
): Promise<z.infer<typeof Output>> {
	if (!locals.email) {
		throw Error[401];
	}

	const { db } = sys(platform);

	const created = await db
		.insertInto("Application")
		.values({
			slug: input.slug,
			owner_email: locals.email,
			name: input.name,
			allowlist: input.allowlist,
			accept_url: input.accept_url,
		})
		.onConflict((oc) => oc.column("slug").doNothing())
		.executeTakeFirst();

	if (created.numInsertedOrUpdatedRows !== 1n) {
		throw Error[409];
	}

	const app = await db
		.updateTable("Application")
		.set(input)
		.where("Application.slug", "=", input.slug)
		.returningAll()
		.executeTakeFirst();
	if (!app) {
		throw Error[500];
	}

	return {
		slug: app.slug,
		name: app.name,
		description: app.description,
		logo: app.logo,
		color: app.color,
		url: app.url,
		created: app.created,
		active: app.active,
		owner_email: app.owner_email,
		accept_url: app.accept_url,
		allowlist: app.allowlist,
	};
}
