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

	import pdfStyles from './pdf-print.css?inline';
	import andLogo from '$lib/assets/and.svg?url';

	import { soloImages } from '$lib/images/manifest';
	import { MockResumeService } from '$lib/api/mock-resumes';

	let { blocks, personId } = $props<{ blocks: ResumeBlock[]; personId?: string }>();

	const person = $derived(personId ? MockResumeService.getPerson(personId) : undefined);
	const image = $derived(person ? soloImages[person.portraitId] : undefined);

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

	const otherBlocks = $derived(
		visibleBlocks.filter(
			(b: ResumeBlock) =>
				b.type !== ResumeBlockType.HEADER &&
				b.type !== ResumeBlockType.SKILLS_GRID &&
				b.type !== ResumeBlockType.HIGHLIGHTED_EXPERIENCE &&
				b.type !== ResumeBlockType.EXPERIENCE_ITEM
		)
	);

	const firstExperienceIndex = $derived(
		otherBlocks.findIndex((b: ResumeBlock) => b.type === ResumeBlockType.EXPERIENCE_SECTION)
	);

	// If there is no experience section, everything goes to page 2 (or just flows)
	// But based on the plan:
	// Page 1: Header (Cover Page)
	// Page 2+: Everything else

	// We can just dump all "otherBlocks" into the second page container.
	// However, we need to handle ExperienceItems correctly within ExperienceSection.

	const visibleExperienceItems = $derived(
		visibleBlocks.filter((b: ResumeBlock) => b.type === ResumeBlockType.EXPERIENCE_ITEM)
	);
	/* Inject the print styles */
	/* We use @html to inject the styles to avoid Svelte parsing issues with the imported string */
</script>

<svelte:head>
	{@html `<style>${pdfStyles}</style>`}
</svelte:head>

<div class="pdf-mode">
	<!-- PAGE 1: COVER PAGE -->
	<div class="resume-print-page page-1 bg-white text-slate-900">
		{#if header}
			<ResumeHeader {header} {skillsGrid} {highlightedExps} {image} />
		{/if}

		<!-- Ampersand at bottom left -->
		<div class="ampersand-container">
			<img src={andLogo} class="ampersand-logo h-20 w-auto opacity-80" alt="&" />
			<p class="ampersand-url">www.pixelcode.se</p>
		</div>
	</div>

	<!-- PAGE 2+: CONTENT -->
	{#if otherBlocks.length > 0}
		<div class="page-break"></div>

		<div class="resume-print-page page-2-plus bg-white text-slate-900">
			{#each otherBlocks as block}
				{#if block.type === ResumeBlockType.SKILLS_GRID}
					<SkillsGrid {block} />
					<HighlightedExperience experience={block} />
				{:else if block.type === ResumeBlockType.EXPERIENCE_SECTION}
					<ExperienceSection {block}>
						{#each visibleExperienceItems as item}
							<ExperienceItem block={item} />
						{/each}
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

			<!-- Ampersand at bottom left -->
			<div class="ampersand-container">
				<img src={andLogo} class="ampersand-logo h-20 w-auto opacity-80" alt="&" />
				<p class="ampersand-url">www.pixelcode.se</p>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Local overrides */
	.pdf-mode {
		background: #fff;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0;
	}

	.page-1 {
		display: flex;
		flex-direction: column;
		/* We want the header to take up space, but maybe not vertically center if it looks weird. 
           Let's try to just let it flow but ensure minimum height is enforced by .resume-print-page */
		min-height: 297mm;
		position: relative;
	}

	.ampersand-container {
		position: absolute;
		bottom: 15mm;
		left: 15mm;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2mm;
	}

	.ampersand-url {
		margin: 0;
		font-size: 8px;
		color: rgb(148 163 184);
	}

	:global(body) {
		background: #fff;
	}

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
