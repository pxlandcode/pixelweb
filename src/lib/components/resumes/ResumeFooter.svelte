<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';

	let { block } = $props<{
		block: Extract<ResumeBlock, { type: 'footer' }>;
	}>();
</script>

<section class="resume-print-section">
	<p class="text-sm font-semibold text-orange-600">{block.note}</p>
	{#if block.updated_at}
		<p class="text-xs text-slate-500">{block.updated_at}</p>
	{/if}
</section>
