<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';
	import { Input, FormControl, TextArea } from '@pixelcode_/blocks/components';

	let {
		block,
		isEditing = false,
		language = 'sv'
	} = $props<{
		block: Extract<ResumeBlock, { type: 'testimonial' }>;
		isEditing?: boolean;
		language?: 'sv' | 'en';
	}>();

	let editingBlock = $state({ ...block });

	$effect(() => {
		editingBlock = { ...block };
	});

	const resolveText = (content: any) => {
		if (!content) return { text: '', missing: false };
		if (typeof content === 'string') return { text: content, missing: false };
		if (content[language]) return { text: content[language], missing: false };
		const other = language === 'sv' ? 'en' : 'sv';
		return { text: content[other] || '', missing: true };
	};

	const quote = $derived(resolveText(block.quote));
</script>

{#if isEditing}
	<section class="resume-print-section rounded-lg border border-slate-200 bg-slate-50 p-4">
		<div class="grid grid-cols-2 gap-4">
			<FormControl label="Quote (SV)">
				<TextArea
					value={typeof editingBlock.quote === 'string'
						? editingBlock.quote
						: editingBlock.quote.sv}
					oninput={(e) => {
						if (typeof editingBlock.quote === 'string') {
							editingBlock.quote = { sv: e.currentTarget.value, en: editingBlock.quote };
						} else {
							editingBlock.quote.sv = e.currentTarget.value;
						}
					}}
					class="border-slate-300 bg-white text-slate-900"
					rows={3}
				/>
			</FormControl>
			<FormControl label="Quote (EN)">
				<TextArea
					value={typeof editingBlock.quote === 'string'
						? editingBlock.quote
						: editingBlock.quote.en}
					oninput={(e) => {
						if (typeof editingBlock.quote === 'string') {
							editingBlock.quote = { en: e.currentTarget.value, sv: editingBlock.quote };
						} else {
							editingBlock.quote.en = e.currentTarget.value;
						}
					}}
					class="border-slate-300 bg-white text-slate-900"
					rows={3}
				/>
			</FormControl>
		</div>

		<div class="mt-3">
			<FormControl label="Source">
				<Input bind:value={editingBlock.source} class="border-slate-300 bg-white text-slate-900" />
			</FormControl>
		</div>
	</section>
{:else}
	<section class="resume-print-section">
		<blockquote class="border-l-2 border-orange-400 pl-3 text-sm text-slate-700 italic">
			"{quote.text}"
			{#if quote.missing}
				<span class="ml-1 text-[10px] text-amber-600 normal-case not-italic"
					>(missing translation)</span
				>
			{/if}
		</blockquote>
		<p class="mt-2 text-sm font-semibold text-slate-800">{block.source}</p>
	</section>
{/if}
