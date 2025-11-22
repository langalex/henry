<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(timestamp: Date | null) {
		if (!timestamp) return '-';
		return new Date(timestamp).toLocaleString('de-DE');
	}

	function parseDetails(details: string | null) {
		if (!details) return null;
		try {
			return JSON.parse(details);
		} catch {
			return details;
		}
	}
</script>

<div class="container mx-auto p-6">
	<h1 class="text-3xl font-bold mb-6">Protokoll</h1>

	<div class="bg-white rounded-lg shadow overflow-hidden">
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
						Details
					</th>
					<th
						class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
					>
						IP-Adresse
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
							{#if log.user}
								{log.user.name} ({log.user.email})
							{:else}
								<span class="text-gray-400">System</span>
							{/if}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							{log.action}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							{#if log.resourceType}
								{log.resourceType}
								{#if log.resourceId}
									<span class="text-gray-500"> ({log.resourceId})</span>
								{/if}
							{:else}
								<span class="text-gray-400">-</span>
							{/if}
						</td>
						<td class="px-6 py-4 text-sm text-gray-900 max-w-xs">
							{#if log.details}
								<pre class="text-xs bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(
										parseDetails(log.details),
										null,
										2
									)}</pre>
							{:else}
								<span class="text-gray-400">-</span>
							{/if}
						</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							{log.ipAddress || '-'}
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
