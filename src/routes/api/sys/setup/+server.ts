import { create_app, update_app } from "$lib/server/app";
import { create_curve, get_curves } from "$lib/server/curve";
import { sys } from "$lib/server/sys";
import { create_user, update_user } from "$lib/server/user";
import debug from "debug";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const log = debug("pea:setup");
log.enabled = true;

/**
 * Setup the PEA application at first run.
 */
export const GET: RequestHandler = async ({ platform, url }) => {
	const { db, email } = sys(platform);

	const created_system_user = await create_user(db, email);
	if (created_system_user) {
		await update_user(db, email, {
			id: "pea",
			name: "Pure Email Auth",
			bio: "Pure Email Auth allows you to simply develop applications with email authentication.",
			avatar: new URL("/icon-256.png", url).toString(),
		});
		log(`Created system user with email ${email}`);
	} else {
		log("System user already exists.");
	}

	try {
		await create_app(db, "pea", email, "PEA", "^.+$", "^" + url.origin);
		await update_app(db, "pea", {
			url: "https://github.com/JacobLinCool/pea",
			description:
				"Pure Email Auth allows you to simply develop applications with email authentication.",
			logo: new URL("/icon-256.png", url).toString(),
		});
		log("Created system app");
	} catch (e) {
		log("System app already exists.");
	}

	const curves = await get_curves(db);
	if (curves.length === 0) {
		log("No curves found, creating default curve");

		const curve = await create_curve(db);
		log(`Created default curve with id ${curve.id}`);
	}

	return json({ ok: true });
};
