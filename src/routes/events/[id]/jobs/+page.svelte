<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: any } = $props();

	let editingJobId = $state<string | null>(null);

	async function handleSubmit() {
		editingJobId = null;
		await invalidateAll();
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="mb-6">
		<a
			href="/events/{data.event.id}"
			class="text-link hover:text-link-hover mb-4 inline-flex items-center gap-2"
		>
			← Zurück zur Veranstaltung
		</a>
	</div>

	<h1 class="text-3xl font-bold mb-2">Aufgaben für {data.event.title}</h1>
	<p class="text-gray-600 mb-8">Verwalten Sie die Aufgaben dieser Veranstaltung</p>

	{#if form?.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{form.error}
		</div>
	{/if}

	<div class="mb-8">
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-2xl font-semibold">Aufgaben</h2>
			{#if data.user?.roles?.includes('admin')}
				<a
					href="/events/{data.event.id}/jobs/new"
					class="px-4 py-2 bg-success text-white rounded-md hover:bg-success-dark"
				>
					Neue Aufgabe hinzufügen
				</a>
			{/if}
		</div>

		{#if data.jobs.length === 0}
			<p class="text-gray-600 text-sm">Keine Aufgaben vorhanden.</p>
		{:else}
			<div class="space-y-3">
				{#each data.jobs as j (j.id)}
					{#if editingJobId === j.id}
						<form
							method="POST"
							action="?/updateJob"
							use:enhance={() => {
								return async ({ update }) => {
									await update();
									await handleSubmit();
								};
							}}
							class="p-4 bg-gray-50 rounded-md space-y-4"
						>
							<input type="hidden" name="id" value={j.id} />
							<div>
								<label
									for="edit-job-title-{j.id}"
									class="block text-sm font-medium text-gray-700 mb-1"
								>
									Titel *
								</label>
								<input
									type="text"
									id="edit-job-title-{j.id}"
									name="title"
									value={j.title}
									required
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div>
								<label
									for="edit-job-description-{j.id}"
									class="block text-sm font-medium text-gray-700 mb-1"
								>
									Beschreibung
								</label>
								<textarea
									id="edit-job-description-{j.id}"
									name="description"
									rows="2"
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									>{j.description || ''}</textarea
								>
							</div>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label
										for="edit-job-start-{j.id}"
										class="block text-sm font-medium text-gray-700 mb-1"
									>
										Startzeit *
									</label>
									<input
										type="time"
										id="edit-job-start-{j.id}"
										name="startTime"
										value={j.startTime}
										required
										class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
								<div>
									<label
										for="edit-job-end-{j.id}"
										class="block text-sm font-medium text-gray-700 mb-1"
									>
										Endzeit *
									</label>
									<input
										type="time"
										id="edit-job-end-{j.id}"
										name="endTime"
										value={j.endTime}
										required
										class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
								<div>
									<label
										for="edit-job-people-{j.id}"
										class="block text-sm font-medium text-gray-700 mb-1"
									>
										Anzahl Personen *
									</label>
									<input
										type="number"
										id="edit-job-people-{j.id}"
										name="numberOfPeople"
										value={j.numberOfPeople}
										min="1"
										required
										class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
							</div>
							<div class="flex gap-2">
								<button
									type="submit"
									class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
								>
									Speichern
								</button>
								<button
									type="button"
									onclick={() => (editingJobId = null)}
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
								<h5 class="font-medium">{j.title}</h5>
								{#if j.description}
									<p class="text-sm text-gray-600 mt-1">{j.description}</p>
								{/if}
								<p class="text-sm text-gray-500 mt-1">
									{j.startTime} - {j.endTime} ({j.assignedCount}/{j.numberOfPeople} Person{j.numberOfPeople !==
									1
										? 'en'
										: ''})
								</p>
								{#if j.assignments && j.assignments.length > 0}
									<div class="mt-2">
										<p class="text-sm font-medium text-gray-700">Zugewiesen:</p>
										<p class="text-sm text-gray-600">
											{j.assignments.map((a) => a.userName).join(', ')}
										</p>
									</div>
								{/if}
							</div>
							<div class="flex gap-2 flex-col md:flex-row">
								{#if data.user?.roles?.includes('admin')}
									<a
										href="/events/{data.event.id}/jobs/{j.id}/assign"
										class="px-3 py-1 text-sm bg-success text-white rounded-md hover:bg-success-dark"
									>
										Eltern zuweisen
									</a>
									<button
										onclick={() => (editingJobId = j.id)}
										class="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary-hover"
									>
										Bearbeiten
									</button>
									<form
										method="POST"
										action="?/deleteJob"
										use:enhance={() => {
											return async ({ update }) => {
												if (confirm('Möchten Sie diese Aufgabe wirklich löschen?')) {
													await update();
													await handleSubmit();
												}
											};
										}}
										class="inline"
									>
										<input type="hidden" name="id" value={j.id} />
										<button
											type="submit"
											class="px-3 py-1 text-sm bg-error text-white rounded-md hover:bg-error-dark"
										>
											Löschen
										</button>
									</form>
								{/if}
							</div>
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
