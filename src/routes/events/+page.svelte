<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: any } = $props();

	let editingEventId = $state<string | null>(null);

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
		editingEventId = null;
		await invalidateAll();
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<h1 class="text-3xl font-bold mb-8">Veranstaltungen</h1>

	{#if form?.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{form.error}
		</div>
	{/if}

	{#if form?.success}
		<div class="bg-green-100 border border-green-400 text-green-900 text700 px-4 py-3 rounded mb-4">
			Erfolgreich gespeichert!
		</div>
	{/if}

	<div class="mb-8 flex justify-between items-center">
		<h2 class="text-2xl font-semibold">Veranstaltungen</h2>
		<a
			href="/events/new"
			class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
		>
			Neue Veranstaltung erstellen
		</a>
	</div>

	<div>
		{#if data.events.length === 0}
			<p class="text-gray-600">Keine Veranstaltungen vorhanden.</p>
		{:else}
			<div class="space-y-6">
				{#each data.events as evt (evt.id)}
					<div class="bg-white rounded-lg shadow-md p-6">
						<div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
							<div class="flex-1">
								<a
									href="/events/{evt.id}"
									class="text-xl font-semibold mb-2 text-blue-600 hover:text-blue-800 hover:underline block"
								>
									{evt.title}
								</a>
								{#if evt.description}
									<p class="text-gray-600 mb-2">{evt.description}</p>
								{/if}
								<p class="text-sm text-gray-500">
									{formatDateTime(evt.date, evt.time)}
								</p>
							</div>
							<div class="flex gap-2">
								{#if editingEventId === evt.id}
									<button
										onclick={() => (editingEventId = null)}
										class="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
									>
										Abbrechen
									</button>
								{:else}
									<button
										onclick={() => (editingEventId = evt.id)}
										class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
									>
										Bearbeiten
									</button>
									{#if isFutureEvent(evt)}
										<form
											method="POST"
											action="?/deleteEvent"
											use:enhance={() => {
												return async ({ update }) => {
													if (confirm('Möchten Sie diese Veranstaltung wirklich löschen?')) {
														await update();
														await handleSubmit();
													}
												};
											}}
											class="inline"
										>
											<input type="hidden" name="id" value={evt.id} />
											<button
												type="submit"
												class="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
											>
												Löschen
											</button>
										</form>
									{/if}
								{/if}
							</div>
						</div>

						{#if editingEventId === evt.id}
							<form
								method="POST"
								action="?/updateEvent"
								use:enhance={() => {
									return async ({ update }) => {
										await update();
										await handleSubmit();
									};
								}}
								class="mt-4 space-y-4 border-t pt-4"
							>
								<input type="hidden" name="id" value={evt.id} />
								<div>
									<label
										for="edit-title-{evt.id}"
										class="block text-sm font-medium text-gray-700 mb-1"
									>
										Titel *
									</label>
									<input
										type="text"
										id="edit-title-{evt.id}"
										name="title"
										value={evt.title}
										required
										class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
								<div>
									<label
										for="edit-description-{evt.id}"
										class="block text-sm font-medium text-gray-700 mb-1"
									>
										Beschreibung
									</label>
									<textarea
										id="edit-description-{evt.id}"
										name="description"
										rows="3"
										class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										>{evt.description || ''}</textarea
									>
								</div>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label
											for="edit-date-{evt.id}"
											class="block text-sm font-medium text-gray-700 mb-1"
										>
											Datum *
										</label>
										<input
											type="date"
											id="edit-date-{evt.id}"
											name="date"
											value={evt.date}
											required
											class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
									<div>
										<label
											for="edit-time-{evt.id}"
											class="block text-sm font-medium text-gray-700 mb-1"
										>
											Uhrzeit *
										</label>
										<input
											type="time"
											id="edit-time-{evt.id}"
											name="time"
											value={evt.time}
											required
											class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
								</div>
								<button
									type="submit"
									class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
								>
									Speichern
								</button>
							</form>
						{/if}
					</div>
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
