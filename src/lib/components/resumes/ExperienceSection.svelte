<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';

	let { block } = $props<{
		block: Extract<ResumeBlock, { type: 'experience_section' }>;
	}>();
</script>

<section class="resume-print-section">
	<div class="grid gap-6 md:grid-cols-[15%_15%_1fr] grid-print-experience">
		<h2 class="text-base font-bold text-slate-900 uppercase">{block.title}</h2>
		<div class="flex items-center">
			<div class="h-px w-full bg-orange-500"></div>
		</div>
		<div class="flex items-center">
			<div class="h-px flex-1 bg-slate-300"></div>
		</div>
	</div>

	<div class="mt-4 space-y-4">
		<slot />
	</div>
</section>
