<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';
	import pixelcodeLogoDark from '$lib/assets/pixelcodelogodark.svg?url';
	import andLogo from '$lib/assets/and.svg?url';
	import ConsultantProfile from './ConsultantProfile.svelte';
	import HighlightedExperience from './HighlightedExperience.svelte';
	import QuillEditor from '../QuillEditor.svelte';
	import { Button, Input, FormControl } from '@pixelcode_/blocks/components';
	import TechStackSelector from '../TechStackSelector.svelte';
	import { soloImages } from '$lib/images/manifest';

	let {
		header,
		skillsGrid,
		highlightedExps = [],
		isEditing = false
	} = $props<{
		header: Extract<ResumeBlock, { type: 'header' }>;
		skillsGrid?: Extract<ResumeBlock, { type: 'skills_grid' }>;
		highlightedExps?: Extract<ResumeBlock, { type: 'highlighted_experience' }>[];
		isEditing?: boolean;
	}>();

	// Local state for editing
	let editingHeader = $state(header);
	let editingHighlightedExps = $state(highlightedExps);

	// Sync prop changes to local state
	$effect(() => {
		editingHeader = header;
		editingHighlightedExps = highlightedExps;
	});

	const addHighlightedExp = () => {
		const newExp: Extract<ResumeBlock, { type: 'highlighted_experience' }> = {
			type: 'highlighted_experience',
			id: crypto.randomUUID(),
			company: 'Company Name',
			role: 'Role Title',
			description: '<p>Description of the experience...</p>',
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
			const visibleCount = editingHighlightedExps.filter((e) => !e.hidden).length;
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

	const profileImage = soloImages.pierrePortrait;
</script>

<div class="resume-header-section mb-8">
	<!-- Top Logo and "proudly presents" -->
	<div class="mb-10 space-y-1 text-center">
		<img src={pixelcodeLogoDark} alt="Pixel & Code" class="mx-auto h-10" />
		<p class="-mt-2 -rotate-10 text-3xl text-primary" style="font-family: 'Fave Script', cursive;">
			proudly presents
		</p>
	</div>

	<!-- Main Header Content Grid -->
	<div class="mb-8 grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
		<!-- Left Column: Image + Skills + Contact -->
		<ConsultantProfile {header} {skillsGrid} {andLogo} image={profileImage} />

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
						<FormControl label="Title">
							<Input
								id="header-title"
								bind:value={editingHeader.title}
								class="border-slate-300 bg-white text-slate-900"
							/>
						</FormControl>
					</div>
				{:else}
					<h1 class="mb-2 text-4xl font-bold text-slate-900">{editingHeader.name}</h1>
					<h2 class="text-xl font-medium text-slate-700">{editingHeader.title}</h2>
				{/if}
			</div>

			<!-- Description -->
			<div>
				{#if isEditing}
					<div class="rounded-md border border-slate-200 bg-white p-2">
						<label class="mb-1 block text-sm font-medium text-slate-700">Summary</label>
						<QuillEditor bind:content={editingHeader.summary} />
					</div>
				{:else}
					<div class="text-sm leading-relaxed text-slate-700">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html editingHeader.summary}
					</div>
				{/if}
			</div>

			<!-- Highlighted Experience -->
			<div class="space-y-4">
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
										<FormControl label="Role">
											<Input
												bind:value={exp.role}
												class="border-slate-300 bg-white text-slate-900"
											/>
										</FormControl>
									</div>

									<div>
										<label class="mb-1 block text-sm font-medium text-slate-700">Description</label>
										<div class="rounded-md border border-slate-300 bg-white">
											<QuillEditor bind:content={exp.description} />
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
							<HighlightedExperience experience={exp} />
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

	<!-- Divider after header -->
	<div class="my-8 border-t-2 border-slate-200"></div>
</div>
