<script lang="ts">
	import type { PageData } from "./$types";

	export let data: PageData;

	const name = data.user.name || data.user.id || data.user.email;
</script>

<svelte:head>
	<title>{name} (@{data.user.id}) | PEA</title>
	<meta name="description" content="Find the apps made by {name} on PEA." />
</svelte:head>

<div class="h-full w-full overflow-auto p-4 py-12">
	<div class="flex w-full flex-col items-center gap-4">
		<div class="card w-full max-w-xl bg-base-100 shadow-md">
			<div class="card-body">
				<div class="flex items-center justify-between gap-4">
					<div class="flex flex-1 flex-col gap-1 lg:gap-2">
						<h1 class="text-2xl font-bold lg:text-4xl">{name}</h1>
						<p class="opacity-60 lg:text-xl">{data.user.email}</p>
					</div>
					{#if data.user.avatar}
						<div class="avatar">
							<div class="mask mask-squircle h-24 w-24">
								<img src={data.user.avatar} alt={name} />
							</div>
						</div>
					{/if}
				</div>
				{#if data.user.bio}
					<div class="divider" />
					<p>{data.user.bio}</p>
				{/if}
			</div>
		</div>
	</div>

	<div class="h-12 w-full" />

	<div class="flex w-full flex-col items-center gap-4">
		{#if data.apps.length}
			<h2 class="w-full max-w-xl px-2 text-xl font-medium">
				Apps made by {name}
			</h2>
		{/if}
		{#each data.apps as app}
			<svelte:element
				this={app.url ? "a" : "div"}
				class="contents"
				href={app.url || ""}
				target="_blank"
			>
				<div
					class="card w-full max-w-xl bg-base-100 shadow-md transition-all"
					class:hover:shadow-lg={app.url}
				>
					<div class="card-body">
						<div class="flex gap-4">
							{#if app.logo}
								<img
									src={app.logo}
									alt={app.name}
									class="mask mask-hexagon h-24 w-24"
								/>
							{/if}
							<div>
								<h1 class="card-title">{app.name}</h1>
								{#if app.description}
									<p>{app.description}</p>
								{/if}
							</div>
						</div>

						<div class="divider" />

						<p class="text-right">Created on {new Date(app.created).toDateString()}</p>
					</div>
				</div>
			</svelte:element>
		{/each}
	</div>

	<div class="h-4 w-full" />
</div>
