<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';
	import ConsultantProfile from './ConsultantProfile.svelte';
	import HighlightedExperience from './HighlightedExperience.svelte';
	import QuillEditor from '../QuillEditor.svelte';
	import { Button, Input, FormControl } from '@pixelcode_/blocks/components';
	import TechStackSelector from '../TechStackSelector.svelte';
	import { soloImages, type ImageResource } from '$lib/images/manifest';
	import pixelcodeLogoDark from '$lib/assets/pixelcodelogodark.svg?url';

	let {
		header,
		skillsGrid,
		highlightedExps = [],
		isEditing = false,
		image,
		language = 'sv'
	} = $props<{
		header: Extract<ResumeBlock, { type: 'header' }>;
		skillsGrid?: Extract<ResumeBlock, { type: 'skills_grid' }>;
		highlightedExps?: Extract<ResumeBlock, { type: 'highlighted_experience' }>[];
		isEditing?: boolean;
		image?: ImageResource;
		language?: 'sv' | 'en';
	}>();

	// Helper to resolve localized text
	const resolveText = (content: any) => {
		if (!content) return { text: '', missing: false };
		if (typeof content === 'string') return { text: content, missing: false };
		if (content[language]) return { text: content[language], missing: false };
		const other = language === 'sv' ? 'en' : 'sv';
		return { text: content[other] || '', missing: true };
	};

	// Local state for editing
	let editingHeader = $state(header);
	let editingHighlightedExps = $state(highlightedExps);
	const buildSkillsGrid = () =>
		skillsGrid ?? {
			type: 'skills_grid' as const,
			id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
			title: { sv: 'Exempel på färdigheter', en: 'Examples of skills' },
			columns: 2,
			skills: []
		};
	let editingSkillsGrid = $state(buildSkillsGrid());

	// Sync prop changes to local state
	$effect(() => {
		editingHeader = header;
		editingHighlightedExps = highlightedExps;
		editingSkillsGrid = skillsGrid ?? editingSkillsGrid ?? buildSkillsGrid();
	});

	const addHighlightedExp = () => {
		const newExp: Extract<ResumeBlock, { type: 'highlighted_experience' }> = {
			type: 'highlighted_experience',
			id: crypto.randomUUID(),
			company: 'Company Name',
			role: { sv: 'Roll', en: 'Role Title' },
			description: { sv: '<p>Beskrivning...</p>', en: '<p>Description...</p>' },
			technologies: [],
			hidden: true // Default to hidden
		};

		editingHighlightedExps = [...editingHighlightedExps, newExp];
	};

	const removeHighlightedExp = (index: number) => {
		editingHighlightedExps = editingHighlightedExps.filter((_: unknown, i: number) => i !== index);
	};

	const moveHighlightedExp = (index: number, direction: 'up' | 'down') => {
		if (direction === 'up' && index > 0) {
			const temp = editingHighlightedExps[index];
			editingHighlightedExps[index] = editingHighlightedExps[index - 1];
			editingHighlightedExps[index - 1] = temp;
		} else if (direction === 'down' && index < editingHighlightedExps.length - 1) {
			const temp = editingHighlightedExps[index];
			editingHighlightedExps[index] = editingHighlightedExps[index + 1];
			editingHighlightedExps[index + 1] = temp;
		}
	};

	const toggleVisibility = (index: number) => {
		const exp = editingHighlightedExps[index];
		if (exp.hidden) {
			// Trying to show
			const visibleCount = editingHighlightedExps.filter(
				(e: Extract<ResumeBlock, { type: 'highlighted_experience' }>) => !e.hidden
			).length;
			if (visibleCount >= 2) {
				alert('You can only have 2 highlighted experiences visible at a time.');
				return;
			}
			exp.hidden = false;
		} else {
			exp.hidden = true;
		}
		editingHighlightedExps = [...editingHighlightedExps]; // Trigger reactivity
	};
</script>

<div class="resume-header-content">
	<div class="header-top">
		<div class="header-brand mb-6 text-center">
			<!-- Top Logo / Proudly Presents -->
			<div class="header-brand mb-6 text-center"></div>
			<img src={pixelcodeLogoDark} alt="Pixel & Code" class="mx-auto h-8" />
			<p
				class="-mt-1 -rotate-10 text-2xl text-primary"
				style="font-family: 'Fave Script', cursive;"
			>
				proudly presents
			</p>
		</div>
		<div class="header-grid grid flex-1 grid-cols-1 gap-8 md:grid-cols-[180px_1fr]">
			<!-- Left Column: Image + Skills + Contact -->
			<ConsultantProfile header={editingHeader} skillsGrid={editingSkillsGrid} {image} {language} />

			<!-- Right Column: Name + Description + Highlighted Experience -->
			<div class="space-y-6">
				<!-- Name and Title -->
				<div>
					{#if isEditing}
						<div class="mb-4 space-y-3">
							<FormControl label="Name">
								<Input
									id="header-name"
									bind:value={editingHeader.name}
									class="border-slate-300 bg-white text-lg font-bold text-slate-900"
								/>
							</FormControl>
							<FormControl label="Title (SV)">
								<Input
									id="header-title-sv"
									value={typeof editingHeader.title === 'string'
										? editingHeader.title
										: editingHeader.title.sv}
									oninput={(e) => {
										if (typeof editingHeader.title === 'string') {
											editingHeader.title = { sv: e.currentTarget.value, en: editingHeader.title };
										} else {
											editingHeader.title.sv = e.currentTarget.value;
										}
									}}
									class="border-slate-300 bg-white text-slate-900"
								/>
							</FormControl>
							<FormControl label="Title (EN)">
								<Input
									id="header-title-en"
									value={typeof editingHeader.title === 'string'
										? editingHeader.title
										: editingHeader.title.en}
									oninput={(e) => {
										if (typeof editingHeader.title === 'string') {
											editingHeader.title = { en: e.currentTarget.value, sv: editingHeader.title };
										} else {
											editingHeader.title.en = e.currentTarget.value;
										}
									}}
									class="border-slate-300 bg-white text-slate-900"
								/>
							</FormControl>
						</div>
					{:else}
						{@const title = resolveText(editingHeader.title)}
						<h1 class="mb-2 text-4xl font-bold text-slate-900">{editingHeader.name}</h1>
						<h2 class="flex items-center gap-2 text-xl font-medium text-slate-700">
							{title.text}
							{#if title.missing}
								<span
									class="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
								>
									Missing translation
								</span>
							{/if}
						</h2>
					{/if}
				</div>

				<!-- Description -->
				<div>
					{#if isEditing}
						<div class="rounded-md border border-slate-200 bg-white p-2">
							<label class="mb-1 block text-sm font-medium text-slate-700">Summary (SV)</label>
							<QuillEditor
								content={typeof editingHeader.summary === 'string'
									? editingHeader.summary
									: editingHeader.summary.sv}
								onchange={(html) => {
									if (typeof editingHeader.summary === 'string') {
										editingHeader.summary = { sv: html, en: editingHeader.summary };
									} else {
										editingHeader.summary.sv = html;
									}
								}}
							/>
						</div>
						<div class="mt-4 rounded-md border border-slate-200 bg-white p-2">
							<label class="mb-1 block text-sm font-medium text-slate-700">Summary (EN)</label>
							<QuillEditor
								content={typeof editingHeader.summary === 'string'
									? editingHeader.summary
									: editingHeader.summary.en}
								onchange={(html) => {
									if (typeof editingHeader.summary === 'string') {
										editingHeader.summary = { en: html, sv: editingHeader.summary };
									} else {
										editingHeader.summary.en = html;
									}
								}}
							/>
						</div>
					{:else}
						{@const summary = resolveText(editingHeader.summary)}
						<div class="text-sm leading-relaxed text-slate-700">
							{#if summary.missing}
								<div class="mb-2">
									<span
										class="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
									>
										Missing translation
									</span>
								</div>
							{/if}
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html summary.text}
						</div>
					{/if}
				</div>

				{#if isEditing && editingSkillsGrid}
					<div class="rounded-md border border-slate-200 bg-slate-50 p-3">
						<div class="mb-2 flex items-center justify-between">
							<span class="text-sm font-semibold text-slate-700">Examples of skills</span>
							<span class="text-xs text-slate-500">Shown in the left column</span>
						</div>
						<FormControl label="Title (SV)">
							<Input
								value={typeof editingSkillsGrid.title === 'string'
									? editingSkillsGrid.title
									: editingSkillsGrid.title.sv}
								oninput={(e) => {
									if (typeof editingSkillsGrid.title === 'string') {
										editingSkillsGrid.title = {
											sv: e.currentTarget.value,
											en: editingSkillsGrid.title
										};
									} else {
										editingSkillsGrid.title.sv = e.currentTarget.value;
									}
								}}
								class="border-slate-300 bg-white text-slate-900"
							/>
						</FormControl>
						<FormControl label="Title (EN)">
							<Input
								value={typeof editingSkillsGrid.title === 'string'
									? editingSkillsGrid.title
									: editingSkillsGrid.title.en}
								oninput={(e) => {
									if (typeof editingSkillsGrid.title === 'string') {
										editingSkillsGrid.title = {
											en: e.currentTarget.value,
											sv: editingSkillsGrid.title
										};
									} else {
										editingSkillsGrid.title.en = e.currentTarget.value;
									}
								}}
								class="border-slate-300 bg-white text-slate-900"
							/>
						</FormControl>
						<div class="mt-3">
							<label class="mb-1 block text-sm font-medium text-slate-700">Skills</label>
							<TechStackSelector
								bind:value={editingSkillsGrid.skills}
								onchange={(skills) => (editingSkillsGrid.skills = skills ?? [])}
							/>
						</div>
					</div>
				{/if}

				<!-- Highlighted Experience -->
				<div class="space-y-4">
					{#if !isEditing && editingHighlightedExps.filter((e) => !e.hidden).length > 0}
						<h3 class="pt-4 text-base font-bold tracking-wide text-slate-900 uppercase">
							{language === 'sv' ? 'Utvald Erfarenhet' : 'Highlighted Experience'}
						</h3>
					{/if}

					{#each isEditing ? editingHighlightedExps : editingHighlightedExps.filter((e) => !e.hidden) as exp, index (exp.id)}
						<div class="group relative">
							{#if isEditing}
								<div
									class="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 transition-opacity"
									class:opacity-60={exp.hidden}
								>
									<div class="mb-4 flex items-center justify-between">
										<div class="flex items-center gap-3">
											<h4 class="font-semibold text-slate-700">Experience {index + 1}</h4>
											<button
												class="rounded-full px-2 py-0.5 text-xs font-medium transition-colors"
												class:bg-green-100={!exp.hidden}
												class:text-green-800={!exp.hidden}
												class:bg-slate-200={exp.hidden}
												class:text-slate-600={exp.hidden}
												onclick={() => toggleVisibility(index)}
											>
												{exp.hidden ? 'Hidden' : 'Visible'}
											</button>
										</div>
										<div class="flex gap-2">
											<Button
												variant="ghost"
												size="sm"
												disabled={index === 0}
												onclick={() => moveHighlightedExp(index, 'up')}
											>
												↑
											</Button>
											<Button
												variant="ghost"
												size="sm"
												disabled={index === editingHighlightedExps.length - 1}
												onclick={() => moveHighlightedExp(index, 'down')}
											>
												↓
											</Button>
											<Button
												variant="ghost"
												size="sm"
												class="text-red-600 hover:bg-red-50"
												onclick={() => removeHighlightedExp(index)}
											>
												Remove
											</Button>
										</div>
									</div>

									<div class="space-y-3">
										<div class="grid grid-cols-2 gap-4">
											<FormControl label="Company">
												<Input
													bind:value={exp.company}
													class="border-slate-300 bg-white text-slate-900"
												/>
											</FormControl>
											<div class="space-y-2">
												<FormControl label="Role (SV)">
													<Input
														value={typeof exp.role === 'string' ? exp.role : exp.role.sv}
														oninput={(e) => {
															if (typeof exp.role === 'string') {
																exp.role = { sv: e.currentTarget.value, en: exp.role };
															} else {
																exp.role.sv = e.currentTarget.value;
															}
														}}
														class="border-slate-300 bg-white text-slate-900"
													/>
												</FormControl>
												<FormControl label="Role (EN)">
													<Input
														value={typeof exp.role === 'string' ? exp.role : exp.role.en}
														oninput={(e) => {
															if (typeof exp.role === 'string') {
																exp.role = { en: e.currentTarget.value, sv: exp.role };
															} else {
																exp.role.en = e.currentTarget.value;
															}
														}}
														class="border-slate-300 bg-white text-slate-900"
													/>
												</FormControl>
											</div>
										</div>

										<div>
											<label class="mb-1 block text-sm font-medium text-slate-700"
												>Description (SV)</label
											>
											<div class="rounded-md border border-slate-300 bg-white">
												<QuillEditor
													content={typeof exp.description === 'string'
														? exp.description
														: exp.description.sv}
													onchange={(html) => {
														if (typeof exp.description === 'string') {
															exp.description = { sv: html, en: exp.description };
														} else {
															exp.description.sv = html;
														}
													}}
												/>
											</div>
										</div>
										<div>
											<label class="mb-1 block text-sm font-medium text-slate-700"
												>Description (EN)</label
											>
											<div class="rounded-md border border-slate-300 bg-white">
												<QuillEditor
													content={typeof exp.description === 'string'
														? exp.description
														: exp.description.en}
													onchange={(html) => {
														if (typeof exp.description === 'string') {
															exp.description = { en: html, sv: exp.description };
														} else {
															exp.description.en = html;
														}
													}}
												/>
											</div>
										</div>

										<div>
											<label class="mb-1 block text-sm font-medium text-slate-700">
												Technologies
											</label>
											<TechStackSelector
												bind:value={exp.technologies}
												onchange={(techs) => (exp.technologies = techs)}
											/>
										</div>
									</div>
								</div>
							{:else}
								<HighlightedExperience experience={exp} {language} />
							{/if}
						</div>
					{/each}

					{#if isEditing}
						<Button
							variant="outline"
							class="w-full border-dashed border-slate-300 text-slate-700 hover:bg-slate-50"
							onclick={addHighlightedExp}
						>
							+ Add Highlighted Experience
						</Button>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
