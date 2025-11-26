<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';
	import { Input, FormControl, Button } from '@pixelcode_/blocks/components';
	import TechStackSelector from '../TechStackSelector.svelte';
	import ResumeSectionRow from './ResumeSectionRow.svelte';

	let { block, isEditing = false } = $props<{
		block: Extract<ResumeBlock, { type: 'skills_categorized' }>;
		isEditing?: boolean;
	}>();

	let editingBlock = $state({ ...block });

	$effect(() => {
		editingBlock = { ...block };
	});

	const isTechniqueOrMethod = $derived(
		editingBlock.category.toLowerCase().includes('technique') ||
			editingBlock.category.toLowerCase().includes('method')
	);
	const isLanguage = $derived(editingBlock.category.toLowerCase().includes('language'));
	const isPortfolio = $derived(editingBlock.category.toLowerCase().includes('portfolio'));

	const addItem = () => {
		if (isLanguage) {
			editingBlock.items = [...editingBlock.items, { label: '', value: '' }];
		} else if (isPortfolio) {
			editingBlock.items = [...editingBlock.items, ''];
		} else {
			editingBlock.items = [...editingBlock.items, ''];
		}
	};

	const removeItem = (index: number) => {
		editingBlock.items = editingBlock.items.filter((_: unknown, i: number) => i !== index);
	};
</script>

{#if isEditing}
	<section class="resume-print-section mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
		<p class="mb-3 text-xs font-semibold tracking-wide text-slate-700 uppercase">
			{editingBlock.category}
		</p>

		<div class="mt-3">
			{#if isTechniqueOrMethod}
				<label class="mb-1 block text-sm font-medium text-slate-700">Items</label>
				<TechStackSelector
					bind:value={editingBlock.items}
					onchange={(items) => (editingBlock.items = items)}
				/>
			{:else if isLanguage}
				<label class="mb-1 block text-sm font-medium text-slate-700">Languages</label>
				<div class="space-y-2">
					{#each editingBlock.items as item, index}
						{#if typeof item !== 'string'}
							<div class="flex gap-2">
								<Input
									bind:value={item.label}
									placeholder="Language"
									class="flex-1 border-slate-300 bg-white"
								/>
								<Input
									bind:value={item.value}
									placeholder="Proficiency"
									class="flex-1 border-slate-300 bg-white"
								/>
								<Button variant="ghost" size="sm" onclick={() => removeItem(index)}>Remove</Button>
							</div>
						{/if}
					{/each}
					<Button variant="outline" size="sm" onclick={addItem}>+ Add Language</Button>
				</div>
			{:else if isPortfolio}
				<label class="mb-1 block text-sm font-medium text-slate-700">Portfolio URLs</label>
				<div class="space-y-2">
					{#each editingBlock.items as item, index}
						{#if typeof item === 'string'}
							<div class="flex gap-2">
								<Input
									bind:value={editingBlock.items[index]}
									placeholder="https://..."
									class="flex-1 border-slate-300 bg-white"
								/>
								<Button variant="ghost" size="sm" onclick={() => removeItem(index)}>Remove</Button>
							</div>
						{/if}
					{/each}
					<Button variant="outline" size="sm" onclick={addItem}>+ Add URL</Button>
				</div>
			{:else}
				<!-- Fallback for generic lists -->
				<label class="mb-1 block text-sm font-medium text-slate-700">Items</label>
				<div class="space-y-2">
					{#each editingBlock.items as item, index}
						{#if typeof item === 'string'}
							<div class="flex gap-2">
								<Input
									bind:value={editingBlock.items[index]}
									class="flex-1 border-slate-300 bg-white"
								/>
								<Button variant="ghost" size="sm" onclick={() => removeItem(index)}>Remove</Button>
							</div>
						{/if}
					{/each}
					<Button variant="outline" size="sm" onclick={addItem}>+ Add Item</Button>
				</div>
			{/if}
		</div>
	</section>
{:else}
	<section class="resume-print-section mb-6">
		<ResumeSectionRow label={block.category} skipFirstColumn={isTechniqueOrMethod || isPortfolio}>
			{#if block.category.toLowerCase().includes('language')}
				<div class="flex flex-col gap-1 text-sm text-slate-800">
					{#each block.items as item}
						{#if typeof item === 'string'}
							<p><span class="font-bold">{item}</span></p>
						{:else}
							<p><span class="font-bold">{item.label}</span>: {item.value || ''}</p>
						{/if}
					{/each}
				</div>
			{:else if block.category.toLowerCase().includes('portfolio')}
				<div class="flex flex-wrap gap-2 text-sm text-slate-800">
					{#each block.items as item}
						{#if typeof item === 'string'}
							<a
								href={item}
								target="_blank"
								rel="noopener noreferrer"
								class="underline decoration-slate-400 underline-offset-2 hover:decoration-slate-700"
								>{item}</a
							>
						{:else if item.value}
							<a
								href={item.value}
								target="_blank"
								rel="noopener noreferrer"
								class="underline decoration-slate-400 underline-offset-2 hover:decoration-slate-700"
								>{item.value}</a
							>
						{/if}
					{/each}
				</div>
			{:else}
				<div class="flex flex-wrap gap-2">
					{#each block.items as item}
						{#if typeof item === 'string'}
							<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800">{item}</span>
						{:else}
							<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800">
								<span class="font-semibold">{item.label}</span>
								{#if item.value}
									<span>: {item.value}</span>
								{/if}
							</span>
						{/if}
					{/each}
				</div>
			{/if}
		</ResumeSectionRow>
	</section>
{/if}
