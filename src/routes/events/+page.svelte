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

	function getEventDateTime(date: string, time: string): Date {
		return new Date(`${date}T${time}`);
	}

	const now = new Date();
	const upcomingEvents = $derived(
		data.events
			.filter((evt) => getEventDateTime(evt.date, evt.time) >= now)
			.sort((a, b) => {
				const dateA = getEventDateTime(a.date, a.time);
				const dateB = getEventDateTime(b.date, b.time);
				return dateB.getTime() - dateA.getTime();
			})
	);

	const pastEvents = $derived(
		data.events
			.filter((evt) => getEventDateTime(evt.date, evt.time) < now)
			.sort((a, b) => {
				const dateA = getEventDateTime(a.date, a.time);
				const dateB = getEventDateTime(b.date, b.time);
				return dateB.getTime() - dateA.getTime();
			})
	);
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<h1 class="text-3xl font-bold mb-8">Veranstaltungen</h1>

	<div class="mb-8 flex justify-between items-center">
		{#if data.user?.roles?.includes('admin')}
			<a
				href="/events/new"
				class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				Neue Veranstaltung anlegen
			</a>
		{/if}
	</div>

	<div>
		{#if data.events.length === 0}
			<p class="text-gray-600">Keine Veranstaltungen vorhanden.</p>
		{:else}
			{#if upcomingEvents.length > 0}
				<h2 class="text-2xl font-semibold mb-4 mt-8">Bevorstehende Veranstaltungen</h2>
				<div class="space-y-6 mb-12">
					{#each upcomingEvents as evt (evt.id)}
						<div class="bg-white rounded-lg shadow-md p-6">
							<div>
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
						</div>
					{/each}
				</div>
			{/if}

			{#if pastEvents.length > 0}
				<h2 class="text-2xl font-semibold mb-4">Vergangene Veranstaltungen</h2>
				<div class="space-y-6">
					{#each pastEvents as evt (evt.id)}
						<div class="bg-white rounded-lg shadow-md p-6 opacity-75">
							<div>
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
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.container {
		min-height: 100vh;
	}
</style>
