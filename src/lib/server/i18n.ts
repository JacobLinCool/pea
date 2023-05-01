import { t } from "svelte-i18n";

async function translate(
	id: string,
	options?:
		| {
				locale?: string;
				format?: string;
				default?: string;
				values?: Record<string, string>;
		  }
		| undefined,
): Promise<string> {
	return new Promise((resolve) => {
		t.subscribe((t) => {
			return resolve(t(id, options));
		});
	});
}

export { translate as $t };
