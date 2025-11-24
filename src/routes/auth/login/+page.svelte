<script lang="ts">
	import { enhance } from '$app/forms';

	let message = $state<string | null>(null);
	let error = $state<string | null>(null);
</script>

<div class="max-w-md mx-auto mt-8">
	<h1 class="text-2xl font-bold mb-4">Klasse 1/2B</h1>
	<p class="text-gray-600 mb-4">
		Bitte gib deine E-Mail-Adresse ein, um einen Anmelde-Link zu erhalten.
	</p>

	{#if message}
		<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
			{message}
		</div>
	{/if}

	{#if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{error}
		</div>
	{/if}

	<form
		method="POST"
		use:enhance={() => {
			return async ({ result }) => {
				if (result?.type === 'success') {
					message = (result.data as any)?.message || 'Anmelde-Link wurde gesendet';
					error = null;
				} else if (result?.type === 'failure') {
					error = (result.data as any)?.error || 'Fehler beim Senden des Anmelde-Links';
					message = null;
				}
			};
		}}
	>
		<div class="mb-4">
			<label for="email" class="block text-sm font-medium mb-2"> E-Mail </label>
			<input
				type="email"
				id="email"
				name="email"
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md"
			/>
		</div>

		<button
			type="submit"
			class="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-hover"
		>
			Anmelde-Link senden
		</button>
	</form>
</div>
