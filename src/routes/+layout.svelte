<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();

	let menuOpen = $state(false);

	function toggleMenu() {
		menuOpen = !menuOpen;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen flex flex-col">
	{#if data.user}
		<nav class="bg-gray-800 text-white p-4">
			<div class="container mx-auto flex justify-between items-center">
				<div class="flex items-center gap-6">
					<div class="text-xl font-bold">Klasse 1/2B</div>
					<div class="hidden md:block">
						<span class="font-semibold">{data.user.name}</span>
					</div>
					<div class="hidden md:flex gap-4">
						<a href="/events" class="hover:text-gray-300">Veranstaltungen</a>
						{#if data.user.roles?.includes('admin')}
							<a href="/users" class="hover:text-gray-300">Benutzer</a>
							<a href="/audit-log" class="hover:text-gray-300">Protokoll</a>
						{/if}
					</div>
				</div>
				<div class="flex items-center gap-4">
					<button
						type="button"
						onclick={toggleMenu}
						class="md:hidden p-2 hover:bg-gray-700 rounded-md"
						aria-label="Menu"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{#if menuOpen}
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							{:else}
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							{/if}
						</svg>
					</button>
					<form method="POST" action="/auth/logout" class="hidden md:block">
						<button type="submit" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md">
							Abmelden
						</button>
					</form>
				</div>
			</div>
			{#if menuOpen}
				<div class="md:hidden mt-4 pb-4 border-t border-gray-700 pt-4">
					<div class="mb-4">
						<span class="font-semibold">{data.user.name}</span>
					</div>
					<div class="flex flex-col gap-4">
						<a href="/events" onclick={toggleMenu} class="hover:text-gray-300 py-2"
							>Veranstaltungen</a
						>
						{#if data.user.roles?.includes('admin')}
							<a href="/users" onclick={toggleMenu} class="hover:text-gray-300 py-2">Benutzer</a>
							<a href="/audit-log" onclick={toggleMenu} class="hover:text-gray-300 py-2"
								>Protokoll</a
							>
						{/if}
						<form method="POST" action="/auth/logout">
							<button
								type="submit"
								onclick={toggleMenu}
								class="w-full text-left px-2 py-2 bg-red-600 hover:bg-red-700 rounded-md"
							>
								Abmelden
							</button>
						</form>
					</div>
				</div>
			{/if}
		</nav>
	{/if}

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="bg-gray-100 text-gray-500 p-4 mt-auto">
		<div class="container mx-auto flex justify-between">
			<div>&copy; 2025 <a href="mailto:alex@langs.berlin">Alexander Lang</a></div>
			<div>
				Gehostet in Deutschland bei <a
					href="https://upcloud.com"
					target="_blank"
					rel="noopener noreferrer">upcloud.com</a
				>
			</div>
			<div>
				Emails via <a href="https://lettermint.co" target="_blank" rel="noopener noreferrer"
					>Lettermint</a
				>
			</div>
			<div>
				<a href="https://github.com/langalex/henry/" target="_blank" rel="noopener noreferrer">
					Source Code
				</a>
			</div>
		</div>
	</footer>
</div>
