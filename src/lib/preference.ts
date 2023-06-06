import { browser } from "$app/environment";
import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

type PreferenceValue = string | null | undefined;

const cache = new Map<string, Writable<PreferenceValue>>();

type PreferenceOptions = {
	default_value?: PreferenceValue;
	ttl?: number;
};

export function get(
	key: string,
	{ default_value = undefined, ttl = 0 }: PreferenceOptions = {},
): Writable<PreferenceValue> {
	const cached = cache.get(key);
	if (cached) return cached;

	function update(value: PreferenceValue) {
		if (browser) {
			localStorage.setItem(`preference:${key}`, JSON.stringify([Date.now(), value]));
			console.log("[preference]", "updated", key, value);
		}
	}

	if (browser) {
		const stored_value = localStorage.getItem(`preference:${key}`);
		if (stored_value) {
			const [timestamp, value] = JSON.parse(stored_value) as [number, PreferenceValue];
			if (Date.now() - timestamp < ttl) {
				const store = writable(value);
				console.log("[preference]", "restored", key, store);
				store.subscribe(update);
				cache.set(key, store);
				return store;
			}
		}
	}

	const store = writable(default_value);
	console.log("[preference]", "created", key, store);
	store.subscribe(update);
	cache.set(key, store);
	return store;
}
