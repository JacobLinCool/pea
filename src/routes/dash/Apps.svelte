<script lang="ts">
	import App from "$lib/component/App.svelte";
	import type { Developer } from "$lib/server/db/schema";
	import { onMount } from "svelte";

	export let dev: Developer | null;

	let apps: {
		id: string;
		owner: string;
		name: string;
		description: string;
		created: number;
	}[] = [];

	let new_app = {
		id: "",
		name: "",
		description: "",
		created: Date.now(),
	};

	onMount(() => {
		fetch_apps();
	});

	async function fetch_apps() {
		if (!dev) {
			return;
		}

		const res = await fetch(`/api/dev/${dev.id}/app`);
		if (res.ok) {
			apps = (await res.json<{ apps: any[] }>()).apps;
		}
	}
</script>

{#if dev}
	<div class="flex w-full flex-col items-center gap-4 p-4">
		<App bind:app={new_app} editable={true} new_app={true} />
		{#each apps as app (app.id)}
			<App bind:app editable={true} />
		{/each}
	</div>
{/if}
