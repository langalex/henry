<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: any } = $props();

	let editingEventId = $state<string | null>(null);
	let editingJobId = $state<string | null>(null);
	let editingMaterialId = $state<string | null>(null);
	let expandedEventId = $state<string | null>(null);

	const editingEvent = $derived(
		editingEventId ? data.events.find((e) => e.id === editingEventId) : null
	);
	const editingJob = $derived(
		editingJobId
			? data.events
					.flatMap((e) => e.jobs.map((j) => ({ ...j, eventId: e.id })))
					.find((j) => j.id === editingJobId)
			: null
	);
	const editingMaterial = $derived(
		editingMaterialId
			? data.events
					.flatMap((e) => e.materials.map((m) => ({ ...m, eventId: e.id })))
					.find((m) => m.id === editingMaterialId)
			: null
	);

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
		editingJobId = null;
		editingMaterialId = null;
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
								<h3 class="text-xl font-semibold mb-2">{evt.title}</h3>
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
										onclick={() => {
											editingEventId = evt.id;
											editingJobId = null;
											editingMaterialId = null;
										}}
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

						<button
							onclick={() => (expandedEventId = expandedEventId === evt.id ? null : evt.id)}
							class="mt-4 text-sm text-blue-600 hover:text-blue-800"
						>
							{expandedEventId === evt.id
								? 'Weniger anzeigen'
								: 'Aufgaben und Materialien anzeigen'}
						</button>

						{#if expandedEventId === evt.id}
							<div class="mt-6 space-y-6 border-t pt-6">
								<div>
									<h4 class="text-lg font-semibold mb-4">Aufgaben</h4>
									{#if editingJobId === null || editingJob?.eventId !== evt.id}
										<form
											method="POST"
											action="?/createJob"
											use:enhance={() => {
												return async ({ update }) => {
													await update();
													await handleSubmit();
												};
											}}
											class="mb-4 p-4 bg-gray-50 rounded-md space-y-4"
										>
											<input type="hidden" name="eventId" value={evt.id} />
											<div>
												<label
													for="job-title-{evt.id}"
													class="block text-sm font-medium text-gray-700 mb-1"
												>
													Titel *
												</label>
												<input
													type="text"
													id="job-title-{evt.id}"
													name="title"
													required
													class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											</div>
											<div>
												<label
													for="job-description-{evt.id}"
													class="block text-sm font-medium text-gray-700 mb-1"
												>
													Beschreibung
												</label>
												<textarea
													id="job-description-{evt.id}"
													name="description"
													rows="2"
													class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
												></textarea>
											</div>
											<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
												<div>
													<label
														for="job-start-{evt.id}"
														class="block text-sm font-medium text-gray-700 mb-1"
													>
														Startzeit *
													</label>
													<input
														type="time"
														id="job-start-{evt.id}"
														name="startTime"
														required
														class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
													/>
												</div>
												<div>
													<label
														for="job-end-{evt.id}"
														class="block text-sm font-medium text-gray-700 mb-1"
													>
														Endzeit *
													</label>
													<input
														type="time"
														id="job-end-{evt.id}"
														name="endTime"
														required
														class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
													/>
												</div>
												<div>
													<label
														for="job-people-{evt.id}"
														class="block text-sm font-medium text-gray-700 mb-1"
													>
														Anzahl Personen *
													</label>
													<input
														type="number"
														id="job-people-{evt.id}"
														name="numberOfPeople"
														min="1"
														required
														class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
													/>
												</div>
											</div>
											<button
												type="submit"
												class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
											>
												Aufgabe hinzufügen
											</button>
										</form>
									{/if}

									{#if evt.jobs.length === 0}
										<p class="text-gray-600 text-sm">Keine Aufgaben vorhanden.</p>
									{:else}
										<div class="space-y-3">
											{#each evt.jobs as j (j.id)}
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
																class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
																{j.startTime} - {j.endTime} ({j.numberOfPeople} Person{j.numberOfPeople !==
																1
																	? 'en'
																	: ''})
															</p>
														</div>
														<div class="flex gap-2">
															<button
																onclick={() => {
																	editingJobId = j.id;
																	editingEventId = null;
																	editingMaterialId = null;
																}}
																class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
																	class="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
																>
																	Löschen
																</button>
															</form>
														</div>
													</div>
												{/if}
											{/each}
										</div>
									{/if}
								</div>

								<div class="mt-6">
									<h4 class="text-lg font-semibold mb-4">Materialien</h4>
									{#if editingMaterialId === null || editingMaterial?.eventId !== evt.id}
										<form
											method="POST"
											action="?/createMaterial"
											use:enhance={() => {
												return async ({ update }) => {
													await update();
													await handleSubmit();
												};
											}}
											class="mb-4 p-4 bg-gray-50 rounded-md space-y-4"
										>
											<input type="hidden" name="eventId" value={evt.id} />
											<div>
												<label
													for="material-title-{evt.id}"
													class="block text-sm font-medium text-gray-700 mb-1"
												>
													Titel *
												</label>
												<input
													type="text"
													id="material-title-{evt.id}"
													name="title"
													required
													class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											</div>
											<div>
												<label
													for="material-description-{evt.id}"
													class="block text-sm font-medium text-gray-700 mb-1"
												>
													Beschreibung
												</label>
												<textarea
													id="material-description-{evt.id}"
													name="description"
													rows="2"
													class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
												></textarea>
											</div>
											<button
												type="submit"
												class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
											>
												Material hinzufügen
											</button>
										</form>
									{/if}

									{#if evt.materials.length === 0}
										<p class="text-gray-600 text-sm">Keine Materialien vorhanden.</p>
									{:else}
										<div class="space-y-3">
											{#each evt.materials as m (m.id)}
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
														<div class="flex gap-2">
															<button
																onclick={() => {
																	editingMaterialId = m.id;
																	editingEventId = null;
																	editingJobId = null;
																}}
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
													</div>
												{/if}
											{/each}
										</div>
									{/if}
								</div>
							</div>
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
