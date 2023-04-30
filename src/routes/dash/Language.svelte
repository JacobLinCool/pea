<script lang="ts">
	import { get } from "$lib/preference";
	import { onMount, onDestroy } from "svelte";
	import { t, locale, locales } from "svelte-i18n";
	import { writable } from "svelte/store";

	let lang = writable<string | null | undefined>(undefined);
	let unsubscribe: () => void;

	onMount(() => {
		lang = get("lang", {
			default_value: window.navigator.language,
			ttl: 30 * 24 * 60 * 60 * 1000,
		});
		unsubscribe = lang.subscribe((value) => {
			if (value) {
				locale.set(value);
				document.querySelector("html")?.setAttribute("lang", value);
			}
		});
	});

	onDestroy(() => {
		unsubscribe?.();
	});
</script>

<div class="form-control w-full max-w-xs">
	<label class="label" for="language-select">
		<span class="label-text">{$t("language")}</span>
	</label>
	<select id="language-select" class="select-accent select" bind:value={$lang}>
		{#each $locales as lang}
			<option value={lang}>{$t(`lang.${lang}`)}</option>
		{/each}
	</select>
</div>
