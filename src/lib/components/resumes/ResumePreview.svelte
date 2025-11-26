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
	import { Button } from '@pixelcode_/blocks/components';
	import { soloImages } from '$lib/images/manifest';
	import { MockResumeService } from '$lib/api/mock-resumes';

	let {
		blocks,
		isEditing = false,
		personId
	} = $props<{ blocks: ResumeBlock[]; isEditing?: boolean; personId?: string }>();

	const person = $derived(personId ? MockResumeService.getPerson(personId) : undefined);
	const image = $derived(person ? soloImages[person.portraitId] : undefined);

	const visibleBlocks = $derived(blocks.filter((b) => !b.hidden));

	const header = $derived(visibleBlocks.find((b) => b.type === ResumeBlockType.HEADER));

	const skillsGrid = $derived(visibleBlocks.find((b) => b.type === ResumeBlockType.SKILLS_GRID));

	const highlightedExps = $derived(
		blocks.filter((b) => b.type === ResumeBlockType.HIGHLIGHTED_EXPERIENCE)
	);

	const otherBlocks = $derived(
		visibleBlocks.filter(
			(b) =>
				b.type !== ResumeBlockType.HEADER &&
				b.type !== ResumeBlockType.SKILLS_GRID &&
				b.type !== ResumeBlockType.HIGHLIGHTED_EXPERIENCE &&
				b.type !== ResumeBlockType.EXPERIENCE_ITEM
		)
	);

	const visibleExperienceItems = $derived(
		visibleBlocks.filter((b) => b.type === ResumeBlockType.EXPERIENCE_ITEM)
	);

	const allExperienceItems = $derived(
		blocks.filter((b) => b.type === ResumeBlockType.EXPERIENCE_ITEM)
	);

	let editingExpItems = $state([]);

	$effect(() => {
		if (isEditing) {
			editingExpItems = allExperienceItems.map((i) => ({ ...i }));
		}
	});

	const moveExpItem = (index: number, direction: 'up' | 'down') => {
		const newIndex = direction === 'up' ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= editingExpItems.length) return;
		const tmp = editingExpItems[index];
		editingExpItems[index] = editingExpItems[newIndex];
		editingExpItems[newIndex] = tmp;
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

	const addExpItem = () => {
		const newItem: Extract<ResumeBlock, { type: 'experience_item' }> = {
			type: 'experience_item',
			id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
			startDate: new Date().toISOString().split('T')[0],
			endDate: null,
			company: 'Company Name',
			location: 'Location',
			role: 'Role',
			description: 'Description of your role and responsibilities.',
			technologies: [],
			hidden: false
		};
		editingExpItems = [...editingExpItems, newItem];
	};
</script>

<div class="resume-print-page relative bg-white p-10 text-slate-900 shadow-sm">
	{#if header}
		<ResumeHeader {header} {skillsGrid} {highlightedExps} {isEditing} {image} />
	{/if}

	{#each otherBlocks as block}
		{#if block.type === ResumeBlockType.SKILLS_GRID}
			<SkillsGrid {block} {isEditing} />
			<HighlightedExperience experience={block} />
		{:else if block.type === ResumeBlockType.EXPERIENCE_SECTION}
			<ExperienceSection {block}>
				{#if isEditing}
					{#each editingExpItems as item, index}
						<ExperienceItem
							block={item}
							{isEditing}
							onMove={(dir) => moveExpItem(index, dir)}
							onRemove={() => removeExpItem(index)}
							onToggleVisibility={() => toggleExpVisibility(index)}
						/>
					{/each}

					{#if isEditing}
						<Button
							variant="outline"
							class="mt-4 w-full border-dashed border-slate-300 text-slate-700 hover:bg-slate-50"
							onclick={addExpItem}
						>
							+ Add Experience
						</Button>
					{/if}
				{:else}
					{#each visibleExperienceItems as item}
						<ExperienceItem block={item} />
					{/each}
				{/if}
			</ExperienceSection>
		{:else if block.type === ResumeBlockType.SECTION_HEADER}
			<SectionHeader {block} />
		{:else if block.type === ResumeBlockType.SKILLS_CATEGORIZED}
			<SkillsCategorized {block} {isEditing} />
		{:else if block.type === ResumeBlockType.MULTI_COLUMN_INFO}
			<MultiColumnInfo {block} {isEditing} />
		{:else if block.type === ResumeBlockType.TESTIMONIAL}
			<Testimonial {block} {isEditing} />
		{:else if block.type === ResumeBlockType.FOOTER}
			<ResumeFooter {block} />
		{/if}
	{/each}
</div>

<style>
	:global(.resume-print-page blockquote) {
		border-left-width: 2px;
		border-color: rgb(251 146 60);
		padding-left: 0.75rem;
		font-size: 0.875rem;
		color: rgb(51 65 85);
		font-style: italic;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}
	:global(.resume-print-page blockquote::before) {
		content: '"';
	}
	:global(.resume-print-page blockquote::after) {
		content: '"';
	}
</style>
