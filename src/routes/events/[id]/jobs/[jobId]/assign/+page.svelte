<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: any } = $props();

	async function handleSubmit() {
		await invalidateAll();
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="mb-6">
		<a
			href="/events/{data.event.id}/jobs"
			class="text-link hover:text-link-hover mb-4 inline-flex items-center gap-2"
		>
			← Zurück zu Aufgaben
		</a>
	</div>

	<h1 class="text-3xl font-bold mb-2">Eltern zuweisen: {data.job.title}</h1>
	<p class="text-gray-600 mb-8">Verwalte die Zuweisungen für diese Aufgabe</p>

	{#if form?.error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{form.error}
		</div>
	{/if}

	<div class="mb-8">
		<h2 class="text-2xl font-semibold mb-4">Benutzer</h2>

		{#if data.users.length === 0}
			<p class="text-gray-600 text-sm">Keine Benutzer vorhanden.</p>
		{:else}
			<div class="space-y-3">
				{#each data.users as u (u.id)}
					<div
						class="p-4 bg-gray-50 rounded-md flex flex-col md:flex-row md:items-center md:justify-between gap-2"
					>
						<div class="flex-1">
							<p class="font-medium">{u.name}</p>
						</div>
						<div>
							{#if u.isAssigned}
								<form
									method="POST"
									action="?/unassign"
									use:enhance={() => {
										return async ({ update }) => {
											await update();
											await handleSubmit();
										};
									}}
									class="inline"
								>
									<input type="hidden" name="userId" value={u.id} />
									<button
										type="submit"
										class="px-4 py-2 bg-error text-white rounded-md hover:bg-error-dark"
									>
										Entfernen
									</button>
								</form>
							{:else}
								<form
									method="POST"
									action="?/assign"
									use:enhance={() => {
										return async ({ update }) => {
											await update();
											await handleSubmit();
										};
									}}
									class="inline"
								>
									<input type="hidden" name="userId" value={u.id} />
									<button
										type="submit"
										class="px-4 py-2 bg-success text-white rounded-md hover:bg-success-dark"
									>
										Zuweisen
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

<style>
	.container {
		min-height: 100vh;
	}
</style>
