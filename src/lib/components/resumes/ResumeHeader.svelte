<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';
	import pixelcodeLogoDark from '$lib/assets/pixelcodelogodark.svg?url';
	import andLogo from '$lib/assets/and.svg?url';
	import ConsultantProfile from './ConsultantProfile.svelte';
	import HighlightedExperience from './HighlightedExperience.svelte';

	let { header, skillsGrid, highlightedExp } = $props<{
		header: Extract<ResumeBlock, { type: 'header' }>;
		skillsGrid?: Extract<ResumeBlock, { type: 'skills_grid' }>;
		highlightedExp?: Extract<ResumeBlock, { type: 'highlighted_experience' }>;
	}>();
</script>

<div class="resume-header-section mb-8">
	<!-- Top Logo and "proudly presents" -->
	<div class="mb-10 space-y-1 text-center">
		<img src={pixelcodeLogoDark} alt="Pixel & Code" class="mx-auto h-10" />
		<p class="-mt-2 -rotate-10 text-3xl text-primary" style="font-family: 'Fave Script', cursive;">
			proudly presents
		</p>
	</div>

	<!-- Main Header Content Grid -->
	<div class="mb-8 grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
		<!-- Left Column: Image + Skills + Contact -->
		<ConsultantProfile {header} {skillsGrid} {andLogo} />

		<!-- Right Column: Name + Description + Highlighted Experience -->
		<div class="space-y-6">
			<!-- Name and Title -->
			<div>
				<h1 class="mb-2 text-4xl font-bold text-slate-900">{header.name}</h1>
				<h2 class="text-xl font-medium text-slate-700">{header.title}</h2>
			</div>

			<!-- Description -->
			<div>
				<p class="text-sm leading-relaxed text-slate-700">
					{header.summary}
				</p>
			</div>

			<!-- Highlighted Experience -->
			{#if highlightedExp}
				<HighlightedExperience experience={highlightedExp} />
			{/if}
		</div>
	</div>

	<!-- Divider after header -->
	<div class="my-8 border-t-2 border-slate-200"></div>
</div>
