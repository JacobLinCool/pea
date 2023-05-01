<script lang="ts">
	import { get } from "$lib/preference";
	import type { Developer } from "$lib/server/db/schema";
	import { t } from "svelte-i18n";

	export let dev: Developer | null;

	let id = dev?.id ?? "";
	let name = dev?.name ?? "";

	let token = get("pea_token", { default_value: "", ttl: 6 * 60 * 60 * 1000 });

	let running = false;
	async function update() {
		if (running || !$token) {
			return;
		}
		running = true;

		try {
			const res = await fetch(`/api/dev/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${$token}`,
				},
				body: JSON.stringify({ name }),
			});
			if (res.ok) {
				dev = await res.json();
			}
		} catch (err) {
			console.error(err);
		} finally {
			running = false;
		}
	}
</script>

<div class="flex w-full flex-col items-center gap-4 p-4">
	<div class="card w-full max-w-xl">
		<div class="card-body">
			<div class="form-control w-full">
				<label class="label" for="">
					<span class="label-text">{$t("dash.dev-id")}</span>
				</label>
				<input
					type="text"
					placeholder={$t("dash.your-dev-id")}
					class="input-bordered input w-full"
					bind:value={id}
					on:input={() => (id = id.replace(/[^a-zA-Z0-9-_]/g, ""))}
					disabled={!!dev}
				/>
				<label class="label" for="">
					<span class="label-text">{$t("dash.dev-name")}</span>
				</label>
				<input
					type="text"
					placeholder={$t("dash.your-dev-name")}
					class="input-bordered input w-full"
					bind:value={name}
				/>

				<button class="btn-primary btn my-4" on:click={update} disabled={running}>
					{$t("dash.save")}
				</button>
			</div>
		</div>
	</div>
</div>
