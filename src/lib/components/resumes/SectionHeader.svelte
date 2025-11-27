<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';

	let { block, language = 'sv' } = $props<{
		block: Extract<ResumeBlock, { type: 'section_header' }>;
		language?: 'sv' | 'en';
	}>();

	const resolveText = (content: any) => {
		if (!content) return { text: '', missing: false };
		if (typeof content === 'string') return { text: content, missing: false };
		if (content[language]) return { text: content[language], missing: false };
		const other = language === 'sv' ? 'en' : 'sv';
		return { text: content[other] || '', missing: true };
	};

	const title = $derived(resolveText(block.title));
</script>

<section class="resume-print-section">
	<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
		<h2 class="text-base font-bold text-slate-900 uppercase">
			{title.text}
			{#if title.missing}
				<span class="ml-1 text-[10px] font-normal text-amber-600 normal-case"
					>(missing translation)</span
				>
			{/if}
		</h2>
		{#if block.divider !== false}
			<div class="flex items-center">
				<div class="h-px w-full bg-orange-500"></div>
			</div>
			<div class="flex items-center">
				<div class="h-px flex-1 bg-slate-300"></div>
			</div>
		{/if}
	</div>
</section>
