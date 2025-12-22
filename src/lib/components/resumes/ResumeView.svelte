<script lang="ts">
	import type {
		ResumeData,
		HighlightedExperience,
		ExperienceItem,
		LabeledItem
	} from '$lib/types/resume';
	import { soloImages } from '$lib/images/manifest';
	import worldclassUrl from '$lib/assets/worldclass.svg?url';

	// Import all resume components
	import {
		ResumeBrand,
		ResumeLanguageToggle,
		ResumeProfileImage,
		ResumeExampleSkills,
		ResumeContacts,
		ResumeNameTitle,
		ResumeSummary,
		ResumeHighlightedExperiences,
		ResumePreviousExperiences,
		ResumeSkills,
		ResumeOther,
		ResumeFooter,
		type Language
	} from './components';
	import type { Person, TechCategory } from '$lib/types/resume';

	type ImageResource = (typeof soloImages)[keyof typeof soloImages];

	let {
		data,
		image,
		language = $bindable('sv'),
		isEditing = false,
		person,
		profileTechStack
	}: {
		data: ResumeData;
		image?: ImageResource | string | null;
		language?: Language;
		isEditing?: boolean;
		person?: Person;
		profileTechStack?: TechCategory[];
	} = $props();

	let profileCategories = $state(structuredClone(profileTechStack ?? person?.techStack ?? []));
	const displayName = $derived(person?.name ?? data.name ?? '');

	const resolvedImage: ImageResource | string | null = $derived.by(() => {
		return image ?? person?.avatar_url ?? null;
	});

	$effect(() => {
		profileCategories = structuredClone(profileTechStack ?? person?.techStack ?? []);
	});

	// Helper to ensure all items have unique IDs
	const ensureIds = <T extends { _id?: string }>(items: T[]): T[] => {
		return items.map((item) => ({
			...item,
			_id: item._id ?? crypto.randomUUID()
		}));
	};

	// Local editing state
	let editingData = $state<ResumeData>(structuredClone(data));

	// Sync prop changes to local state and ensure IDs
	$effect(() => {
		if (!isEditing) {
			const cloned = structuredClone(data);
			cloned.experiences = ensureIds(cloned.experiences);
			cloned.highlightedExperiences = ensureIds(cloned.highlightedExperiences);
			editingData = cloned;
		}
	});

	$effect(() => {
		editingData.name = displayName;
		editingData.techniques = profileCategories.flatMap((cat) => cat.skills ?? []);
		editingData.methods = [];
	});

	// Toggle language
	const toggleLanguage = () => {
		language = language === 'sv' ? 'en' : 'sv';
	};

	// Experience management
	const addExperience = () => {
		const newExp: ExperienceItem = {
			_id: crypto.randomUUID(),
			startDate: new Date().toISOString().split('T')[0],
			endDate: null,
			company: 'Company Name',
			location: { sv: 'Plats', en: 'Location' },
			role: { sv: 'Roll', en: 'Role' },
			description: { sv: '<p>Beskrivning...</p>', en: '<p>Description...</p>' },
			technologies: []
		};
		editingData.experiences = [newExp, ...editingData.experiences];
	};

	const removeExperience = (index: number) => {
		editingData.experiences = editingData.experiences.filter((_, i) => i !== index);
	};

	const moveExperience = (index: number, direction: 'up' | 'down') => {
		const newIndex = direction === 'up' ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= editingData.experiences.length) return;
		const items = [...editingData.experiences];
		[items[index], items[newIndex]] = [items[newIndex], items[index]];
		editingData.experiences = items;
	};

	const reorderExperience = (fromIndex: number, toIndex: number) => {
		const items = [...editingData.experiences];
		const [removed] = items.splice(fromIndex, 1);
		items.splice(toIndex, 0, removed);
		editingData.experiences = items;
	};

	// Highlighted experience management
	const addHighlightedExperience = () => {
		const newExp: HighlightedExperience = {
			_id: crypto.randomUUID(),
			company: 'Company Name',
			role: { sv: 'Roll', en: 'Role' },
			description: { sv: '<p>Beskrivning...</p>', en: '<p>Description...</p>' },
			technologies: []
		};
		editingData.highlightedExperiences = [...editingData.highlightedExperiences, newExp];
	};

	const removeHighlightedExperience = (index: number) => {
		editingData.highlightedExperiences = editingData.highlightedExperiences.filter(
			(_, i) => i !== index
		);
	};

	const moveHighlightedExperience = (index: number, direction: 'up' | 'down') => {
		const newIndex = direction === 'up' ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= editingData.highlightedExperiences.length) return;
		const items = [...editingData.highlightedExperiences];
		[items[index], items[newIndex]] = [items[newIndex], items[index]];
		editingData.highlightedExperiences = items;
	};

	// Language management
	const addLanguage = () => {
		const newLang: LabeledItem = {
			label: { sv: 'Språk', en: 'Language' },
			value: { sv: 'Nivå', en: 'Level' }
		};
		editingData.languages = [...editingData.languages, newLang];
	};

	const removeLanguage = (index: number) => {
		editingData.languages = editingData.languages.filter((_, i) => i !== index);
	};

	// Education management
	const addEducation = () => {
		const newEdu: LabeledItem = {
			label: 'Institution',
			value: { sv: 'Program', en: 'Program' }
		};
		editingData.education = [...editingData.education, newEdu];
	};

	const removeEducation = (index: number) => {
		editingData.education = editingData.education.filter((_, i) => i !== index);
	};

	// Portfolio management
	const addPortfolioUrl = () => {
		editingData.portfolio = [...(editingData.portfolio ?? []), 'https://'];
	};

	const removePortfolioUrl = (index: number) => {
		editingData.portfolio = (editingData.portfolio ?? []).filter((_, i) => i !== index);
	};

	// Contact management
	const addContact = () => {
		editingData.contacts = [...editingData.contacts, { name: 'Name', phone: '', email: '' }];
	};

	const removeContact = (index: number) => {
		editingData.contacts = editingData.contacts.filter((_, i) => i !== index);
	};

	// Export the edited data for the parent to save
	export const getEditedData = () => editingData;
</script>

<div class="resume-print-page relative bg-white p-10 text-slate-900 shadow-sm">
	<!-- Language Toggle -->
	{#if !isEditing}
		<ResumeLanguageToggle {language} onToggle={toggleLanguage} />
	{/if}

	<!-- Header Section -->
	<div class="header-top">
		<!-- Brand -->
		<ResumeBrand />

		{#if isEditing}
			<!-- Edit Mode: Single column layout for easier editing -->
			<div class="space-y-6">
				<!-- Profile Image + Name/Title row -->
				<div class="flex items-start gap-6">
					<div class="h-[216px] w-[216px] flex-shrink-0">
						<ResumeProfileImage image={resolvedImage} name={displayName} />
					</div>
					<div class="flex-1">
						<!-- Name fixed from profile; allow title editing -->
						<h1 class="mb-2 text-4xl font-bold text-slate-900">{displayName}</h1>
						<ResumeNameTitle bind:title={editingData.title} {isEditing} {language} />
					</div>
				</div>

				<!-- Example Skills + Contacts stacked -->
				<div class="space-y-4">
					<ResumeExampleSkills bind:skills={editingData.exampleSkills} {isEditing} {language} />
					<ResumeContacts
						bind:contacts={editingData.contacts}
						{isEditing}
						{language}
						onAdd={addContact}
						onRemove={removeContact}
					/>
				</div>

				<!-- Summary -->
				<ResumeSummary bind:summary={editingData.summary} {isEditing} {language} />

				<!-- Highlighted Experience -->
				<ResumeHighlightedExperiences
					bind:experiences={editingData.highlightedExperiences}
					{isEditing}
					{language}
					onAdd={addHighlightedExperience}
					onRemove={removeHighlightedExperience}
					onMove={moveHighlightedExperience}
				/>
			</div>
		{:else}
			<!-- View Mode: Two Column Layout -->
			<div class="header-grid grid flex-1 grid-cols-1 gap-8 md:grid-cols-[45mm_1fr]">
				<!-- Left Column: Image + Skills + Contact -->
				<div class="consultant-profile">
					<!-- Profile Image -->
					<ResumeProfileImage image={resolvedImage ?? image} name={displayName} />

					<!-- Example Skills -->
					<ResumeExampleSkills bind:skills={editingData.exampleSkills} {isEditing} {language} />

					<!-- Contacts -->
					<ResumeContacts
						bind:contacts={editingData.contacts}
						{isEditing}
						{language}
						onAdd={addContact}
						onRemove={removeContact}
					/>
				</div>

				<!-- Right Column: Name + Summary + Highlighted Experience -->
				<div class="space-y-6">
					<!-- Name and Title -->
					<ResumeNameTitle
						name={displayName}
						bind:title={editingData.title}
						{isEditing}
						{language}
					/>

					<!-- Summary -->
					<ResumeSummary bind:summary={editingData.summary} {isEditing} {language} />

					<!-- Highlighted Experience -->
					<ResumeHighlightedExperiences
						bind:experiences={editingData.highlightedExperiences}
						{isEditing}
						{language}
						onAdd={addHighlightedExperience}
						onRemove={removeHighlightedExperience}
						onMove={moveHighlightedExperience}
					/>
				</div>
			</div>
		{/if}
	</div>

	<!-- Previous Experience Section -->
	<ResumePreviousExperiences
		bind:experiences={editingData.experiences}
		{isEditing}
		{language}
		onAdd={addExperience}
		onRemove={removeExperience}
		onMove={moveExperience}
		onReorder={reorderExperience}
	/>

	<!-- Skills Section -->
	<ResumeSkills
		bind:techniques={editingData.techniques}
		bind:methods={editingData.methods}
		bind:profileTechStack={profileCategories}
		{isEditing}
		{language}
	/>

	<!-- Other Section -->
	<ResumeOther
		bind:languages={editingData.languages}
		bind:education={editingData.education}
		portfolio={editingData.portfolio ?? []}
		{isEditing}
		{language}
		onAddLanguage={addLanguage}
		onRemoveLanguage={removeLanguage}
		onAddEducation={addEducation}
		onRemoveEducation={removeEducation}
		onAddPortfolioUrl={addPortfolioUrl}
		onRemovePortfolioUrl={removePortfolioUrl}
	/>

	<!-- Footer -->
	<ResumeFooter bind:footerNote={editingData.footerNote} {isEditing} {language} />

	<!-- Worldclass Image -->
	<div class="mt-8 flex justify-center border-t border-slate-200 pt-6">
		<img
			src={worldclassUrl}
			alt="Worldclass Tech, Worldclass People"
			class="max-h-[200px] w-auto object-contain"
			loading="lazy"
		/>
	</div>
</div>

<style>
	.consultant-profile {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
