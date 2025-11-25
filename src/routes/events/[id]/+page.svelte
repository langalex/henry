<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: any } = $props();

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

	async function handleDelete() {
		await invalidateAll();
		await goto('/events');
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="mb-6">
		<a href="/events" class="text-link hover:text-link-hover mb-4 inline-flex items-center gap-2">
			← Zurück zur Übersicht
		</a>
	</div>

	{#if form?.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{form.error}
		</div>
	{/if}

	<div class="bg-white rounded-lg shadow-md p-6 mb-8">
		<div class="flex justify-between items-start mb-4 flex-col md:flex-row">
			<div class="flex-1">
				<h1 class="text-3xl font-bold mb-4">{data.event.title}</h1>
			</div>
			{#if data.user?.roles?.includes('admin')}
				<div class="flex gap-2">
					<a
						href="/events/{data.event.id}/edit"
						class="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-hover"
					>
						Bearbeiten
					</a>
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
							class="px-4 py-2 text-sm bg-error text-white rounded-md hover:bg-error-dark"
						>
							Löschen
						</button>
					</form>
				</div>
			{/if}
		</div>

		{#if data.event.description}
			<p class="text-gray-600 mb-4">{data.event.description}</p>
		{/if}
		<p class="text-sm text-gray-500">{formatDateTime(data.event.date, data.event.time)}</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<div>
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-2xl font-semibold">Aufgaben</h2>
				{#if data.user?.roles?.includes('admin')}
					<a
						href="/events/{data.event.id}/jobs"
						class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover text-sm"
					>
						Verwalten
					</a>
				{/if}
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
											class="px-3 py-1 text-sm bg-warning text-white rounded-md hover:bg-warning-dark"
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
											class="px-3 py-1 text-sm bg-success text-white rounded-md hover:bg-success-dark"
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
				{#if data.user?.roles?.includes('admin')}
					<a
						href="/events/{data.event.id}/materials"
						class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover text-sm"
					>
						Verwalten
					</a>
				{/if}
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
											class="px-3 py-1 text-sm bg-warning text-white rounded-md hover:bg-warning-dark"
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
											class="px-3 py-1 text-sm bg-success text-white rounded-md hover:bg-success-dark"
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
