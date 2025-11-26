<script lang="ts">
	import { enhance } from '$app/forms';

	interface Props {
		data: {
			showSignup?: boolean;
		};
	}

	let { data }: Props = $props();

	let message = $state<string | null>(null);
	let error = $state<string | null>(null);
</script>

{#if data.showSignup}
	<div class="max-w-md mx-auto mt-8">
		<h1 class="text-2xl font-bold mb-4">Ersten Benutzer erstellen</h1>

		{#if message}
			<div
				data-testid="message"
				class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
			>
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
			action="?/signup"
			use:enhance={() => {
				return async ({ result }) => {
					if (result?.type === 'success') {
						message =
							result.data?.message || 'Registrierung erfolgreich. Bitte prüfen Sie Ihre E-Mails.';
						error = null;
					} else if (result?.type === 'failure') {
						error = result.data?.error || 'Fehler bei der Registrierung';
						message = null;
					}
				};
			}}
		>
			<div class="mb-4">
				<label for="name" class="block text-sm font-medium mb-2">Name</label>
				<input
					type="text"
					id="name"
					name="name"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-md"
				/>
			</div>

			<div class="mb-4">
				<label for="email" class="block text-sm font-medium mb-2">E-Mail</label>
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
				>Registrieren</button
			>
		</form>
	</div>
{/if}
