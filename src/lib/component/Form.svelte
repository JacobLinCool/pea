<script lang="ts">
	import type { z } from "zod";

	export let schema: z.ZodSchema;
	export let data: any;
	export let ignore: string[] = [];
	export let readonly: string[] | boolean = [];
	export let large: string[] | boolean = [];

	let is_record = "shape" in schema;
	// @ts-expect-error
	let shape: Record<string, z.ZodSchema> = schema.shape;
	// @ts-expect-error
	let name: string = schema._def.description || schema._def.typeName;

	const id = Math.random().toString(36).substring(2);
	let value = data;
	let errors: string[] = [];

	$: update(value);

	const type = // @ts-expect-error
		("innerType" in schema._def ? schema._def.innerType._def.typeName : schema._def.typeName)
			?.toLowerCase()
			.replace("zod", "");

	function update(val: string) {
		if (val === data) {
			return;
		}

		if (val === "" && schema.isNullable()) {
			data = null;
			errors = [];
			return;
		}

		if (val === "" && schema.isOptional()) {
			data = undefined;
			errors = [];
			return;
		}

		const result = schema.safeParse(val);
		if (result.success) {
			data = result.data;
			value = data;
			errors = [];
		} else {
			console.log(result.error.errors);
			errors = result.error.errors.map((e) => e.message);
		}
	}
</script>

{#if is_record}
	{#each Object.entries(shape) as [key, schema]}
		{#if !ignore.includes(key)}
			<svelte:self
				{schema}
				bind:data={data[key]}
				readonly={readonly === true || (Array.isArray(readonly) && readonly.includes(key))}
				large={large === true || (Array.isArray(large) && large.includes(key))}
			/>
		{/if}
	{/each}
{:else}
	<div class="w-full">
		<label class="label" for={id}>
			<span class="label-text">
				{name}
				{#if schema.isNullable() || schema.isOptional()}
					<span class="opacity-50"> (optional)</span>
				{/if}
			</span>
		</label>
		{#if large}
			<textarea
				{id}
				class="textarea-bordered textarea w-full"
				class:textarea-success={value && errors.length === 0 && readonly !== true}
				class:textarea-error={value && errors.length > 0 && readonly !== true}
				bind:value
				disabled={readonly === true}
			/>
		{:else if type === "number"}
			<input
				{id}
				class="input-bordered input w-full"
				class:input-success={value && errors.length === 0 && readonly !== true}
				class:input-error={value && errors.length > 0 && readonly !== true}
				type="number"
				bind:value
				disabled={readonly === true}
			/>
		{:else}
			<input
				{id}
				class="input-bordered input w-full"
				class:input-success={value && errors.length === 0 && readonly !== true}
				class:input-error={value && errors.length > 0 && readonly !== true}
				bind:value
				disabled={readonly === true}
			/>
		{/if}
		{#if errors.length}
			<div class="alert alert-error mt-2">
				<ul class="list-disc px-4 text-left">
					{#each errors as error}
						<li>{error}</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
{/if}
