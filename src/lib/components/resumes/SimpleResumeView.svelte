<script lang="ts">
	import type {
		ResumeData,
		HighlightedExperience,
		ExperienceItem,
		LabeledItem
	} from '$lib/types/resume';
	import { soloImages } from '$lib/images/manifest';

	// Import all simple-resume components
	import {
		SimpleResumeBrand,
		SimpleResumeLanguageToggle,
		SimpleResumeProfileImage,
		SimpleResumeExampleSkills,
		SimpleResumeContacts,
		SimpleResumeNameTitle,
		SimpleResumeSummary,
		SimpleResumeHighlightedExperiences,
		SimpleResumePreviousExperiences,
		SimpleResumeSkills,
		SimpleResumeOther,
		SimpleResumeFooter,
		type Language
	} from './simple-resume';

	type ImageResource = (typeof soloImages)[keyof typeof soloImages];

	let {
		data,
		image,
		language = 'sv',
		isEditing = false
	}: {
		data: ResumeData;
		image?: ImageResource;
		language?: Language;
		isEditing?: boolean;
	} = $props();

	// Local editing state
	let editingData = $state<ResumeData>(structuredClone(data));

	// Sync prop changes to local state
	$effect(() => {
		if (!isEditing) {
			editingData = structuredClone(data);
		}
	});

	// Toggle language
	const toggleLanguage = () => {
		language = language === 'sv' ? 'en' : 'sv';
	};

	// Experience management
	const addExperience = () => {
		const newExp: ExperienceItem = {
			startDate: new Date().toISOString().split('T')[0],
			endDate: null,
			company: 'Company Name',
			location: { sv: 'Plats', en: 'Location' },
			role: { sv: 'Roll', en: 'Role' },
			description: { sv: '<p>Beskrivning...</p>', en: '<p>Description...</p>' },
			technologies: []
		};
		editingData.experiences = [...editingData.experiences, newExp];
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

	// Highlighted experience management
	const addHighlightedExperience = () => {
		const newExp: HighlightedExperience = {
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
		<SimpleResumeLanguageToggle {language} onToggle={toggleLanguage} />
	{/if}

	<!-- Header Section -->
	<div class="header-top">
		<!-- Brand -->
		<SimpleResumeBrand />

		<!-- Two Column Layout -->
		<div class="header-grid grid flex-1 grid-cols-1 gap-8 md:grid-cols-[180px_1fr]">
			<!-- Left Column: Image + Skills + Contact -->
			<div class="consultant-profile">
				<!-- Profile Image -->
				<SimpleResumeProfileImage {image} name={editingData.name} />

				<!-- Example Skills -->
				<SimpleResumeExampleSkills bind:skills={editingData.exampleSkills} {isEditing} {language} />

				<!-- Contacts -->
				<SimpleResumeContacts
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
				<SimpleResumeNameTitle
					bind:name={editingData.name}
					bind:title={editingData.title}
					{isEditing}
					{language}
				/>

				<!-- Summary -->
				<SimpleResumeSummary bind:summary={editingData.summary} {isEditing} {language} />

				<!-- Highlighted Experience -->
				<SimpleResumeHighlightedExperiences
					bind:experiences={editingData.highlightedExperiences}
					{isEditing}
					{language}
					onAdd={addHighlightedExperience}
					onRemove={removeHighlightedExperience}
					onMove={moveHighlightedExperience}
				/>
			</div>
		</div>
	</div>

	<!-- Previous Experience Section -->
	<SimpleResumePreviousExperiences
		bind:experiences={editingData.experiences}
		{isEditing}
		{language}
		onAdd={addExperience}
		onRemove={removeExperience}
		onMove={moveExperience}
	/>

	<!-- Skills Section -->
	<SimpleResumeSkills
		bind:techniques={editingData.techniques}
		bind:methods={editingData.methods}
		{isEditing}
		{language}
	/>

	<!-- Other Section -->
	<SimpleResumeOther
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
	<SimpleResumeFooter bind:footerNote={editingData.footerNote} {isEditing} {language} />
</div>

<style>
	.consultant-profile {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
