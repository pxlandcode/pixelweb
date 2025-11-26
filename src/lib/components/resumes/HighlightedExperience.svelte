<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';

	let { experience } = $props<{
		experience: Extract<ResumeBlock, { type: 'highlighted_experience' }>;
	}>();
</script>

<div class="space-y-3">
	<div>
		<p class="text-sm font-semibold text-slate-900">{experience.company}</p>
		<p class="text-sm text-slate-700 italic">{experience.role}</p>
	</div>
	<div class="experience-description text-sm leading-relaxed text-slate-700">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html experience.description}
	</div>

	<style>
		:global(.experience-description blockquote) {
			border-left-width: 2px;
			border-color: rgb(251 146 60);
			padding-left: 0.75rem;
			font-size: 0.875rem;
			color: rgb(51 65 85);
			font-style: italic;
			margin-top: 0.5rem;
			margin-bottom: 0.5rem;
			position: relative;
		}
		:global(.experience-description blockquote::before) {
			content: '"';
		}
		:global(.experience-description blockquote::after) {
			content: '"';
		}
	</style>
	<div class="space-y-1">
		<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Technologies</p>
		<div class="flex flex-wrap gap-2">
			{#each experience.technologies as tech}
				<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800">{tech}</span>
			{/each}
		</div>
	</div>
</div>
