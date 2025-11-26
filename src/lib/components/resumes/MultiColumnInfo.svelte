<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';
	import { Input, FormControl, Button, TextArea } from '@pixelcode_/blocks/components';
	import TechStackSelector from '../TechStackSelector.svelte';
	import ResumeSectionRow from './ResumeSectionRow.svelte';

	let { block, isEditing = false } = $props<{
		block: Extract<ResumeBlock, { type: 'multi_column_info' }>;
		isEditing?: boolean;
	}>();

	const normalizeItems = (items: typeof block.items) =>
		items.map((item) => ({ ...item, technologies: item.technologies ?? [] }));

	let editingBlock = $state({ ...block, items: normalizeItems(block.items) });

	$effect(() => {
		editingBlock = { ...block, items: normalizeItems(block.items) };
	});

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
					<FormControl label="Label">
						<Input bind:value={item.label} class="border-slate-300 bg-white" />
					</FormControl>

					<FormControl label="Description">
						<TextArea bind:value={item.description} class="border-slate-300 bg-white" rows={3} />
					</FormControl>

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
			<ResumeSectionRow label={item.label} skipFirstColumn={true}>
				<div class="space-y-1 text-sm text-slate-800">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<p>{@html item.description}</p>
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
