<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: any } = $props();
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
	<div class="mb-6">
		<a
			href="/events/{data.event.id}/materials"
			class="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-2"
		>
			← Zurück zu Materialien
		</a>
	</div>

	<h1 class="text-3xl font-bold mb-8">Neues Material erstellen</h1>

	{#if form?.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{form.error}
		</div>
	{/if}

	<form
		method="POST"
		action="?/createMaterial"
		use:enhance
		class="bg-white p-6 rounded-lg shadow-md space-y-4"
	>
		<div>
			<label
				for="material-title"
				class="block text-sm font-medium text-gray-700 mb-1"
			>
				Titel *
			</label>
			<input
				type="text"
				id="material-title"
				name="title"
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>
		<div>
			<label
				for="material-description"
				class="block text-sm font-medium text-gray-700 mb-1"
			>
				Beschreibung
			</label>
			<textarea
				id="material-description"
				name="description"
				rows="2"
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			></textarea>
		</div>
		<div class="flex gap-4">
			<button
				type="submit"
				class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
			>
				Material hinzufügen
			</button>
			<a
				href="/events/{data.event.id}/materials"
				class="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
			>
				Abbrechen
			</a>
		</div>
	</form>
</div>

<style>
	.container {
		min-height: 100vh;
	}
</style>

