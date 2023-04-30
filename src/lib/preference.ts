import { browser } from "$app/environment";
import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

type Val = string | null | undefined;

const cache = new Map<string, Writable<Val>>();

export function get(
	key: string,
	{ default_value = undefined as Val, ttl = 0 } = {},
): Writable<Val> {
	const cached = cache.get(key);
	if (cached) {
		console.log("[preference]", "cached", key, cached);
		return cached;
	}

	function update(value: Val) {
		if (browser) {
			localStorage.setItem(`preference:${key}`, JSON.stringify([Date.now(), value]));
			console.log("[preference]", "updated", key, value);
		}
	}

	if (browser) {
		const value = localStorage.getItem(`preference:${key}`);
		if (value) {
			const data: [number, Val] = JSON.parse(value);
			if (Date.now() - data[0] < ttl) {
				const store = writable(data[1]);
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
