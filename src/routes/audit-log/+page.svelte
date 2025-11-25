<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(timestamp: Date | null) {
		if (!timestamp) return '-';
		return new Date(timestamp).toLocaleString('de-DE');
	}

	function translateAction(action: string): string {
		const translations: Record<string, string> = {
			create: 'Erstellen',
			update: 'Aktualisieren',
			delete: 'Löschen',
			assign: 'Zuweisen',
			unassign: 'Abmelden'
		};
		return translations[action] || action;
	}
</script>

<div class="container mx-auto p-6">
	<h1 class="text-3xl font-bold mb-6">Protokoll</h1>

	<div class="bg-white rounded-lg shadow overflow-x-auto">
		<table class="min-w-full divide-y divide-gray-200">
			<thead class="bg-gray-50">
				<tr>
					<th
						class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
					>
						Zeitpunkt
					</th>
					<th
						class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
					>
						Benutzer
					</th>
					<th
						class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
					>
						Aktion
					</th>
					<th
						class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
					>
						Ressource
					</th>
					<th
						class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
					>
						Betroffener Benutzer
					</th>
				</tr>
			</thead>
			<tbody class="bg-white divide-y divide-gray-200">
				{#each data.logs as log}
					<tr>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							{formatDate(log.createdAt)}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							{log.name}
							{#if log.user}
								<span class="text-gray-500"> ({log.user.email})</span>
							{:else if log.email}
								<span class="text-gray-500"> ({log.email})</span>
							{/if}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							{translateAction(log.action)}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							{log.resourceName}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							{log.targetUserName}
							{#if log.targetUser}
								<span class="text-gray-500"> ({log.targetUser.email})</span>
							{:else if log.targetUserEmail}
								<span class="text-gray-500"> ({log.targetUserEmail})</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if data.totalPages > 1}
		<div class="mt-4 flex justify-center gap-2">
			{#if data.page > 1}
				<a href="?page={data.page - 1}" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md">
					Zurück
				</a>
			{/if}
			<span class="px-4 py-2">
				Seite {data.page} von {data.totalPages}
			</span>
			{#if data.page < data.totalPages}
				<a href="?page={data.page + 1}" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md">
					Weiter
				</a>
			{/if}
		</div>
	{/if}
</div>
