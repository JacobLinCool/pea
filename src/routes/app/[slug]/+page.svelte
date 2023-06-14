<script lang="ts">
	import { get } from "$lib/preference";
	import { onMount } from "svelte";
	import { t } from "svelte-i18n";
	import { z } from "zod";
	import Icon from "@iconify/svelte";
	import type { PageData } from "./$types";

	export let data: PageData;

	let email = "";
	let error = "";
	let ok = false;
	let running = false;

	let emails =
		get<string[]>("emails", {
			fallback: [],
			ttl: 12 * 30 * 24 * 60 * 60 * 1000,
			checker: (value) => {
				if (!Array.isArray(value)) {
					return false;
				}

				z.array(z.string().email().max(256)).parse(value);

				return true;
			},
		}) ?? [];
	$: fast_email = $emails[0];

	onMount(() => {
		const search = new URLSearchParams(window.location.search);

		if (search.has("email")) {
			email = search.get("email") ?? "";
		}
	});

	async function login() {
		if (!email || running) {
			return;
		}
		running = true;
		error = "";

		try {
			check_email();

			const search = new URLSearchParams(window.location.search);
			const url = new URL(search.get("callback") || search.get("cb") || window.location.href);

			const res = await fetch(`/api/app/${data.app.slug}/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, callback: url.href }),
			});

			$emails = [...new Set([email, ...$emails])].slice(0, 3);

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
				error = $t("error.unknown");
			}
		} finally {
			running = false;
		}
	}

	function check_email() {
		if (!email) {
			throw new Error($t("error.email-is-required"));
		}

		if (!z.string().email().max(256).safeParse(email).success) {
			throw new Error($t("error.invalid-email"));
		}
	}
</script>

<svelte:head>
	<title>
		{$t("login.login-app-name", { values: { app: data.app.name } })}
	</title>
	<meta
		name="description"
		content="Use your email to login to {data.app.name}. {data.app.description}"
	/>
</svelte:head>

<div class="flex h-full w-full flex-col items-center justify-center p-4">
	<div class="w-full max-w-md">
		{#if !ok}
			<h1 class="mb-4 text-2xl font-bold">
				{$t("login.login-app-name", { values: { app: data.app.name } })}
			</h1>
			<div class="form-control w-full">
				<div class="input-group w-full">
					<input
						type="text"
						placeholder={$t("login.enter-your-email")}
						class="input-bordered input flex-1"
						bind:value={email}
						disabled={running}
						on:keydown={(evt) => evt.key === "Enter" && login()}
					/>
					<button
						class="btn-primary btn"
						class:animate-pulse={running}
						disabled={running}
						on:click={login}
					>
						{$t("login.login")}
					</button>
				</div>

				{#if $emails.length}
					<div class="mt-4 flex w-full justify-between gap-4">
						<button
							class="btn-ghost btn-sm btn flex-1 normal-case"
							on:click={() => {
								email = fast_email;
								login();
							}}
						>
							{fast_email}
						</button>

						{#if $emails.length > 1}
							<div class="flex-none">
								<div class="dropdown-end dropdown">
									<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
									<label tabindex="0" class="btn-square btn-sm btn" for="">
										<Icon icon="octicon:chevron-down-12" />
									</label>
									<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
									<ul
										tabindex="0"
										class="dropdown-content menu rounded-box z-10 w-72 bg-base-100 shadow"
									>
										{#each $emails as fast_email (fast_email)}
											<li>
												<button
													class="btn-ghost btn-sm btn flex w-full items-center justify-start normal-case"
													on:click={() => {
														email = fast_email;
														login();
													}}
												>
													{fast_email}
												</button>
											</li>
										{/each}
									</ul>
								</div>
							</div>
						{/if}
					</div>
				{/if}

				{#if error}
					<div class="alert alert-error mt-4">
						{error}
					</div>
				{/if}
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center">
				<h1 class="mb-4 text-3xl font-bold">{$t("login.check-your-email")}</h1>
				<p class="text-center italic text-primary">
					{email}
				</p>
				<p class="text-center text-sm italic opacity-60">
					{$t("login.you-can-close-this-window")}
				</p>
			</div>
		{/if}

		<div class="divider" />

		<div class="card w-full bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">{$t("app.about", { values: { name: data.app.name } })}</h2>
				{#if data.app.description}
					<p>{data.app.description}</p>
				{/if}

				{#if data.app.url}
					<p>
						<a class="link" href={data.app.url} target="_blank">{data.app.url}</a>
					</p>
				{/if}

				<p>
					Made by <a class="link" href="/user/{data.app.owner_email}"
						>{data.app.owner_email}</a
					>
				</p>
			</div>
		</div>
	</div>
</div>
