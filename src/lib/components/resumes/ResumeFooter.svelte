<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';
	import worldclassUrl from '$lib/assets/worldclass.svg?url';

	let { block } = $props<{
		block: Extract<ResumeBlock, { type: 'footer' }>;
	}>();
</script>

<section
	class="resume-print-section mt-8 w-full justify-center border-t border-slate-300 pt-2 text-center"
>
	<div class="mb-3 flex justify-center">
		<img
			src={worldclassUrl}
			alt="Worldclass Tech, Worldclass People"
			class="max-h-[300px] w-full max-w-xs object-contain"
			loading="lazy"
		/>
	</div>
</section>
