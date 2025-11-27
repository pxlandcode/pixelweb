<script lang="ts">
	import { page } from '$app/stores';
	import { MockResumeService } from '$lib/api/mock-resumes';
	import { soloImages } from '$lib/images/manifest';
	import { Button, Card, Input, TextArea } from '@pixelcode_/blocks/components';
	import {
		ArrowLeft,
		Calendar,
		CheckCircle2,
		FileText,
		User,
		Pencil,
		Save,
		X
	} from 'lucide-svelte';
	import TechStackEditor from '$lib/components/resumes/TechStackEditor.svelte';

	$: personId = $page.params.personId ?? '';
	$: person = MockResumeService.getPerson(personId);
	$: personResumes = MockResumeService.getResumesForPerson(personId);
	$: portrait = person ? soloImages[person.portraitId] : undefined;

	let isEditing = false;
	let editingPerson = person ? { ...person, techStack: person.techStack ?? [] } : null;

	$: if (person && !isEditing) {
		editingPerson = { ...person, techStack: person.techStack ?? [] };
	}

	const toggleEdit = () => {
		if (isEditing) {
			// Cancel
			isEditing = false;
			editingPerson = person ? { ...person } : null;
		} else {
			isEditing = true;
		}
	};

	const saveProfile = () => {
		if (editingPerson && person) {
			// In a real app, this would be an API call
			Object.assign(person, editingPerson);
			isEditing = false;
		}
	};
</script>

<div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
	<div class="mb-8">
		<div class="mb-6 flex items-center justify-between">
			<Button
				variant="ghost"
				href="/internal/resumes"
				class="pl-0 hover:bg-transparent hover:text-indigo-600"
			>
				<ArrowLeft size={16} class="mr-2" />
				Back to all people
			</Button>

			{#if person}
				<div class="flex gap-2">
					{#if isEditing}
						<Button variant="ghost" onclick={toggleEdit}>
							<X size={16} class="mr-2" /> Cancel
						</Button>
						<Button variant="primary" onclick={saveProfile}>
							<Save size={16} class="mr-2" /> Save Profile
						</Button>
					{:else}
						<Button variant="outline" onclick={toggleEdit}>
							<Pencil size={16} class="mr-2" /> Edit Profile
						</Button>
					{/if}
				</div>
			{/if}
		</div>

		{#if person && editingPerson}
			<div class="flex flex-col gap-8 md:flex-row md:items-start">
				<div
					class="h-32 w-32 flex-shrink-0 overflow-hidden rounded-full border-4 border-white shadow-lg md:h-48 md:w-48"
				>
					{#if portrait}
						<img
							src={portrait.src}
							srcset={portrait.srcset}
							alt={person.name}
							class="h-full w-full object-cover"
						/>
					{:else}
						<div class="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
							<User size={48} />
						</div>
					{/if}
				</div>

				<div class="flex-1 space-y-4">
					{#if isEditing}
						<div class="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
							<div>
								<label class="mb-1 block text-sm font-medium text-slate-700">Name</label>
								<Input
									bind:value={editingPerson.name}
									class="border-slate-300 bg-white text-lg font-bold text-slate-900"
								/>
							</div>
							<div>
								<label class="mb-1 block text-sm font-medium text-slate-700">Title</label>
								<Input
									bind:value={editingPerson.title}
									class="border-slate-300 bg-white font-medium text-indigo-600"
								/>
							</div>
							<div>
								<label class="mb-1 block text-sm font-medium text-slate-700">Bio</label>
								<TextArea
									bind:value={editingPerson.bio}
									rows={4}
									class="border-slate-300 bg-white text-slate-900"
								/>
							</div>
						</div>
					{:else}
						<div>
							<h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">{person.name}</h1>
							<p class="mt-2 text-xl font-medium text-indigo-600">{person.title}</p>
							<p class="mt-4 max-w-2xl text-lg text-slate-600">{person.bio}</p>
						</div>
					{/if}

					<div class="pt-4">
						<h3 class="mb-4 text-lg font-semibold text-slate-900">Tech Stack</h3>
						<TechStackEditor bind:categories={editingPerson.techStack} {isEditing} />
					</div>
				</div>
			</div>
		{:else}
			<div class="rounded-lg bg-red-50 p-4 text-red-800">Person not found.</div>
		{/if}
	</div>

	{#if person}
		<div class="mt-12 border-t border-slate-200 pt-12">
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-2xl font-bold text-slate-900">Resumes</h2>
				<Button variant="outline" size="sm">+ Create New Resume</Button>
			</div>

			<div class="space-y-4">
				{#each personResumes as resume}
					<Card class="flex items-center justify-between p-6 transition-colors hover:bg-slate-50">
						<div class="flex items-start gap-4">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"
							>
								<FileText size={24} />
							</div>
							<div>
								<div class="flex items-center gap-3">
									<h3 class="text-lg font-semibold text-slate-900">{resume.title}</h3>
									{#if resume.isMain}
										<span
											class="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset"
										>
											<CheckCircle2 size={12} />
											Main Resume
										</span>
									{/if}
								</div>
								<div class="mt-1 flex items-center gap-4 text-sm text-slate-500">
									<span class="flex items-center gap-1">
										Version {resume.version}
									</span>
									<span class="flex items-center gap-1">
										<Calendar size={14} />
										Updated {resume.updatedAt}
									</span>
								</div>
							</div>
						</div>

						<div class="flex items-center gap-3">
							<Button variant="outline" size="sm" href="/internal/resumes/consultant/{resume.id}">
								Open Editor
							</Button>
						</div>
					</Card>
				{/each}
				{#if personResumes.length === 0}
					<div class="rounded-lg border-2 border-dashed border-slate-200 p-12 text-center">
						<FileText size={48} class="mx-auto mb-4 text-slate-300" />
						<h3 class="text-lg font-medium text-slate-900">No resumes found</h3>
						<p class="mt-2 text-slate-500">Create a resume to get started.</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
