<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: any } = $props();

	let editing = $state(false);

	function isFutureEvent(event: { date: string; time: string }) {
		const eventDateTime = new Date(`${event.date}T${event.time}`);
		return eventDateTime >= new Date();
	}

	function formatDateTime(date: string, time: string) {
		const d = new Date(`${date}T${time}`);
		return d.toLocaleString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	async function handleSubmit() {
		editing = false;
		await invalidateAll();
	}

	async function handleDelete() {
		await invalidateAll();
		await goto('/events');
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="mb-6">
		<a href="/events" class="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-2">
			← Zurück zur Übersicht
		</a>
	</div>

	{#if form?.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{form.error}
		</div>
	{/if}

	<div class="bg-white rounded-lg shadow-md p-6 mb-8">
		<div class="flex justify-between items-start mb-4">
			<div class="flex-1">
				{#if editing}
					<h1 class="text-3xl font-bold mb-4">Veranstaltung bearbeiten</h1>
				{:else}
					<h1 class="text-3xl font-bold mb-4">{data.event.title}</h1>
				{/if}
			</div>
			{#if data.user?.roles?.includes('admin')}
				<div class="flex gap-2">
					{#if editing}
						<button
							onclick={() => (editing = false)}
							class="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
						>
							Abbrechen
						</button>
					{:else}
						<button
							onclick={() => (editing = true)}
							class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
						>
							Bearbeiten
						</button>
						<form
							method="POST"
							action="?/deleteEvent"
							use:enhance={() => {
								return async ({ update }) => {
									if (confirm('Möchten Sie diese Veranstaltung wirklich löschen?')) {
										await update();
										await handleDelete();
									}
								};
							}}
							class="inline"
						>
							<button
								type="submit"
								class="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
							>
								Löschen
							</button>
						</form>
					{/if}
				</div>
			{/if}
		</div>

		{#if editing}
			<form
				method="POST"
				action="?/updateEvent"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						await handleSubmit();
					};
				}}
				class="space-y-4"
			>
				<div>
					<label for="edit-title" class="block text-sm font-medium text-gray-700 mb-1">
						Titel *
					</label>
					<input
						type="text"
						id="edit-title"
						name="title"
						value={data.event.title}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<div>
					<label for="edit-description" class="block text-sm font-medium text-gray-700 mb-1">
						Beschreibung
					</label>
					<textarea
						id="edit-description"
						name="description"
						rows="3"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>{data.event.description || ''}</textarea
					>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="edit-date" class="block text-sm font-medium text-gray-700 mb-1">
							Datum *
						</label>
						<input
							type="date"
							id="edit-date"
							name="date"
							value={data.event.date}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label for="edit-time" class="block text-sm font-medium text-gray-700 mb-1">
							Uhrzeit *
						</label>
						<input
							type="time"
							id="edit-time"
							name="time"
							value={data.event.time}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>
				<button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
					Speichern
				</button>
			</form>
		{:else}
			{#if data.event.description}
				<p class="text-gray-600 mb-4">{data.event.description}</p>
			{/if}
			<p class="text-sm text-gray-500">{formatDateTime(data.event.date, data.event.time)}</p>
		{/if}
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<div>
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-2xl font-semibold">Aufgaben</h2>
				<a
					href="/events/{data.event.id}/jobs"
					class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
				>
					Verwalten
				</a>
			</div>
			{#if data.event.jobs.length === 0}
				<p class="text-gray-600 text-sm">Keine Aufgaben vorhanden.</p>
			{:else}
				<div class="space-y-3">
					{#each data.event.jobs as j (j.id)}
						<div
							class="p-4 bg-gray-50 rounded-md flex flex-col md:flex-row md:items-start md:justify-between gap-2"
						>
							<div class="flex-1">
								<h3 class="font-medium mb-2">{j.title}</h3>
								{#if j.description}
									<p class="text-sm text-gray-600 mb-2">{j.description}</p>
								{/if}
								<p class="text-sm text-gray-500">
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
							<div class="flex gap-2">
								{#if j.isAssigned}
									<form
										method="POST"
										action="?/unassignJob"
										use:enhance={() => {
											return async ({ update }) => {
												await update();
												await invalidateAll();
											};
										}}
										class="inline"
									>
										<input type="hidden" name="jobId" value={j.id} />
										<button
											type="submit"
											class="px-3 py-1 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700"
										>
											Von Aufgabe abmelden
										</button>
									</form>
								{:else if j.assignedCount < j.numberOfPeople}
									<form
										method="POST"
										action="?/assignJob"
										use:enhance={() => {
											return async ({ update }) => {
												await update();
												await invalidateAll();
											};
										}}
										class="inline"
									>
										<input type="hidden" name="jobId" value={j.id} />
										<button
											type="submit"
											class="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
										>
											Aufgabe übernehmen
										</button>
									</form>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div>
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-2xl font-semibold">Materialien</h2>
				<a
					href="/events/{data.event.id}/materials"
					class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
				>
					Verwalten
				</a>
			</div>
			{#if data.event.materials.length === 0}
				<p class="text-gray-600 text-sm">Keine Materialien vorhanden.</p>
			{:else}
				<div class="space-y-3">
					{#each data.event.materials as m (m.id)}
						<div
							class="p-4 bg-gray-50 rounded-md flex flex-col md:flex-row md:items-start md:justify-between gap-2"
						>
							<div class="flex-1">
								<h3 class="font-medium mb-2">{m.title}</h3>
								{#if m.description}
									<p class="text-sm text-gray-600 mb-2">{m.description}</p>
								{/if}
								{#if m.assignments && m.assignments.length > 0}
									<div class="mt-2">
										<p class="text-sm font-medium text-gray-700">Zugewiesen:</p>
										<p class="text-sm text-gray-600">
											{m.assignments.map((a) => a.userName).join(', ')}
										</p>
									</div>
								{/if}
							</div>
							<div class="flex gap-2">
								{#if m.isAssigned}
									<form
										method="POST"
										action="?/unassignMaterial"
										use:enhance={() => {
											return async ({ update }) => {
												await update();
												await invalidateAll();
											};
										}}
										class="inline"
									>
										<input type="hidden" name="materialId" value={m.id} />
										<button
											type="submit"
											class="px-3 py-1 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700"
										>
											Doch nicht mitbringen
										</button>
									</form>
								{:else}
									<form
										method="POST"
										action="?/assignMaterial"
										use:enhance={() => {
											return async ({ update }) => {
												await update();
												await invalidateAll();
											};
										}}
										class="inline"
									>
										<input type="hidden" name="materialId" value={m.id} />
										<button
											type="submit"
											class="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
										>
											Material mitbringen
										</button>
									</form>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.container {
		min-height: 100vh;
	}
</style>
