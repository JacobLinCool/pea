import { z } from "sveltekit-api";
import type { RouteConfig } from "sveltekit-api";

export const Param = z.object({
	slug: z.string().toLowerCase().describe("The slug of the Application."),
});

export const Modifier = (r: RouteConfig) => {
	r.tags = ["Application"];
	return r;
};
