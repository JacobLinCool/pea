<script lang="ts">
	import Form from "$lib/component/Form.svelte";
	import { ApplicationSchema, UserSchema } from "$lib/validate";
	import { t } from "svelte-i18n";
	import type { z } from "zod";
	import type { PageData } from "./$types";
	import Language from "./Language.svelte";

	export let data: PageData;
	$: console.log(data.user);

	let new_app: z.infer<typeof ApplicationSchema> = {
		created: "",
		id: 0,
		slug: "",
		name: "",
		active: 1,
		accept_url: "^https://.+$",
		owner_email: data.user.email,
		allowlist: "^.+$",
		description: null,
		url: null,
		logo: null,
		color: null,
	};

	let saving = false;
	async function save_profile() {
		if (saving) {
			return;
		}
		saving = true;

		try {
			const res = await fetch(`/api/user/${data.user.email}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data.user),
			});

			if (!res.ok) {
				throw new Error(await res.text());
			}

			data.user = await res.json();
		} catch (e) {
			console.error(e);
		} finally {
			saving = false;
		}
	}

	let creating = false;
	async function create_app() {
		if (creating) {
			return;
		}
		creating = true;

		try {
			const res = await fetch(`/api/app/${new_app.slug}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(new_app),
			});

			if (!res.ok) {
				throw new Error(await res.text());
			}

			data.apps.unshift(await res.json());
			data.apps = data.apps;
			new_app = {
				created: "",
				id: 0,
				slug: "",
				name: "",
				active: 1,
				accept_url: "^https://.+$",
				owner_email: data.user.email,
				allowlist: "^.+$",
				description: null,
				url: null,
				logo: null,
				color: null,
			};
			const checkbox = document.querySelector<HTMLInputElement>("#create-new-app");
			if (checkbox) {
				checkbox.checked = false;
			}
		} catch (e) {
			console.error(e);
		} finally {
			creating = false;
		}
	}

	let updating = false;
	async function update_app(app: (typeof data.apps)[0]) {
		if (updating) {
			return;
		}
		updating = true;

		try {
			const res = await fetch(`/api/app/${app.slug}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(app),
			});

			if (!res.ok) {
				throw new Error(await res.text());
			}

			data.apps = data.apps;
		} catch (e) {
			console.error(e);
		} finally {
			updating = false;
		}
	}
</script>

<svelte:head>
	<title>{$t("dash.pea-developer-dashboard")}</title>
</svelte:head>

<div class="h-full w-full overflow-auto">
	<div class="flex min-h-full w-full flex-col items-center justify-start gap-6 overflow-auto p-4">
		<div class="text-3xl font-bold">{$t("dash.pea-developer-dashboard")}</div>

		<div
			class="collapse-arrow collapse w-full max-w-lg bg-base-100 shadow-md transition-all focus-within:shadow-lg hover:shadow-lg"
		>
			<input type="checkbox" />
			<div class="collapse-title text-xl font-medium">User Profile</div>
			<div class="collapse-content overflow-auto">
				<div class="card w-full">
					<div class="card-body w-full">
						<Form
							schema={UserSchema}
							bind:data={data.user}
							ignore={["created"]}
							readonly={["email"]}
							large={["bio"]}
						/>

						<button
							class="btn-primary btn mt-4"
							class:animate-pulse={saving}
							on:click={save_profile}
							disabled={saving}
						>
							{$t("dash.save")}
						</button>
					</div>
				</div>
			</div>
		</div>

		<div class="w-full max-w-lg">
			<div class="divider" />
		</div>

		<h1 class="text-xl font-medium">Applications</h1>

		<div
			class="collapse-arrow collapse w-full max-w-lg bg-base-100 shadow-md transition-all focus-within:shadow-lg hover:shadow-lg"
		>
			<input id="create-new-app" type="checkbox" />
			<div class="collapse-title text-xl font-medium">Create New Application</div>
			<div class="collapse-content overflow-auto">
				<div class="card w-full">
					<div class="card-body w-full">
						{#key data.apps.length}
							<Form
								schema={ApplicationSchema}
								bind:data={new_app}
								ignore={["id", "created", "owner_email", "active"]}
								large={["description"]}
							/>
						{/key}

						<button
							class="btn-primary btn mt-4"
							class:animate-pulse={creating}
							on:click={create_app}
							disabled={creating}
						>
							{$t("dash.create")}
						</button>
					</div>
				</div>
			</div>
		</div>

		{#each data.apps as app}
			<div
				class="collapse-arrow collapse w-full max-w-lg bg-base-100 shadow-md transition-all focus-within:shadow-lg hover:shadow-lg"
			>
				<input type="checkbox" />
				<div class="collapse-title text-xl font-medium">{app.name}</div>
				<div class="collapse-content overflow-auto">
					<div class="card w-full">
						<div class="card-body w-full">
							<Form
								schema={ApplicationSchema}
								bind:data={app}
								ignore={["id", "created", "owner_email"]}
								readonly={["slug"]}
								large={["description"]}
							/>

							<button
								class="btn-primary btn mt-4"
								class:animate-pulse={updating}
								on:click={() => update_app(app)}
								disabled={updating}
							>
								{$t("dash.update")}
							</button>
						</div>
					</div>
				</div>
			</div>
		{/each}

		<Language />

		<div class="p-2" />
	</div>
</div>
