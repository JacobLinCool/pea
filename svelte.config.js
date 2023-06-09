import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/kit/vite";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		alias: {
			"$i18n/*": "./locales/*",
			"$db/*": "./db/*",
			"$api/*": "./src/api/*",
			$api: "./src/api/index",
		},
	},
};

export default config;
