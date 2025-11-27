<script lang="ts">
import type { ResumeBlock } from '$lib/services/resumes';
import worldclassUrl from '$lib/assets/worldclass.svg?url';

let { block, language = 'sv' } = $props<{
	block: Extract<ResumeBlock, { type: 'footer' }>;
	language?: 'sv' | 'en';
}>();

const resolveText = (content: any) => {
	if (!content) return { text: '', missing: false };
	if (typeof content === 'string') return { text: content, missing: false };
	if (content[language]) return { text: content[language], missing: false };
	const other = language === 'sv' ? 'en' : 'sv';
	return { text: content[other] || '', missing: true };
};

const note = $derived(resolveText(block.note));
</script>

<section
	class="resume-print-section mt-8 w-full justify-center border-t border-slate-300 pt-2 text-center"
>
	<div class="mb-3 flex justify-center">
		<img
			src={worldclassUrl}
			alt="Worldclass Tech, Worldclass People"
			class="max-h-[300px] w-full max-w-xs object-contain"
			loading="lazy"
		/>
	</div>
	<p class="text-sm text-slate-700">
		{note.text}
		{#if note.missing}
			<span class="ml-1 text-[10px] font-normal text-amber-600">(missing translation)</span>
		{/if}
	</p>
</section>
