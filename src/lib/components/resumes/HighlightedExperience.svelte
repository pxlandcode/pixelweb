<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';

	let { experience, language = 'sv' } = $props<{
		experience: Extract<ResumeBlock, { type: 'highlighted_experience' }>;
		language?: 'sv' | 'en';
	}>();

	const resolveText = (content: any) => {
		if (!content) return { text: '', missing: false };
		if (typeof content === 'string') return { text: content, missing: false };
		if (content[language]) return { text: content[language], missing: false };
		const other = language === 'sv' ? 'en' : 'sv';
		return { text: content[other] || '', missing: true };
	};

	const role = $derived(resolveText(experience.role));
	const desc = $derived(resolveText(experience.description));
</script>

<div class="space-y-3">
	<div>
		<p class="text-sm font-semibold text-slate-900">{experience.company}</p>
		<p class="text-sm text-slate-700 italic">
			{role.text}
			{#if role.missing}
				<span class="ml-1 text-[10px] text-amber-600 normal-case not-italic"
					>(missing translation)</span
				>
			{/if}
		</p>
	</div>
	<div class="experience-description text-sm leading-relaxed text-slate-700">
		{#if desc.missing}
			<div class="mb-2">
				<span
					class="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
				>
					Missing translation
				</span>
			</div>
		{/if}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html desc.text}
	</div>

	<div class="space-y-1">
		<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Technologies</p>
		<div class="flex flex-wrap gap-2">
			{#each experience.technologies as tech}
				<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800">{tech}</span>
			{/each}
		</div>
	</div>
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
