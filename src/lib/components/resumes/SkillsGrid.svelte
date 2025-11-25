<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';

	let { block } = $props<{
		block: Extract<ResumeBlock, { type: 'skills_grid' }>;
	}>();
</script>

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
