<script lang="ts">
	import { t } from "svelte-i18n";

	let email = "";
	let error = "";

	let ok = false;
	let running = false;
	async function login() {
		if (running) {
			return;
		}
		running = true;

		try {
			const url = new URL(window.location.href);
			url.pathname = "/dash";
			const res = await fetch("/api/app/pea/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, callback: url.href }),
			});

			if (!res.ok) {
				const { message } = await res.json<{ message: string }>();
				throw new Error(message);
			}
			ok = true;
		} catch (err) {
			console.error(err);
			if (err instanceof Error) {
				error = err.message;
			}
		} finally {
			running = false;
		}
	}
</script>

<svelte:head>
	<title>PEA Login</title>
</svelte:head>

<div class="flex h-full w-full flex-col items-center justify-center">
	<div class="w-full max-w-sm">
		{#if !ok}
			<h1 class="mb-4 text-3xl font-bold">PEA Login</h1>
			<div class="form-control w-full">
				<div class="input-group w-full">
					<input
						type="text"
						placeholder="Enter Your Email"
						class="input-bordered input flex-1"
						bind:value={email}
						disabled={running}
					/>
					<button
						class="btn"
						class:animate-pulse={running}
						disabled={running}
						on:click={login}
					>
						Login
					</button>
				</div>
				{#if error}
					<p class="mt-2 text-error">{error}</p>
				{/if}
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center">
				<h1 class="mb-4 text-3xl font-bold">Check Your Email</h1>
				<p class="text-center italic text-primary">
					{email}
				</p>
			</div>
		{/if}
	</div>
</div>
