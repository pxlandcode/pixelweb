<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';
	import { soloImages } from '$lib/images/manifest';

	type ResumeImage = (typeof soloImages)[keyof typeof soloImages];

	let {
		header,
		skillsGrid,
		image = soloImages.pierrePortrait
	} = $props<{
		header: Extract<ResumeBlock, { type: 'header' }>;
		skillsGrid?: Extract<ResumeBlock, { type: 'skills_grid' }>;
		image?: ResumeImage;
	}>();

	const imageSrc = $derived(image?.src ?? image?.fallbackSrc ?? '');
	const imageAlt = $derived(image?.alt ?? `${header.name} portrait`);
	const imageSrcset = $derived(image?.srcset ?? undefined);
</script>

<div class={`consultant-profile`}>
	<!-- Consultant Image -->
	<div
		class="relative aspect-square w-full flex-shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white"
	>
		{#if imageSrc}
			<img
				src={imageSrc}
				srcset={imageSrcset}
				alt={imageAlt}
				class="h-full w-full object-cover object-center"
				loading="lazy"
				decoding="async"
			/>
		{:else}
			<div
				class="absolute inset-0 flex items-center justify-center bg-slate-50 text-sm text-slate-500"
			>
				Image missing
			</div>
		{/if}
	</div>

	<!-- Skills Section -->
	{#if skillsGrid}
		<div class="flex-shrink-0 rounded-md bg-slate-50 p-4">
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
	<div class="flex-shrink-0 space-y-3 rounded-md bg-slate-50 p-4">
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
</div>
