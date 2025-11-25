<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';

	let { block } = $props<{
		block: Extract<ResumeBlock, { type: 'testimonial' }>;
	}>();
</script>

<section class="resume-print-section">
	<blockquote class="border-l-2 border-orange-400 pl-3 text-sm text-slate-700 italic">
		"{block.quote}"
	</blockquote>
	<p class="mt-2 text-sm font-semibold text-slate-800">{block.source}</p>
</section>
