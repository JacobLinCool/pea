<script lang="ts">
	import { goto } from "$app/navigation";
	import { get } from "$lib/preference";
	import type { Developer } from "$lib/server/db/schema";
	import { onMount } from "svelte";
	import Apps from "./Apps.svelte";
	import Dev from "./Dev.svelte";
	import Language from "./Language.svelte";

	let token = get("pea_token", { default_value: "", ttl: 6 * 60 * 60 * 1000 });
	let dev: Developer | null = null;
	$: {
		console.log(dev);
	}

	onMount(async () => {
		await check_param();
		check_expired();

		if (!$token) {
			await goto("/login");
		}

		get_dev();
	});

	async function check_param() {
		const url = new URL(window.location.href);
		const params = new URLSearchParams(url.search);
		const t = params.get("token");
		if (t) {
			$token = t;
			await goto("/dash", { replaceState: true });
		}
	}

	function check_expired() {
		if ($token) {
			try {
				const [header, payload, signature] = $token.split(".");
				const { exp } = JSON.parse(atob(payload));
				if (exp * 1000 < Date.now()) {
					$token = "";
				}
			} catch {}
		}
	}

	async function get_dev() {
		if ($token) {
			const [header, payload, signature] = $token.split(".");
			const { sub } = JSON.parse(atob(payload));
			const res = await fetch(`/api/dev?email=${sub}`);
			if (res.ok) {
				dev = await res.json();
			}
		}
	}
</script>

<svelte:head>
	<title>PEA Developer Dashboard</title>
</svelte:head>

<div class="h-full w-full overflow-auto">
	<div class="flex h-full w-full flex-col items-center justify-start gap-6 p-4">
		<div class="text-3xl font-bold">PEA Developer Dashboard</div>

		{#key dev?.id}
			{#if $token}
				<Dev bind:dev />
				<Apps {dev} />
			{/if}
		{/key}

		<Language />

		<div class="p-2" />
	</div>
</div>
