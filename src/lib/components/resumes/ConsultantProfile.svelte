<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';

	let { header, skillsGrid, andLogo } = $props<{
		header: Extract<ResumeBlock, { type: 'header' }>;
		skillsGrid?: Extract<ResumeBlock, { type: 'skills_grid' }>;
		andLogo: string;
	}>();
</script>

<div class="space-y-5">
	<!-- Consultant Image -->
	<div class="border-gray relative aspect-square w-full overflow-hidden border-1">
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="flex h-32 w-32 items-center justify-center bg-white/50">
				<span>Image Missing</span>
			</div>
		</div>
	</div>

	<!-- Skills Section -->
	{#if skillsGrid}
		<div class="rounded-md bg-slate-50 p-4">
			<p class="mb-3 text-xs font-semibold tracking-wide text-slate-700 uppercase">
				{skillsGrid.title}
			</p>
			<div class="space-y-1 text-sm text-slate-800">
				{#each skillsGrid.skills as skill}
					<div>{skill}</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Contact Section -->
	<div class="space-y-3 rounded-md bg-slate-50 p-4">
		{#each header.contact_people as contact}
			<div class="space-y-1">
				<p class="text-xs font-semibold tracking-wide text-slate-600 uppercase">
					{contact.label}
				</p>
				<div class="space-y-2 text-sm text-slate-800">
					{#each contact.people as person}
						<div class="leading-tight">
							<p class="text-sm font-medium">{person.name}</p>
							{#if person.phone}<p class="text-xs text-slate-600">{person.phone}</p>{/if}
							{#if person.email}<p class="text-xs text-slate-600">{person.email}</p>{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!-- And Logo at Bottom -->
	<div class="flex justify-center pt-2">
		<img src={andLogo} alt="&" class="h-16 opacity-70" />
	</div>
</div>
