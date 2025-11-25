<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: any } = $props();
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
	<div class="mb-6">
		<a
			href="/events/{data.event.id}"
			class="text-link hover:text-link-hover mb-4 inline-flex items-center gap-2"
		>
			← Zurück zur Veranstaltung
		</a>
	</div>

	<h1 class="text-3xl font-bold mb-8">Veranstaltung bearbeiten</h1>

	{#if form?.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{form.error}
		</div>
	{/if}

	<form
		method="POST"
		action="?/updateEvent"
		use:enhance
		class="bg-white p-6 rounded-lg shadow-md space-y-4"
	>
		<div>
			<label for="title" class="block text-sm font-medium text-gray-700 mb-1"> Titel * </label>
			<input
				type="text"
				id="title"
				name="title"
				value={data.event.title}
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>
		<div>
			<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
				Beschreibung
			</label>
			<textarea
				id="description"
				name="description"
				rows="3"
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				>{data.event.description || ''}</textarea
			>
		</div>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<label for="date" class="block text-sm font-medium text-gray-700 mb-1"> Datum * </label>
				<input
					type="date"
					id="date"
					name="date"
					value={data.event.date}
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
			<div>
				<label for="time" class="block text-sm font-medium text-gray-700 mb-1"> Uhrzeit * </label>
				<input
					type="time"
					id="time"
					name="time"
					value={data.event.time}
					required
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
		</div>
		<div class="flex gap-4 flex-col md:flex-row">
			<button
				type="submit"
				class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary"
			>
				Speichern
			</button>
			<a
				href="/events/{data.event.id}"
				class="px-6 py-2 bg-secondary-light text-center rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary"
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

