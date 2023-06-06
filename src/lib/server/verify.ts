import debug from "debug";
import type { Kysely } from "kysely";
import { JWT } from "sveltekit-jwt";
import { get_curves } from "./curve";
import type { DB } from "./db/types";

const log = debug("pea:token:verify");
log.enabled = true;

let _curves: ReturnType<typeof get_curves> | undefined;
let _last_update = 0;

function cached_curves(db: Kysely<DB>) {
	const now = Date.now();
	if (!_curves || now - _last_update > 1000 * 60) {
		_curves = get_curves(db);
		_last_update = now;
	}
	return _curves;
}

export async function verify_token(db: Kysely<DB>, token: string): Promise<string | undefined> {
	const curves = await cached_curves(db);

	const [header] = token.split(".");
	const header_json = JSON.parse(atob(header));
	const kid = parseInt(header_json.kid.split("-")[1]);
	const curve = kid ? curves.find((c) => c.id === kid) : curves[0];
	if (!curve) {
		log(`No curve found for kid ${kid}`);
		return;
	}

	const ok = await JWT.verify(
		token,
		{
			kty: "EC",
			alg: "ES256",
			key_ops: ["verify"],
			crv: curve.crv,
			x: curve.x,
			y: curve.y,
		},
		{ algorithm: "ES256" },
	);
	if (!ok) {
		log("Token verification failed");
		return;
	}

	const { payload } = JWT.decode(token);

	return payload.sub;
}
