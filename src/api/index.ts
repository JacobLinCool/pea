import { building } from "$app/environment";
import { API } from "sveltekit-api";
import { version } from "../../package.json";

const api = new API(
	import.meta.glob("./**/*.ts"),
	{
		openapi: "3.0.0",
		info: {
			title: "Pure Email Auth API",
			version: version,
			description: "Pure Email Auth API",
			license: {
				name: "MIT",
				url: "https://github.com/JacobLinCool/pea/blob/main/LICENSE",
			},
		},
		externalDocs: {
			url: "https://github.com/JacobLinCool/pea",
		},
		...(building
			? {
					servers: [
						{
							url: "{protocol}://{host}",
							variables: {
								protocol: {
									default: "https",
									enum: ["http", "https"],
								},
								host: {
									default: "pea.csie.cool",
								},
							},
						},
					],
			  }
			: {}),
	},
	"/api",
	(r) => {
		r.registerComponent("securitySchemes", "bearerAuth", {
			type: "http",
			scheme: "bearer",
			bearerFormat: "JWT",
		});
	},
);

export default api;
