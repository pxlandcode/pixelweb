<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';

	let { block } = $props<{
		block: Extract<ResumeBlock, { type: 'experience_item' }>;
	}>();

	function formatDate(dateString: string | null | undefined): string {
		if (!dateString) return 'Present';
		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			console.error('Invalid date string:', dateString);
			return dateString; // Return original string if invalid date
		}
		const month = date.toLocaleDateString('en-US', { month: 'short' });
		const year = date.getFullYear();
		return `${month} ${year}`;
	}
</script>

<section class="resume-print-section mb-6">
	<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
		<!-- Column 1: Empty -->
		<div></div>

		<!-- Column 2: Period, Company, Location -->
		<div class="space-y-1">
			<p class="text-sm font-semibold text-slate-900">
				<span class="whitespace-nowrap">{formatDate(block.startDate)}</span>
				{#if block.endDate}
					<span> - </span>
					<span class="whitespace-nowrap">{formatDate(block.endDate)}</span>
				{/if}
			</p>
			<p class="text-sm font-semibold text-slate-900">{block.company}</p>
			{#if block.location}
				<p class="text-sm text-slate-700">{block.location}</p>
			{/if}
		</div>

		<!-- Column 3: Role, Description, Technologies -->
		<div class="space-y-3">
			<h3 class="text-base font-bold break-words hyphens-auto text-slate-900" lang="en">
				{Array.isArray(block.role) ? block.role.join(' / ') : block.role}
			</h3>
			<p class="text-sm leading-relaxed break-words hyphens-auto text-slate-700" lang="en">
				{block.description}
			</p>
			{#if block.technologies.length}
				<div class="flex flex-wrap gap-2">
					{#each block.technologies as tech}
						<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800">{tech}</span>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>
