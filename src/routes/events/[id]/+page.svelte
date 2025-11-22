<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="mb-6">
		<a
			href="/events"
			class="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-2"
		>
			← Zurück zur Übersicht
		</a>
	</div>

	<div class="bg-white rounded-lg shadow-md p-6 mb-8">
		<h1 class="text-3xl font-bold mb-4">{data.event.title}</h1>
		{#if data.event.description}
			<p class="text-gray-600 mb-4">{data.event.description}</p>
		{/if}
		<p class="text-sm text-gray-500">{formatDateTime(data.event.date, data.event.time)}</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<div>
			<h2 class="text-2xl font-semibold mb-4">Aufgaben</h2>
			{#if data.event.jobs.length === 0}
				<p class="text-gray-600 text-sm">Keine Aufgaben vorhanden.</p>
			{:else}
				<div class="space-y-3">
					{#each data.event.jobs as j (j.id)}
						<div class="p-4 bg-gray-50 rounded-md">
							<h3 class="font-medium mb-2">{j.title}</h3>
							{#if j.description}
								<p class="text-sm text-gray-600 mb-2">{j.description}</p>
							{/if}
							<p class="text-sm text-gray-500">
								{j.startTime} - {j.endTime} ({j.numberOfPeople} Person{j.numberOfPeople !== 1
									? 'en'
									: ''})
							</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div>
			<h2 class="text-2xl font-semibold mb-4">Materialien</h2>
			{#if data.event.materials.length === 0}
				<p class="text-gray-600 text-sm">Keine Materialien vorhanden.</p>
			{:else}
				<div class="space-y-3">
					{#each data.event.materials as m (m.id)}
						<div class="p-4 bg-gray-50 rounded-md">
							<h3 class="font-medium mb-2">{m.title}</h3>
							{#if m.description}
								<p class="text-sm text-gray-600">{m.description}</p>
							{/if}
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

