<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';
	import { Input, FormControl, Button, TextArea } from '@pixelcode_/blocks/components';
	import TechStackSelector from '../TechStackSelector.svelte';

	let { block, isEditing = false } = $props<{
		block: Extract<ResumeBlock, { type: 'multi_column_info' }>;
		isEditing?: boolean;
	}>();

	let editingBlock = $state({ ...block });

	$effect(() => {
		editingBlock = { ...block };
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
			<div class="grid gap-2 md:grid-cols-[140px_1fr] md:items-start">
				<p class="text-sm font-semibold text-slate-700">{item.label}</p>
				<div class="space-y-1 text-sm text-slate-800">
					<p>{item.description}</p>
					{#if item.technologies?.length}
						<div class="flex flex-wrap gap-2">
							{#each item.technologies as tech}
								<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800">
									{tech}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</section>
{/if}
