<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';
	import { Input, FormControl } from '@pixelcode_/blocks/components';
	import { TechStackSelector } from '$lib/components';

	let {
		block,
		isEditing = false,
		language = 'sv'
	} = $props<{
		block: Extract<ResumeBlock, { type: 'skills_grid' }>;
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

	const title = $derived(resolveText(block.title));
</script>

{#if isEditing}
	<section class="resume-print-section rounded-lg border border-slate-200 bg-slate-50 p-4">
		<div class="grid grid-cols-2 gap-4">
			<FormControl label="Title (SV)">
				<Input
					value={typeof editingBlock.title === 'string'
						? editingBlock.title
						: editingBlock.title?.sv}
					oninput={(e) => {
						if (typeof editingBlock.title === 'string') {
							editingBlock.title = { sv: e.currentTarget.value, en: editingBlock.title };
						} else {
							editingBlock.title = {
								sv: e.currentTarget.value,
								en: editingBlock.title?.en ?? ''
							};
						}
					}}
					class="border-slate-300 bg-white text-slate-900"
				/>
			</FormControl>
			<FormControl label="Title (EN)">
				<Input
					value={typeof editingBlock.title === 'string'
						? editingBlock.title
						: editingBlock.title?.en}
					oninput={(e) => {
						if (typeof editingBlock.title === 'string') {
							editingBlock.title = { en: e.currentTarget.value, sv: editingBlock.title };
						} else {
							editingBlock.title = {
								en: e.currentTarget.value,
								sv: editingBlock.title?.sv ?? ''
							};
						}
					}}
					class="border-slate-300 bg-white text-slate-900"
				/>
			</FormControl>
		</div>

		<div class="mt-3">
			<label class="mb-1 block text-sm font-medium text-slate-700">Skills</label>
			<TechStackSelector
				bind:value={editingBlock.skills}
				onchange={(skills) => (editingBlock.skills = skills)}
			/>
		</div>
	</section>
{:else}
	<section class="resume-print-section">
		<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
			{title.text}
			{#if title.missing}
				<span class="ml-1 text-[10px] font-normal text-amber-600">(missing translation)</span>
			{/if}
		</p>
		<div
			class={`mt-2 grid gap-2 ${
				block.columns === 2 ? 'grid-cols-2' : block.columns === 4 ? 'grid-cols-4' : 'grid-cols-3'
			}`}
		>
			{#each block.skills as skill}
				<div class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-800">
					{skill}
				</div>
			{/each}
		</div>
	</section>
{/if}
