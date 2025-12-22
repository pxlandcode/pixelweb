<script lang="ts">
	import { Button, Card } from '@pixelcode_/blocks/components';
	import { FileText, User } from 'lucide-svelte';

	const { data } = $props();

	const liveEmployees = data.employees ?? [];
</script>

<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
	<div class="mb-12">
		<h1 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Resumes</h1>
		<p class="mt-4 text-lg text-slate-500">
			Manage and view profiles and resumes for all Pixel&Code consultants.
		</p>
	</div>

	<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each liveEmployees as employee}
			<a href="/internal/resumes/{employee.id}" class="block h-full">
				<Card
					class="flex h-full flex-col overflow-hidden rounded-none transition-all hover:shadow-md"
				>
					<div class="aspect-square w-full overflow-hidden bg-slate-100">
						{#if employee.avatar_url}
							<img
								src={employee.avatar_url}
								alt={[employee.first_name, employee.last_name].filter(Boolean).join(' ')}
								class="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-105"
							/>
						{:else}
							<div class="flex h-full w-full items-center justify-center text-slate-300">
								<User size={48} />
							</div>
						{/if}
					</div>

					<div class="flex flex-1 flex-col p-6">
						<div class="mb-4">
							<h3 class="text-xl font-semibold text-slate-900">
								{[employee.first_name, employee.last_name].filter(Boolean).join(' ') || 'Unnamed'}
							</h3>
							<p class="text-sm font-medium text-primary">Employee profile</p>
						</div>

						<div class="mt-auto flex items-center justify-between text-xs text-slate-500">
							<span class="flex items-center gap-1">
								<FileText size={14} />
								View profile
							</span>
							<span
								class="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 ring-inset"
							>
								DB
							</span>
						</div>
					</div>
				</Card>
			</a>
		{/each}
	</div>
</div>
