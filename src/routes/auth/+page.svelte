<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

	onMount(() => {
		goto("/dash", { invalidateAll: true });
	});
</script>

<div class="flex h-full w-full items-center justify-center p-4">
	<div class="card w-full max-w-lg">
		<div class="card-body">
			<h1 class="card-title">Authenticated!</h1>
			<p>You are logged in. Redirecting to dashboard ...</p>
		</div>
	</div>
</div>
