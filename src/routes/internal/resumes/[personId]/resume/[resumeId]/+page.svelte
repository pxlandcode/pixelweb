<script lang="ts">
	import { Button, Card, Icon, Toaster, toast } from '@pixelcode_/blocks/components';
	import { Download, Edit, Save, X } from 'lucide-svelte';
	import ResumeView from '$lib/components/resumes/ResumeView.svelte';
	import { fly } from 'svelte/transition';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	let showDownloadOptions = $state(false);
	let viewLanguage: 'sv' | 'en' = $state((data.language as 'sv' | 'en') ?? 'sv');
	let downloadLanguage: 'sv' | 'en' = $state((data.language as 'sv' | 'en') ?? 'sv');
	let isEditing = $state(false);
	let saving = $state(false);
	let errorMessage = $state<string | null>(null);
	let resumeViewRef: ReturnType<typeof ResumeView> | null = $state(null);

	// Sync downloadLanguage when viewLanguage changes
	$effect(() => {
		downloadLanguage = viewLanguage;
	});

	const personName = $derived(data.resumePerson?.name ?? 'Resume');
	const avatarImage = $derived(data.avatarUrl ?? data.resumePerson?.avatar_url ?? null);
	const downloadBaseName = $derived(() => {
		const name = (personName ?? 'Resume').trim();
		const kind = downloadLanguage === 'sv' ? 'CV' : 'Resume';
		return `${name} - Pixel&Code - ${kind}`;
	});

	const handleCancel = () => {
		if (confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
			window.location.reload();
		}
	};

	const handleSave = async () => {
		if (!resumeViewRef) return;
		saving = true;
		errorMessage = null;
		try {
			const content = resumeViewRef.getEditedData();
			const formData = new FormData();
			formData.set('content', JSON.stringify(content));
			const response = await fetch('?/saveResume', {
				method: 'POST',
				body: formData
			});
			if (!response.ok) {
				const detail = await response.json().catch(() => null);
				throw new Error(detail?.message ?? 'Failed to save resume');
			}
			isEditing = false;
			toast.success?.('Resume saved!') ?? toast('Resume saved!');
			// Refetch page data to update the view with saved content
			await invalidateAll();
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to save resume';
			toast.error?.(errorMessage) ?? toast(errorMessage);
		} finally {
			saving = false;
		}
	};
</script>

<div class="flex items-center justify-between">
	<div>
		<h1 class="text-2xl font-semibold text-text">Resume Preview</h1>
		<p class="text-sm text-text">
			{personName} — {data.resume.title}
		</p>
		{#if errorMessage}
			<p class="text-red text-xs">{errorMessage}</p>
		{/if}
	</div>
</div>

<Toaster richColors position="top-center" closeButton />

<!-- Fixed Edit/Save/Download Buttons in Bottom Right -->
<div class="fixed right-6 bottom-6 z-50 flex gap-2 print:hidden">
	{#if isEditing}
		<Button variant="inverted" onclick={handleCancel}>
			<Icon icon={X} size="sm" />
			Cancel
		</Button>
		<Button variant="primary" onclick={handleSave} loading={saving} loading-text="Saving…">
			<Icon icon={Save} size="sm" />
			Save
		</Button>
	{:else}
		<div class="relative flex items-center gap-2">
			{#if showDownloadOptions}
				<div class="absolute right-0 bottom-14 flex flex-col items-end gap-2">
					<div transition:fly={{ y: 12, duration: 120 }}>
						<div
							class="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-medium shadow-sm"
						>
							<button
								type="button"
								class={downloadLanguage === 'sv'
									? 'rounded-full bg-indigo-600 px-2 py-0.5 text-white'
									: 'px-2 py-0.5 text-slate-500 hover:text-slate-700'}
								onclick={() => (downloadLanguage = 'sv')}
							>
								SV
							</button>
							<button
								type="button"
								class={downloadLanguage === 'en'
									? 'rounded-full bg-indigo-600 px-2 py-0.5 text-white'
									: 'px-2 py-0.5 text-slate-500 hover:text-slate-700'}
								onclick={() => (downloadLanguage = 'en')}
							>
								EN
							</button>
						</div>
					</div>
					<div transition:fly={{ y: 16, duration: 160 }}>
						<Button
							size="sm"
							variant="outline"
							href={`/api/resumes/${data.resume.id}/word?lang=${downloadLanguage}`}
							target="_blank"
							rel="external"
							download={`${downloadBaseName}.doc`}
							onclick={() => (showDownloadOptions = false)}
						>
							Word (Pre-beta)
						</Button>
					</div>
					<div transition:fly={{ y: 22, duration: 200 }}>
						<Button
							size="sm"
							variant="primary"
							href={`/api/resumes/${data.resume.id}/pdf?lang=${downloadLanguage}`}
							target="_blank"
							rel="external"
							download={`${downloadBaseName}.pdf`}
							onclick={() => (showDownloadOptions = false)}
						>
							<Icon icon={Download} size="sm" />
							PDF
						</Button>
					</div>
				</div>
			{/if}

			<Button variant="inverted" onclick={() => (showDownloadOptions = !showDownloadOptions)}>
				<Icon icon={Download} size="sm" />
				Download
			</Button>
			<Button variant="primary" onclick={() => (isEditing = true)}>
				<Icon icon={Edit} size="sm" />
				Edit
			</Button>
		</div>
	{/if}
</div>

<div class="mt-6 space-y-4">
	<Card class="bg-white text-slate-900">
		<div class="mt-4">
			<ResumeView
				data={data.resume.data}
				bind:this={resumeViewRef}
				bind:language={viewLanguage}
				person={data.resumePerson ?? undefined}
				image={avatarImage ?? undefined}
				profileTechStack={data.resumePerson?.techStack}
				{isEditing}
			/>
		</div>
	</Card>
</div>
