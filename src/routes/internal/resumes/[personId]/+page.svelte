<script lang="ts">
	import { page } from '$app/stores';
	import { MockResumeService } from '$lib/api/mock-resumes';
	import { soloImages } from '$lib/images/manifest';
	import { Button, Card } from '@pixelcode_/blocks/components';
	import { ArrowLeft, Calendar, CheckCircle2, FileText, User } from 'lucide-svelte';

	$: personId = $page.params.personId ?? '';
	$: person = MockResumeService.getPerson(personId);
	$: personResumes = MockResumeService.getResumesForPerson(personId);
	$: portrait = person ? soloImages[person.portraitId] : undefined;
</script>

<div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
	<div class="mb-8">
		<Button
			variant="ghost"
			href="/internal/resumes"
			class="mb-6 pl-0 hover:bg-transparent hover:text-indigo-600"
		>
			<ArrowLeft size={16} class="mr-2" />
			Back to all people
		</Button>

		{#if person}
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

				<div class="flex-1">
					<h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">{person.name}</h1>
					<p class="mt-2 text-xl font-medium text-indigo-600">{person.title}</p>
					<p class="mt-4 max-w-2xl text-lg text-slate-600">{person.bio}</p>
				</div>
			</div>
		{:else}
			<div class="rounded-lg bg-red-50 p-4 text-red-800">Person not found.</div>
		{/if}
	</div>

	{#if person}
		<div class="mt-12">
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
							<Button variant="outline" size="sm" href="/internal/resumes/editor/{resume.id}">
								Open Editor
							</Button>
							<!-- 
                                Note: The user mentioned "when opening a resume, we have the resumepreview to use to view and edit, 
                                and the resumedownloadbuilder when we download. you can see how that works today and that is how we want it to work in the future"
                                
                                The existing route for resumes seems to be /internal/resumes/consultant/[id] based on the implementation plan and existing code.
                                I'll assume that route exists or I should link to it. 
                                Wait, the user request said:
                                "Routes:
                                - /internal/resumes/+page.svelte
                                - /internal/resumes/[personId]/+page.svelte"
                                
                                And "Clicking an employee opens their resume list page... Provide links to open a resume and to open the main resume."
                                
                                It didn't explicitly ask me to implement the editor page, but to link to it.
                                The existing code in `src/routes/resumes/+page.svelte` links to `/internal/resumes/consultant/{resume.id}`.
                                So I will use that link.
                            -->
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
