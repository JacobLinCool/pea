<script lang="ts">
	import { invalidateAll } from "$app/navigation";
	import { get } from "$lib/preference";

	export let editable = false;
	export let new_app = false;

	export let app: {
		id: string;
		name: string;
		description: string;
		created: number;
		domain?: string;
		secret?: string;
	};

	let token = get("pea_token");

	let running = false;
	let error = "";
	async function save() {
		if (running || !$token) {
			return;
		}
		running = true;

		try {
			let res = await fetch(`/api/app/${app.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${$token}`,
				},
				body: JSON.stringify({
					name: app.name,
					description: app.description,
					domain: app.domain,
					secret: app.secret,
				}),
			});

			if (!res.ok) {
				const result = await res.json<{ message?: string }>();
				throw new Error(result?.message);
			}
			error = "";
			await invalidateAll();
		} catch (err) {
			console.error(err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = "Unknown error";
			}
		} finally {
			running = false;
		}
	}
</script>

<div class="card w-full max-w-xl bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title items-end">
			{#if editable}
				<input
					type="text"
					class="input-ghost input hover:input-bordered"
					class:input-bordered={new_app}
					bind:value={app.name}
					placeholder="Application name"
				/>
			{:else}
				{app.name}
			{/if}
			<span class="text-sm">
				{#if new_app}
					<input
						type="text"
						class="input-ghost input input-sm hover:input-bordered"
						class:input-bordered={new_app}
						bind:value={app.id}
						on:input={() => (app.id = app.id.replace(/[^a-zA-Z0-9-_]/g, ""))}
						placeholder="Application ID"
					/>
				{:else}
					<span class="opacity-50"> #{app.id}</span>
				{/if}
			</span>
		</h2>
		<p>
			{#if editable}
				<textarea
					class="textarea-ghost textarea w-full hover:textarea-bordered"
					class:textarea-bordered={new_app}
					bind:value={app.description}
					placeholder="Application description"
				/>
			{:else}
				{app.description}
			{/if}
		</p>

		<p class="text-sm opacity-50">
			Since {new Date(app.created).toLocaleDateString()}
		</p>

		{#if editable}
			<div class="divider" />

			<div class="form-control">
				<label class="label" for="">
					<span class="label-text">Domain</span>
				</label>
				<input
					type="text"
					class="input-ghost input input-sm hover:input-bordered"
					class:input-bordered={new_app}
					bind:value={app.domain}
					placeholder="RegExp for allowed domains / paths"
				/>

				<label class="label" for="">
					<span class="label-text">Secret</span>
				</label>
				<input
					type="text"
					class="input-ghost input input-sm hover:input-bordered"
					class:input-bordered={new_app}
					bind:value={app.secret}
					placeholder="Secret for JWT signing"
				/>
			</div>

			<div class="card-actions justify-end">
				<button
					class="btn-outline btn-primary btn-sm btn mt-2"
					on:click={save}
					disabled={running}
				>
					Save
				</button>
			</div>
		{/if}

		{#if error}
			<div class="alert alert-error mt-4">{error}</div>
		{/if}
	</div>
</div>
