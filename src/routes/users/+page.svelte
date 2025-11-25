<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<h1 class="text-3xl font-bold mb-8">Benutzer</h1>

	<div class="mb-8 flex justify-between items-center">
		<h2 class="text-2xl font-semibold">Alle Benutzer</h2>
		<a
			href="/users/new"
			class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary"
		>
			Benutzer hinzufügen
		</a>
	</div>

	<div>
		{#if data.users.length === 0}
			<p class="text-gray-600">Keine Benutzer vorhanden.</p>
		{:else}
			<div class="bg-white rounded-lg shadow-md overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Name
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								E-Mail
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Rollen
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Aktionen
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each data.users.sort((a, b) => a.name.localeCompare(b.name)) as u (u.id)}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
									{u.name}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{#if u.roles && u.roles.length > 0}
										<div class="flex flex-wrap gap-2">
											{#each u.roles as role (role)}
												<span
													class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-dark"
												>
													{role}
												</span>
											{/each}
										</div>
									{:else}
										<span class="text-gray-400">Keine Rollen</span>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<a href="/users/{u.id}" class="text-link hover:text-link-hover hover:underline">
										Bearbeiten
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		min-height: 100vh;
	}
</style>
