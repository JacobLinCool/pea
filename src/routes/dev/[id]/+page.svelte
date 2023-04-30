<script lang="ts">
	import App from "$lib/component/App.svelte";
	import type { PageData } from "./$types";

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.dev.name} (@{data.dev.id}) | PEA</title>
	<meta
		name="description"
		content="Find the best apps made by {data.dev.name} (@{data.dev.id}) on PEA."
	/>
</svelte:head>

<div class="flex w-full flex-col items-center gap-4 p-4">
	<div class="card w-full max-w-xl">
		<div class="card-body">
			<h1 class="card-title">{data.dev.name}</h1>
			<p class="opacity-50">{data.dev.email}</p>
		</div>
	</div>
</div>

<div class="flex w-full flex-col items-center gap-4 p-4">
	{#each data.apps as app}
		<App {app} />
	{/each}
</div>
