import { get_curves } from "$lib/server/curve";
import { sys } from "$lib/server/sys";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ platform }) => {
	const { db } = sys(platform);

	const curves = await get_curves(db);

	return json(
		{
			keys: curves.map(({ id, created, crv, x, y }) => ({
				kty: "EC",
				alg: "ES256",
				use: "sig",
				kid: "pea-" + id.toString(),
				crv,
				x,
				y,
				created,
			})),
		},
		{
			headers: {
				"Cache-Control": "public, max-age=86400",
			},
		},
	);
};
