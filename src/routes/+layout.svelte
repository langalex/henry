<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if data.user}
	<nav class="bg-gray-800 text-white p-4">
		<div class="container mx-auto flex justify-between items-center">
			<div class="flex items-center gap-6">
				<div>
					<span class="font-semibold">{data.user.name}</span>
					<span class="text-gray-400 ml-2">({data.user.email})</span>
				</div>
				<div class="flex gap-4">
					<a href="/events" class="hover:text-gray-300">Veranstaltungen</a>
					{#if data.user.roles?.includes('admin')}
						<a href="/users" class="hover:text-gray-300">Benutzer</a>
					{/if}
				</div>
			</div>
			<form method="POST" action="/auth/logout">
				<button type="submit" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md">
					Abmelden
				</button>
			</form>
		</div>
	</nav>
{/if}

{@render children()}
