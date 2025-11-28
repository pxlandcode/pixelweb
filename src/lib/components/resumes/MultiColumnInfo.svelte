<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';
	import { Input, FormControl, Button, TextArea } from '@pixelcode_/blocks/components';
	import { TechStackSelector } from '$lib/components';
	import ResumeSectionRow from './ResumeSectionRow.svelte';

	let {
		block,
		isEditing = false,
		language = 'sv'
	} = $props<{
		block: Extract<ResumeBlock, { type: 'multi_column_info' }>;
		isEditing?: boolean;
		language?: 'sv' | 'en';
	}>();

	const normalizeItems = (items: typeof block.items) =>
		items.map((item) => ({ ...item, technologies: item.technologies ?? [] }));

	let editingBlock = $state({ ...block, items: normalizeItems(block.items) });

	$effect(() => {
		editingBlock = { ...block, items: normalizeItems(block.items) };
	});

	const resolveText = (content: any) => {
		if (!content) return { text: '', missing: false };
		if (typeof content === 'string') return { text: content, missing: false };
		if (content[language]) return { text: content[language], missing: false };
		const other = language === 'sv' ? 'en' : 'sv';
		return { text: content[other] || '', missing: true };
	};

	const addItem = () => {
		editingBlock.items = [...editingBlock.items, { label: '', description: '', technologies: [] }];
	};

	const removeItem = (index: number) => {
		editingBlock.items = editingBlock.items.filter((_: unknown, i: number) => i !== index);
	};
</script>

{#if isEditing}
	<section
		class="resume-print-section space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
	>
		{#each editingBlock.items as item, index}
			<div class="rounded border border-slate-300 bg-white p-3">
				<div class="mb-2 flex items-center justify-between">
					<span class="text-sm font-medium text-slate-700">Item {index + 1}</span>
					<Button variant="ghost" size="sm" onclick={() => removeItem(index)}>Remove</Button>
				</div>

				<div class="space-y-2">
					<div class="grid grid-cols-2 gap-4">
						<FormControl label="Label (SV)">
							<Input
								value={typeof item.label === 'string' ? item.label : item.label?.sv}
								oninput={(e) => {
									if (typeof item.label === 'string') {
										item.label = { sv: e.currentTarget.value, en: item.label };
									} else {
										item.label.sv = e.currentTarget.value;
									}
								}}
								class="border-slate-300 bg-white"
							/>
						</FormControl>
						<FormControl label="Label (EN)">
							<Input
								value={typeof item.label === 'string' ? item.label : item.label?.en}
								oninput={(e) => {
									if (typeof item.label === 'string') {
										item.label = { en: e.currentTarget.value, sv: item.label };
									} else {
										item.label.en = e.currentTarget.value;
									}
								}}
								class="border-slate-300 bg-white"
							/>
						</FormControl>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<FormControl label="Description (SV)">
							<TextArea
								value={typeof item.description === 'string'
									? item.description
									: item.description?.sv}
								oninput={(e) => {
									if (typeof item.description === 'string') {
										item.description = { sv: e.currentTarget.value, en: item.description };
									} else {
										item.description.sv = e.currentTarget.value;
									}
								}}
								class="border-slate-300 bg-white"
								rows={3}
							/>
						</FormControl>
						<FormControl label="Description (EN)">
							<TextArea
								value={typeof item.description === 'string'
									? item.description
									: item.description?.en}
								oninput={(e) => {
									if (typeof item.description === 'string') {
										item.description = { en: e.currentTarget.value, sv: item.description };
									} else {
										item.description.en = e.currentTarget.value;
									}
								}}
								class="border-slate-300 bg-white"
								rows={3}
							/>
						</FormControl>
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-slate-700"
							>Technologies (optional)</label
						>
						<TechStackSelector
							bind:value={item.technologies}
							onchange={(techs) => (item.technologies = techs || [])}
						/>
					</div>
				</div>
			</div>
		{/each}

		<Button variant="outline" onclick={addItem}>+ Add Item</Button>
	</section>
{:else}
	<section class="resume-print-section space-y-2">
		{#each block.items as item}
			{@const label = resolveText(item.label)}
			{@const desc = resolveText(item.description)}
			<ResumeSectionRow label={label.text} skipFirstColumn={true}>
				<div class="space-y-1 text-sm text-slate-800">
					{#if label.missing}
						<div class="mb-1 text-[10px] text-amber-600">(label missing translation)</div>
					{/if}
					{#if desc.missing}
						<div class="mb-1 text-[10px] text-amber-600">(description missing translation)</div>
					{/if}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<p>{@html desc.text}</p>
					{#if item.technologies?.length}
						<div class="flex flex-wrap gap-2 pt-1">
							{#each item.technologies as tech}
								<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800">
									{tech}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			</ResumeSectionRow>
		{/each}
	</section>
{/if}
