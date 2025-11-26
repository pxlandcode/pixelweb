<script lang="ts">
	import { MockResumeService } from '$lib/api/mock-resumes';
	import { soloImages } from '$lib/images/manifest';
	import { Button, Card } from '@pixelcode_/blocks/components';
	import { FileText, User } from 'lucide-svelte';

	const people = MockResumeService.getPeople();

	const peopleWithResumes = people.map((person) => {
		const personResumes = MockResumeService.getResumesForPerson(person.id);
		const mainResume = MockResumeService.getMainResume(person.id);
		const portrait = soloImages[person.portraitId];

		return {
			...person,
			resumes: personResumes,
			mainResume,
			portraitUrl: portrait?.src,
			portraitSrcset: portrait?.srcset
		};
	});
</script>

<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
	<div class="mb-12">
		<h1 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Internal Resumes</h1>
		<p class="mt-4 text-lg text-slate-500">Manage and view resumes for all Pixel&Code employees.</p>
	</div>

	<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each peopleWithResumes as person}
			<Card class="flex h-full flex-col overflow-hidden transition-all hover:shadow-md">
				<div class="aspect-[4/3] w-full overflow-hidden bg-slate-100">
					{#if person.portraitUrl}
						<img
							src={person.portraitUrl}
							srcset={person.portraitSrcset}
							alt={person.name}
							class="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-105"
						/>
					{:else}
						<div class="flex h-full w-full items-center justify-center text-slate-300">
							<User size={48} />
						</div>
					{/if}
				</div>

				<div class="flex flex-1 flex-col p-6">
					<div class="mb-4">
						<h3 class="text-xl font-semibold text-slate-900">{person.name}</h3>
						<p class="text-sm font-medium text-indigo-600">{person.title}</p>
					</div>

					<p class="mb-6 line-clamp-3 flex-1 text-sm text-slate-600">
						{person.bio}
					</p>

					<div class="mt-auto space-y-3">
						<div class="flex items-center justify-between text-xs text-slate-500">
							<span class="flex items-center gap-1">
								<FileText size={14} />
								{person.resumes.length} Resume{person.resumes.length !== 1 ? 's' : ''}
							</span>
							{#if person.mainResume}
								<span
									class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset"
								>
									Main Resume Active
								</span>
							{/if}
						</div>

						<div class="grid grid-cols-2 gap-2">
							<Button
								variant="outline"
								size="sm"
								class="w-full justify-center"
								href="/internal/resumes/{person.id}"
							>
								Workspace
							</Button>
							{#if person.mainResume}
								<Button
									variant="primary"
									size="sm"
									class="w-full justify-center"
									href="/internal/resumes/editor/{person.mainResume.id}"
								>
									Main CV
								</Button>
							{:else}
								<Button
									variant="ghost"
									size="sm"
									type="button"
									class="w-full cursor-not-allowed justify-center opacity-50"
									disabled
								>
									No Main CV
								</Button>
							{/if}
						</div>
					</div>
				</div>
			</Card>
		{/each}
	</div>
</div>
