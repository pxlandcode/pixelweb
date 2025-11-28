<script lang="ts">
	import { Button, Card, Icon } from '@pixelcode_/blocks/components';
	import { Download } from 'lucide-svelte';
	import SimpleResumeView from '$lib/components/resumes/SimpleResumeView.svelte';
	import { ResumeService } from '$lib/services/simpleResume';
	import { soloImages } from '$lib/images/manifest';
	import { fly } from 'svelte/transition';

	let { data } = $props();

	let showDownloadOptions = $state(false);
	let downloadLanguage: 'sv' | 'en' = $state('sv');

	const person = $derived(ResumeService.getPerson(data.resume.personId));
	const image = $derived(
		person?.portraitId && person.portraitId in soloImages
			? soloImages[person.portraitId as keyof typeof soloImages]
			: undefined
	);
</script>

<div class="flex items-center justify-between">
	<div>
		<h1 class="text-2xl font-semibold text-gray-50">Resume Preview</h1>
		<p class="text-sm text-gray-300">
			{data.resume.data.name || 'Anonymous'} — {data.resume.title}
		</p>
	</div>
</div>

<!-- Fixed Download Button in Bottom Right -->
<div class="fixed right-6 bottom-6 z-50 flex gap-2 print:hidden">
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
					<Button size="sm" variant="outline" disabled>Word (coming soon)</Button>
				</div>
				<div transition:fly={{ y: 22, duration: 200 }}>
					<Button
						size="sm"
						variant="primary"
						href={`/api/simple-resumes/${data.resume.id}/pdf?lang=${downloadLanguage}`}
						target="_blank"
						rel="external"
						download={`resume-${data.resume.id}-${downloadLanguage}.pdf`}
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
	</div>
</div>

<div class="mt-6 space-y-4">
	<Card class="bg-white text-slate-900">
		<div class="mt-4">
			<SimpleResumeView data={data.resume.data} {image} language={data.language as 'sv' | 'en'} />
		</div>
	</Card>
</div>
