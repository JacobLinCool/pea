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
}).partial();

export const Output = ApplicationSchema.omit({
	id: true,
});

export const Error = {
	401: error(401, "Unauthorized"),
	404: error(404, "App not found"),
	500: error(500, "Failed to update app"),
};

export default async function (
	input: z.infer<typeof Param & typeof Input>,
	{ platform, locals }: RequestEvent,
): Promise<z.infer<typeof Output>> {
	if (!locals.email) {
		throw Error[401];
	}

	const { db } = sys(platform);

	const app = await db
		.selectFrom("Application")
		.select("Application.owner_email")
		.where("Application.slug", "=", input.slug)
		.executeTakeFirst();
	if (!app) {
		throw Error[404];
	}

	if (locals.email !== app.owner_email) {
		throw Error[401];
	}

	const updated = await db
		.updateTable("Application")
		.set(input)
		.where("Application.slug", "=", input.slug)
		.returningAll()
		.executeTakeFirst();
	if (!updated) {
		throw Error[500];
	}

	return {
		slug: updated.slug,
		name: updated.name,
		description: updated.description,
		logo: updated.logo,
		color: updated.color,
		url: updated.url,
		created: updated.created,
		active: updated.active,
		owner_email: updated.owner_email,
		accept_url: updated.accept_url,
		allowlist: updated.allowlist,
	};
}
