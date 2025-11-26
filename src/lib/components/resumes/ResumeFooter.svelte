<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';

	let { block } = $props<{
		block: Extract<ResumeBlock, { type: 'footer' }>;
	}>();
</script>

<section
	class="resume-print-section mt-8 w-full justify-center border-t border-slate-300 pt-2 text-center"
>
	<p class="text-sm text-primary">{block.note}</p>
	{#if block.updated_at}
		<p class="text-xs text-slate-500">{block.updated_at}</p>
	{/if}
</section>
