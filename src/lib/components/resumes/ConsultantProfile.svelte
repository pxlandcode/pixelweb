<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';
	import type { soloImages } from '$lib/images/manifest';

	type ImageResource = (typeof soloImages)[keyof typeof soloImages];

	let {
		header,
		skillsGrid,
		image,
		language = 'sv'
	} = $props<{
		header: Extract<ResumeBlock, { type: 'header' }>;
		skillsGrid?: Extract<ResumeBlock, { type: 'skills_grid' }>;
		image?: ImageResource;
		language?: 'sv' | 'en';
	}>();

	const resolveText = (content: any) => {
		if (!content) return { text: '', missing: false };
		if (typeof content === 'string') return { text: content, missing: false };
		if (content[language]) return { text: content[language], missing: false };
		const other = language === 'sv' ? 'en' : 'sv';
		return { text: content[other] || '', missing: true };
	};

	const imageSrc = $derived(image?.src ?? image?.fallbackSrc ?? '');
	const imageAlt = $derived(image?.alt ?? `${header.name} portrait`);
	const imageSrcset = $derived(image?.srcset ?? undefined);

	const skillsTitle = $derived(
		skillsGrid ? resolveText(skillsGrid.title) : { text: '', missing: false }
	);
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
			<div class="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-400">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-20 w-20"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
					/>
				</svg>
			</div>
		{/if}
	</div>

	<!-- Skills Section -->
	{#if skillsGrid}
		<div class="flex-shrink-0 rounded-md bg-slate-50 p-4">
			<p class="mb-3 text-xs font-semibold tracking-wide text-slate-700 uppercase">
				{skillsTitle.text}
				{#if skillsTitle.missing}
					<span class="ml-1 text-[10px] font-normal text-amber-600 normal-case"
						>(missing translation)</span
					>
				{/if}
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
		{#each header.contact_people as group}
			{@const label = resolveText(group.label)}
			<div class="space-y-1">
				<p class="text-xs font-semibold tracking-wide text-slate-600 uppercase">
					{label.text}
					{#if label.missing}
						<span class="ml-1 text-[10px] font-normal text-amber-600 normal-case"
							>(missing translation)</span
						>
					{/if}
				</p>
				<div class="space-y-2 text-sm text-slate-800">
					{#each group.people as person}
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
