import { browser } from "$app/environment";
import debug from "debug";
import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

const log = debug("preference");

export type PreferenceValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| PreferenceValue[]
	| { [key: string]: PreferenceValue };

const cache = new Map<string, Writable<PreferenceValue>>();

type PreferenceOptions<T extends PreferenceValue> = {
	fallback?: T;
	ttl?: number;
	checker?: (value: T) => boolean;
};

export class PreferenceError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "PreferenceError";
	}
}

export function get<T extends PreferenceValue = PreferenceValue>(
	key: string,
	{ fallback = undefined, ttl = 0, checker = undefined }: PreferenceOptions<T | undefined> = {},
): Writable<T> {
	try {
		if (checker && !checker(fallback)) {
			throw new Error();
		}
	} catch {
		throw new PreferenceError(`Invalid fallback value for ${key}`);
	}

	const cached = cache.get(key);
	if (cached) {
		return cached as Writable<T>;
	}

	function update(value: T) {
		if (browser) {
			try {
				if (checker && !checker(value)) {
					log("invalid", key, value);
					return;
				}
			} catch {
				throw new PreferenceError(`Invalid value for ${key}`);
			}

			localStorage.setItem(`preference:${key}`, JSON.stringify([Date.now(), value]));
			log("updated", key, value);
		}
	}

	if (browser) {
		const stored_value = localStorage.getItem(`preference:${key}`);
		if (stored_value) {
			const [timestamp, value] = JSON.parse(stored_value) as [number, T];
			try {
				if (checker && !checker(value)) {
					throw new Error();
				}
			} catch {
				throw new PreferenceError(`Invalid value for ${key}`);
			}

			if (Date.now() - timestamp < ttl) {
				const store = writable(value);
				log("restored", key, store);
				store.subscribe(update);
				cache.set(key, store);
				return store;
			}
		}
	}

	const store = writable(fallback);
	log("created", key, store);
	store.subscribe(update);
	cache.set(key, store);
	return store;
}
