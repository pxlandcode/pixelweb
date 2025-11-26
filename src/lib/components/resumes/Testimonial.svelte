<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';
	import { Input, FormControl, TextArea } from '@pixelcode_/blocks/components';

	let { block, isEditing = false } = $props<{
		block: Extract<ResumeBlock, { type: 'testimonial' }>;
		isEditing?: boolean;
	}>();

	let editingBlock = $state({ ...block });

	$effect(() => {
		editingBlock = { ...block };
	});
</script>

{#if isEditing}
	<section class="resume-print-section rounded-lg border border-slate-200 bg-slate-50 p-4">
		<FormControl label="Quote">
			<TextArea
				bind:value={editingBlock.quote}
				class="border-slate-300 bg-white text-slate-900"
				rows={3}
			/>
		</FormControl>

		<div class="mt-3">
			<FormControl label="Source">
				<Input bind:value={editingBlock.source} class="border-slate-300 bg-white text-slate-900" />
			</FormControl>
		</div>
	</section>
{:else}
	<section class="resume-print-section">
		<blockquote class="border-l-2 border-orange-400 pl-3 text-sm text-slate-700 italic">
			"{block.quote}"
		</blockquote>
		<p class="mt-2 text-sm font-semibold text-slate-800">{block.source}</p>
	</section>
{/if}
