<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const availableRoles = ['admin', 'parent'];
	let selectedRoles = $state<string[]>([]);
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
	<h1 class="text-3xl font-bold mb-8">Neuen Benutzer erstellen</h1>

	{#if form?.error}
		<div class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
			{form.error}
		</div>
	{/if}

	<form method="POST" action="?/create" use:enhance>
		<div class="bg-white rounded-lg shadow-md p-6 space-y-6">
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700 mb-2"> Name * </label>
				<input
					type="text"
					id="name"
					name="name"
					autocomplete="off"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>

			<div>
				<label for="email" class="block text-sm font-medium text-gray-700 mb-2"> E-Mail * </label>
				<input
					type="email"
					id="email"
					name="email"
					autocomplete="off"
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>

			<div>
				<div class="block text-sm font-medium text-gray-700 mb-2">Rollen</div>
				<div class="space-y-2">
					{#each availableRoles as role (role)}
						<label class="flex items-center">
							<input
								type="checkbox"
								name="roles"
								value={role}
								bind:group={selectedRoles}
								class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<span class="ml-2 text-sm text-gray-700">{role}</span>
						</label>
					{/each}
				</div>
			</div>

			<div class="flex gap-4">
				<button
					type="submit"
					class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary"
				>
					Erstellen
				</button>
				<a
					href="/users"
					class="px-6 py-2 bg-secondary-light text-text rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary inline-block text-center"
				>
					Abbrechen
				</a>
			</div>
		</div>
	</form>
</div>

<style>
	.container {
		min-height: 100vh;
	}
</style>
