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

	let { blocks, isEditing = false } = $props<{ blocks: ResumeBlock[]; isEditing?: boolean }>();

	const visibleBlocks = $derived(blocks.filter((b: ResumeBlock) => !b.hidden));
	const header = $derived(
		visibleBlocks.find((b: ResumeBlock) => b.type === ResumeBlockType.HEADER)
	);
	const skillsGrid = $derived(
		visibleBlocks.find((b: ResumeBlock) => b.type === ResumeBlockType.SKILLS_GRID)
	);
	const highlightedExps = $derived(
		blocks.filter((b: ResumeBlock) => b.type === ResumeBlockType.HIGHLIGHTED_EXPERIENCE)
	);

	// Get ALL experience_item blocks (including hidden) for editing
	const allExperienceItems = $derived(
		blocks.filter((b: ResumeBlock) => b.type === ResumeBlockType.EXPERIENCE_ITEM) as Extract<
			ResumeBlock,
			{ type: 'experience_item' }
		>[]
	);

	// For view mode, only show visible experience items
	const visibleExperienceItems = $derived(
		visibleBlocks.filter((b: ResumeBlock) => b.type === ResumeBlockType.EXPERIENCE_ITEM)
	);

	// All other blocks (excluding experience_item since we handle them separately)
	const otherBlocks = $derived(
		visibleBlocks.filter(
			(b: ResumeBlock) =>
				b.type !== ResumeBlockType.HEADER &&
				b.type !== ResumeBlockType.SKILLS_GRID &&
				b.type !== ResumeBlockType.HIGHLIGHTED_EXPERIENCE &&
				b.type !== ResumeBlockType.EXPERIENCE_ITEM
		)
	);

	let editingExpItems = $state<Extract<ResumeBlock, { type: 'experience_item' }>[]>([]);

	$effect(() => {
		if (isEditing) {
			editingExpItems = allExperienceItems.map((item) => ({ ...item }));
		}
	});

	const moveExpItem = (index: number, direction: 'up' | 'down') => {
		const newIndex = direction === 'up' ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= editingExpItems.length) return;

		const temp = editingExpItems[index];
		editingExpItems[index] = editingExpItems[newIndex];
		editingExpItems[newIndex] = temp;
	};

	const removeExpItem = (index: number) => {
		editingExpItems = editingExpItems.filter((_, i) => i !== index);
	};

	const toggleExpVisibility = (index: number) => {
		editingExpItems[index] = {
			...editingExpItems[index],
			hidden: !editingExpItems[index].hidden
		};
	};
</script>

<div class="resume-print-page relative bg-white p-10 text-slate-900 shadow-sm">
	{#if header && header.type === ResumeBlockType.HEADER}
		<ResumeHeader {header} {skillsGrid} {highlightedExps} {isEditing} />
	{/if}

	{#each otherBlocks as block}
		{#if block.type === ResumeBlockType.SKILLS_GRID}
			<SkillsGrid {block} />
			<HighlightedExperience experience={block} />
		{:else if block.type === ResumeBlockType.EXPERIENCE_SECTION}
			<ExperienceSection {block}>
				{#if isEditing}
					{#each editingExpItems as item, index}
						<ExperienceItem
							block={item}
							{isEditing}
							onMove={(direction) => moveExpItem(index, direction)}
							onRemove={() => removeExpItem(index)}
							onToggleVisibility={() => toggleExpVisibility(index)}
						/>
					{/each}
				{:else}
					{#each visibleExperienceItems as item}
						<ExperienceItem block={item} />
					{/each}
				{/if}
			</ExperienceSection>
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

<style>
	:global(.resume-print-page blockquote) {
		border-left-width: 2px;
		border-color: rgb(251 146 60); /* orange-400 */
		padding-left: 0.75rem; /* pl-3 */
		font-size: 0.875rem; /* text-sm */
		color: rgb(51 65 85); /* text-slate-700 */
		font-style: italic;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
		position: relative;
	}
	:global(.resume-print-page blockquote::before) {
		content: '"';
	}
	:global(.resume-print-page blockquote::after) {
		content: '"';
	}
</style>
