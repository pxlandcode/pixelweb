<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';
	import { ResumeBlockType } from './constants';
	import ResumeHeader from './ResumeHeader.svelte';
	import ExperienceItem from './ExperienceItem.svelte';
	import ExperienceSection from './ExperienceSection.svelte';
	import SkillsGrid from './SkillsGrid.svelte';
	import SkillsCategorized from './SkillsCategorized.svelte';
	import SectionHeader from './SectionHeader.svelte';
	import HighlightedExperience from './HighlightedExperience.svelte';
	import MultiColumnInfo from './MultiColumnInfo.svelte';
	import Testimonial from './Testimonial.svelte';
	import ResumeFooter from './ResumeFooter.svelte';

	let { blocks } = $props<{ blocks: ResumeBlock[] }>();

	const visibleBlocks = $derived(blocks.filter((b: ResumeBlock) => !b.hidden));
	const header = $derived(
		visibleBlocks.find((b: ResumeBlock) => b.type === ResumeBlockType.HEADER)
	);
	const skillsGrid = $derived(
		visibleBlocks.find((b: ResumeBlock) => b.type === ResumeBlockType.SKILLS_GRID)
	);
	const highlightedExp = $derived(
		visibleBlocks.find((b: ResumeBlock) => b.type === ResumeBlockType.HIGHLIGHTED_EXPERIENCE)
	);
	const otherBlocks = $derived(
		visibleBlocks.filter(
			(b: ResumeBlock) =>
				b.type !== ResumeBlockType.HEADER &&
				b.type !== ResumeBlockType.SKILLS_GRID &&
				b.type !== ResumeBlockType.HIGHLIGHTED_EXPERIENCE
		)
	);
</script>

<div class="resume-print-page bg-white p-10 text-slate-900 shadow-sm">
	{#if header && header.type === ResumeBlockType.HEADER}
		<ResumeHeader {header} {skillsGrid} {highlightedExp} />
	{/if}

	{#each otherBlocks as block}
		{#if block.type === ResumeBlockType.SKILLS_GRID}
			<SkillsGrid {block} />
		{:else if block.type === ResumeBlockType.HIGHLIGHTED_EXPERIENCE}
			<HighlightedExperience experience={block} />
		{:else if block.type === ResumeBlockType.EXPERIENCE_SECTION}
			<ExperienceSection {block} />
		{:else if block.type === ResumeBlockType.EXPERIENCE_ITEM}
			<ExperienceItem {block} />
		{:else if block.type === ResumeBlockType.SECTION_HEADER}
			<SectionHeader {block} />
		{:else if block.type === ResumeBlockType.SKILLS_CATEGORIZED}
			<SkillsCategorized {block} />
		{:else if block.type === ResumeBlockType.MULTI_COLUMN_INFO}
			<MultiColumnInfo {block} />
		{:else if block.type === ResumeBlockType.TESTIMONIAL}
			<Testimonial {block} />
		{:else if block.type === ResumeBlockType.FOOTER}
			<ResumeFooter {block} />
		{/if}
	{/each}
</div>
