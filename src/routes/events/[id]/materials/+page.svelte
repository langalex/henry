<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: any } = $props();

	let editingMaterialId = $state<string | null>(null);

	async function handleSubmit() {
		editingMaterialId = null;
		await invalidateAll();
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="mb-6">
		<a
			href="/events/{data.event.id}"
			class="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-2"
		>
			← Zurück zur Veranstaltung
		</a>
	</div>

	<h1 class="text-3xl font-bold mb-2">Materialien für {data.event.title}</h1>
	<p class="text-gray-600 mb-8">Verwalten Sie die Materialien dieser Veranstaltung</p>

	{#if form?.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{form.error}
		</div>
	{/if}

	<div class="mb-8">
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-2xl font-semibold">Materialien</h2>
			{#if data.user?.roles?.includes('admin')}
				<a
					href="/events/{data.event.id}/materials/new"
					class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
				>
					Neues Material hinzufügen
				</a>
			{/if}
		</div>

		{#if data.materials.length === 0}
			<p class="text-gray-600 text-sm">Keine Materialien vorhanden.</p>
		{:else}
			<div class="space-y-3">
				{#each data.materials as m (m.id)}
					{#if editingMaterialId === m.id}
						<form
							method="POST"
							action="?/updateMaterial"
							use:enhance={() => {
								return async ({ update }) => {
									await update();
									await handleSubmit();
								};
							}}
							class="p-4 bg-gray-50 rounded-md space-y-4"
						>
							<input type="hidden" name="id" value={m.id} />
							<div>
								<label
									for="edit-material-title-{m.id}"
									class="block text-sm font-medium text-gray-700 mb-1"
								>
									Titel *
								</label>
								<input
									type="text"
									id="edit-material-title-{m.id}"
									name="title"
									value={m.title}
									required
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div>
								<label
									for="edit-material-description-{m.id}"
									class="block text-sm font-medium text-gray-700 mb-1"
								>
									Beschreibung
								</label>
								<textarea
									id="edit-material-description-{m.id}"
									name="description"
									rows="2"
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									>{m.description || ''}</textarea
								>
							</div>
							<div class="flex gap-2">
								<button
									type="submit"
									class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
								>
									Speichern
								</button>
								<button
									type="button"
									onclick={() => (editingMaterialId = null)}
									class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
								>
									Abbrechen
								</button>
							</div>
						</form>
					{:else}
						<div
							class="p-4 bg-gray-50 rounded-md flex flex-col md:flex-row md:items-start md:justify-between gap-2"
						>
							<div class="flex-1">
								<h5 class="font-medium">{m.title}</h5>
								{#if m.description}
									<p class="text-sm text-gray-600 mt-1">{m.description}</p>
								{/if}
							</div>
							{#if data.user?.roles?.includes('admin')}
								<div class="flex gap-2">
									<a
										href="/events/{data.event.id}/materials/{m.id}/assign"
										class="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
									>
										Eltern zuweisen
									</a>
									<button
										onclick={() => (editingMaterialId = m.id)}
										class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
									>
										Bearbeiten
									</button>
									<form
										method="POST"
										action="?/deleteMaterial"
										use:enhance={() => {
											return async ({ update }) => {
												if (confirm('Möchten Sie dieses Material wirklich löschen?')) {
													await update();
													await handleSubmit();
												}
											};
										}}
										class="inline"
									>
										<input type="hidden" name="id" value={m.id} />
										<button
											type="submit"
											class="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
										>
											Löschen
										</button>
									</form>
								</div>
							{/if}
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		min-height: 100vh;
	}
</style>
