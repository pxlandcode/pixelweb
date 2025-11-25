<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';

	let { block } = $props<{
		block: Extract<ResumeBlock, { type: 'multi_column_info' }>;
	}>();
</script>

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
