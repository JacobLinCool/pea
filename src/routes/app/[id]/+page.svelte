<script lang="ts">
	import type { PageData } from "./$types";

	export let data: PageData;

	let email = "";
	let error = "";
	let ok = false;
	let running = false;

	async function login() {
		if (!email || running) {
			return;
		}
		running = true;
		error = "";

		try {
			check_email();

			const search = new URLSearchParams(window.location.search);
			const url = new URL(search.get("callback") ?? search.get("cb") ?? window.location.href);

			const res = await fetch(`/api/app/${data.app.id}/login`, {
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
			} else {
				error = "Unknown Error";
			}
		} finally {
			running = false;
		}
	}

	function check_email() {
		if (!email) {
			throw new Error("Email is required");
		}

		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!regex.test(email)) {
			throw new Error("Invalid email");
		}
	}
</script>

<svelte:head>
	<title>Login {data.app.name}</title>
	<meta
		name="description"
		content="Use your email to login to {data.app.name}, an app by {data.app.owner}. {data.app
			.description}"
	/>
</svelte:head>

<div class="flex h-full w-full flex-col items-center justify-center p-4">
	<div class="w-full max-w-md">
		{#if !ok}
			<h1 class="mb-4 text-2xl font-bold">Login {data.app.name}</h1>
			<div class="form-control w-full">
				<div class="input-group w-full">
					<input
						type="text"
						placeholder="Enter Your Email"
						class="input-bordered input flex-1"
						bind:value={email}
						disabled={running}
						on:keydown={(evt) => evt.key === "Enter" && login()}
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
					<div class="alert alert-error mt-4">
						{error}
					</div>
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
