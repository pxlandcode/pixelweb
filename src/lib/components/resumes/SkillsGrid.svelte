<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';
	import { Input, FormControl } from '@pixelcode_/blocks/components';
	import TechStackSelector from '../TechStackSelector.svelte';

	let { block, isEditing = false } = $props<{
		block: Extract<ResumeBlock, { type: 'skills_grid' }>;
		isEditing?: boolean;
	}>();

	let editingBlock = $state({ ...block });

	$effect(() => {
		editingBlock = { ...block };
	});
</script>

{#if isEditing}
	<section class="resume-print-section rounded-lg border border-slate-200 bg-slate-50 p-4">
		<FormControl label="Title">
			<Input bind:value={editingBlock.title} class="border-slate-300 bg-white text-slate-900" />
		</FormControl>

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
		<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">{block.title}</p>
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
