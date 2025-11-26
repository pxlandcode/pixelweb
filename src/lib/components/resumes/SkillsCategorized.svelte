<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';

	let { block } = $props<{
		block: Extract<ResumeBlock, { type: 'skills_categorized' }>;
	}>();
</script>

<section class="resume-print-section mb-6">
	<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
		<div></div>
		<p class="text-xs font-semibold tracking-wide text-slate-700 uppercase">{block.category}</p>
		{#if block.category.toLowerCase().includes('language')}
			<div class="flex flex-col gap-1 text-sm text-slate-800">
				{#each block.items as item}
					{#if typeof item === 'string'}
						<p><span class="font-bold">{item}</span></p>
					{:else}
						<p><span class="font-bold">{item.label}</span>: {item.value || ''}</p>
					{/if}
				{/each}
			</div>
		{:else if block.category.toLowerCase().includes('portfolio')}
			<div class="flex flex-wrap gap-2 text-xs text-slate-800">
				{#each block.items as item}
					{#if typeof item === 'string'}
						<a
							href={item}
							target="_blank"
							rel="noopener noreferrer"
							class="underline decoration-slate-400 underline-offset-2 hover:decoration-slate-700">{item}</a
						>
					{:else if item.value}
						<a
							href={item.value}
							target="_blank"
							rel="noopener noreferrer"
							class="underline decoration-slate-400 underline-offset-2 hover:decoration-slate-700">{item.value}</a
						>
					{/if}
				{/each}
			</div>
		{:else}
			<div class="flex flex-wrap gap-2">
				{#each block.items as item}
					{#if typeof item === 'string'}
						<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800">{item}</span>
					{:else}
						<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800">
							<span class="font-semibold">{item.label}</span>
							{#if item.value}
								<span>: {item.value}</span>
							{/if}
						</span>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</section>
