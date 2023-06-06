import { sys } from "$lib/server/sys";
import { verify_token } from "$lib/server/verify";
import debug from "debug";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

const log = debug("pea:auth");
log.enabled = true;

export const load: PageServerLoad = async ({ url, cookies, platform }) => {
	const token = url.searchParams.get("token");
	log("token", token);

	if (!token) {
		log("No token found in URL");
		throw redirect(302, "/login");
	}

	const { db } = sys(platform);

	const email = await verify_token(db, token);
	if (!email) {
		log("Token verification failed");
		throw redirect(302, "/login");
	}

	cookies.set("token", token, {
		path: "/",
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		maxAge: 60 * 60 * 12,
	});
	log(`Authenticated as ${email}`);
	return { email };
};
