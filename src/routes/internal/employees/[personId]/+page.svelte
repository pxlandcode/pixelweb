<script lang="ts">
	import { Button, Card } from '@pixelcode_/blocks/components';
	import { ArrowLeft, Calendar, CheckCircle2, Copy, FileText, Trash2, User } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { TechStackEditor } from '$lib/components';
	import { confirm } from '$lib/utils/confirm';

	const { data } = $props();

	const profile = data.profile;
	const resumes = data.resumes ?? [];
	const techStack = (profile?.tech_stack as any[]) ?? [];
	const viewCategories = $derived(
		(techStack ?? []).filter((cat) => Array.isArray(cat?.skills) && cat.skills.length > 0)
	);

	let isEditing = $state(false);
	let isLoading = $state(false);
	let editingBio = $state(profile?.bio ?? '');
	let editingTechStack = $state(structuredClone(techStack));
	const techStackJson = $derived(JSON.stringify(editingTechStack ?? []));

	let resumeList = $state(resumes ?? []);
	let draggedResume: any = $state(null);
	let dragOverIndex: number | null = $state(null);

	// Sort resumes: main first, then by updated_at descending
	const sortedResumeList = $derived(
		[...resumeList].sort((a, b) => {
			// Main resume always first
			if (a.is_main && !b.is_main) return -1;
			if (!a.is_main && b.is_main) return 1;
			// Then by updated_at descending
			const dateA = new Date(a.updated_at ?? a.created_at ?? 0).getTime();
			const dateB = new Date(b.updated_at ?? b.created_at ?? 0).getTime();
			return dateB - dateA;
		})
	);

	$effect(() => {
		editingBio = profile?.bio ?? '';
		editingTechStack = structuredClone(techStack);
		resumeList = [...(resumes ?? [])];
	});

	const handleDragStart = (resume) => {
		draggedResume = resume;
	};

	const handleDragOver = (event: DragEvent, index: number) => {
		event.preventDefault();
		dragOverIndex = index;
	};

	const handleDragLeave = () => {
		dragOverIndex = null;
	};

	const reorderResumes = (targetIndex: number) => {
		if (!draggedResume) return;
		const currentIndex = resumeList.findIndex((r) => r.id === draggedResume.id);
		if (currentIndex === -1 || currentIndex === targetIndex) return;
		const next = [...resumeList];
		next.splice(currentIndex, 1);
		next.splice(targetIndex, 0, draggedResume);
		// mark main
		resumeList = next.map((r, idx) => ({ ...r, is_main: idx === 0 }));
	};

	const saveOrder = async () => {
		const order = resumeList.map((r) => r.id);
		const formData = new FormData();
		formData.set('person_id', profile.id);
		formData.set('resume_order', JSON.stringify(order));
		await fetch('?/updateResumeOrder', { method: 'POST', body: formData });
	};

	const handleDrop = async (event: DragEvent, index: number) => {
		event.preventDefault();
		reorderResumes(index);
		draggedResume = null;
		dragOverIndex = null;
		await saveOrder();
	};

	const addResume = async () => {
		isLoading = true;
		const formData = new FormData();
		formData.set('person_id', profile.id);
		const res = await fetch('?/createResume', { method: 'POST', body: formData });
		if (res.ok) {
			const { id } = await res.json().catch(() => ({}));
			// Refresh list
			location.reload();
		}
		isLoading = false;
	};

	const deleteResume = async (resumeId: string) => {
		isLoading = true;
		const formData = new FormData();
		formData.set('resume_id', resumeId);
		const res = await fetch('?/deleteResume', { method: 'POST', body: formData });
		if (res.ok) {
			// Remove from local list
			resumeList = resumeList.filter((r) => r.id !== resumeId);
		}
		isLoading = false;
	};

	const copyResume = async (resumeId: string) => {
		isLoading = true;
		const formData = new FormData();
		formData.set('resume_id', resumeId);
		const res = await fetch('?/copyResume', { method: 'POST', body: formData });
		if (res.ok) {
			location.reload();
		}
		isLoading = false;
	};
</script>

<!-- Loading bar at top -->
{#if isLoading}
	<div class="fixed top-0 left-0 z-50 h-1 w-full overflow-hidden bg-indigo-100">
		<div
			class="h-full w-1/3 animate-pulse bg-indigo-600"
			style="animation: loading-bar 1s ease-in-out infinite;"
		></div>
	</div>
{/if}

<div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
	<div class="mb-8">
		<div class="mb-6 flex items-center justify-between">
			<Button
				variant="ghost"
				href="/internal/employees"
				class="pl-0 hover:bg-transparent hover:text-indigo-600"
			>
				<ArrowLeft size={16} class="mr-2" />
				Back to all people
			</Button>

			{#if profile}
				<div class="flex gap-2">
					{#if isEditing}
						<Button type="button" variant="ghost" onclick={() => (isEditing = false)}>
							Cancel
						</Button>
						<Button form="profile-form" type="submit" variant="primary">Save profile</Button>
					{:else}
						<Button type="button" onclick={() => (isEditing = true)}>Edit profile</Button>
					{/if}
				</div>
			{/if}
		</div>

		{#if profile}
			<div class="flex flex-col gap-8 md:flex-row md:items-start">
				<div
					class="h-32 w-32 flex-shrink-0 overflow-hidden border-4 border-white shadow-lg md:h-48 md:w-48"
				>
					{#if profile.avatar_url}
						<img
							src={profile.avatar_url}
							alt={[profile.first_name, profile.last_name].filter(Boolean).join(' ')}
							class="h-full w-full object-cover"
						/>
					{:else}
						<div class="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
							<User size={48} />
						</div>
					{/if}
				</div>

				<div class="flex-1 space-y-4">
					<form
						id="profile-form"
						method="POST"
						action="?/updateProfile"
						class="space-y-4"
						onsubmit={() => {
							// keep editing values
						}}
					>
						<input type="hidden" name="person_id" value={profile.id} />
						<input type="hidden" name="tech_stack" value={techStackJson} />

						<div>
							<h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">
								{[profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Unnamed'}
							</h1>
							{#if profile.title}
								<p class="mt-2 text-xl font-medium text-primary">{profile.title}</p>
							{/if}
						</div>

						<div>
							<h3 class="mb-2 text-lg font-semibold text-slate-900">Bio</h3>
							{#if isEditing}
								<textarea
									name="bio"
									bind:value={editingBio}
									class="w-full rounded border border-slate-200 p-3 text-sm text-slate-900"
									rows="4"
									placeholder="Tell us about this person"
								/>
							{:else if profile.bio}
								<p class="mt-1 max-w-2xl text-sm leading-6 whitespace-pre-wrap text-slate-700">
									{profile.bio}
								</p>
							{:else}
								<p class="text-sm text-slate-500">No bio yet.</p>
							{/if}
						</div>

						<div class="pt-2">
							<h3 class="mb-2 text-lg font-semibold text-slate-900">Tech Stack</h3>
							{#if isEditing}
								<TechStackEditor bind:categories={editingTechStack} isEditing />
							{:else if viewCategories.length === 0}
								<p class="text-sm text-slate-600">No tech stack recorded yet.</p>
							{:else}
								<div class="space-y-3">
									{#each viewCategories as cat}
										<div class="space-y-1">
											<p class="text-xs font-semibold tracking-wide text-slate-800 uppercase">
												{cat.name}
											</p>
											<div class="flex flex-wrap gap-2">
												{#each cat.skills as skill}
													<span
														class="inline-flex min-h-[28px] min-w-[28px] items-center justify-center border border-primary bg-transparent px-2 py-1 text-xs font-semibold text-primary"
													>
														{skill}
													</span>
												{/each}
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</form>
				</div>
			</div>
		{:else}
			<div class="rounded-lg bg-red-50 p-4 text-red-800">Person not found.</div>
		{/if}
	</div>

	{#if profile}
		<div class="mt-12 border-t border-slate-200 pt-12">
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-2xl font-bold text-slate-900">Resumes</h2>
				<Button size="sm" variant="outline" onclick={addResume}>+ Add resume</Button>
			</div>

			<div class="space-y-4">
				{#each sortedResumeList as resume, index (resume.id)}
					<div
						draggable="true"
						ondragstart={() => handleDragStart(resume)}
						ondragover={(e) => handleDragOver(e, index)}
						ondragleave={handleDragLeave}
						ondrop={(e) => handleDrop(e, index)}
						ondragend={() => {
							draggedResume = null;
							dragOverIndex = null;
						}}
						onclick={() => goto(`/internal/employees/${profile.id}/resume/${resume.id}`)}
						class={`flex cursor-pointer items-center justify-between rounded-none border p-6 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${
							dragOverIndex === index ? 'border-primary' : 'border-slate-200'
						} ${draggedResume?.id === resume.id ? 'opacity-50' : ''}`}
					>
						<div class="flex items-start gap-4">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"
							>
								<FileText size={24} />
							</div>
							<div>
								<div class="flex items-center gap-3">
									<h3 class="text-lg font-semibold text-slate-900">
										{resume.version_name ?? 'Main'}
									</h3>
									{#if resume.is_main}
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
										<Calendar size={14} />
										Updated {resume.updated_at ?? resume.created_at ?? '—'}
									</span>
								</div>
							</div>
						</div>
						<div class="flex items-center gap-1">
							<button
								type="button"
								class="cursor-pointer rounded-md p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
								onclick={(e) => {
									e.stopPropagation();
									copyResume(resume.id);
								}}
								title="Copy resume"
							>
								<Copy size={18} />
							</button>
							<button
								type="button"
								class="cursor-pointer rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
								onclick={(e) => e.stopPropagation()}
								title="Delete resume"
								use:confirm={{
									title: 'Delete resume?',
									description: `Are you sure you want to delete "${resume.version_name}"? This cannot be undone.`,
									actionLabel: 'Delete',
									action: () => deleteResume(resume.id)
								}}
							>
								<Trash2 size={18} />
							</button>
						</div>
					</div>
				{/each}
				{#if sortedResumeList.length === 0}
					<div class="rounded-lg border-2 border-dashed border-slate-200 p-12 text-center">
						<FileText size={48} class="mx-auto mb-4 text-slate-300" />
						<h3 class="text-lg font-medium text-slate-900">No resumes found</h3>
						<p class="mt-2 text-slate-500">Connect this profile to a resume to see it here.</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	@keyframes loading-bar {
		0% {
			transform: translateX(-100%);
		}
		50% {
			transform: translateX(200%);
		}
		100% {
			transform: translateX(-100%);
		}
	}
</style>
