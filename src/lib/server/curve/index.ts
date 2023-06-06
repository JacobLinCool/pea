import type { Kysely } from "kysely";
import { error } from "@sveltejs/kit";
import type { DB } from "../db/types";

export async function create_curve(db: Kysely<DB>) {
	const module = "crypto";
	const subtle =
		crypto?.subtle ?? (await import(/* @vite-ignore */ module).then((m) => m.subtle));

	const crv = "P-256";

	const pair = await subtle.generateKey(
		{
			name: "ECDSA",
			namedCurve: crv,
		},
		true,
		["sign", "verify"],
	);

	const { d, x, y } = await subtle.exportKey("jwk", pair.privateKey);
	if (!d || !x || !y) {
		throw error(500, "Failed to generate private key");
	}

	const result = await db
		.insertInto("Curve")
		.values({ crv, d, x, y })
		.returningAll()
		.executeTakeFirst();
	if (!result) {
		throw error(500, "Failed to create curve");
	}

	return result;
}

/**
 * @throws 404 - Curve not found
 */
export async function get_curve(db: Kysely<DB>, id: number) {
	const result = await db
		.selectFrom("Curve")
		.selectAll()
		.where("Curve.id", "=", id)
		.executeTakeFirst();
	if (!result) {
		throw error(404, "Curve not found");
	}

	return result;
}

/**
 * @throws 404 - Curve not found
 */
export async function get_latest_curve(db: Kysely<DB>) {
	const result = await db
		.selectFrom("Curve")
		.selectAll()
		.where("Curve.revoked", "=", 0)
		.orderBy("Curve.created", "desc")
		.limit(1)
		.executeTakeFirst();
	if (!result) {
		throw error(404, "Curve not found");
	}

	return result;
}

export async function get_curves(db: Kysely<DB>, include_revoked = false) {
	const query = db.selectFrom("Curve").selectAll().orderBy("Curve.created", "desc");

	if (!include_revoked) {
		query.where("Curve.revoked", "=", 0);
	}

	return query.execute();
}

/**
 * @throws 404 - Curve not found
 */
export async function revoke_curve(db: Kysely<DB>, id: number) {
	const result = await db
		.updateTable("Curve")
		.set({ revoked: 1 })
		.where("Curve.id", "=", id)
		.executeTakeFirst();

	if (!result.numUpdatedRows) {
		throw error(404, "Curve not found");
	}
}
