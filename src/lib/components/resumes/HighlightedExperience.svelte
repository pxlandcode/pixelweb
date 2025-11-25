<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';

	let { experience } = $props<{
		experience: Extract<ResumeBlock, { type: 'highlighted_experience' }>;
	}>();
</script>

<div class="space-y-3 pt-4">
	<h3 class="text-base font-bold tracking-wide text-slate-900 uppercase">Highlighted Experience</h3>
	<div>
		<p class="text-sm font-semibold text-slate-900">{experience.company}</p>
		<p class="text-sm text-slate-700 italic">{experience.role}</p>
	</div>
	<p class="text-sm leading-relaxed text-slate-700">{experience.description}</p>
	{#if experience.testimonial}
		<blockquote class="border-l-2 border-orange-400 pl-3 text-sm text-slate-700 italic">
			"{experience.testimonial}"
		</blockquote>
	{/if}
	<div class="space-y-1">
		<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Technologies</p>
		<div class="flex flex-wrap gap-2">
			{#each experience.technologies as tech}
				<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800">{tech}</span>
			{/each}
		</div>
	</div>
</div>
