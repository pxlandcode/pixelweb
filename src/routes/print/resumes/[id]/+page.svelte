<script lang="ts">
	import ResumePrint from '$lib/components/resumes/ResumePrint.svelte';
	import { ResumeService } from '$lib/services/resume';
	import { soloImages } from '$lib/images/manifest';

	let { data } = $props();

	const person = $derived(ResumeService.getPerson(data.resume.personId));
	const image = $derived(
		person?.portraitId && person.portraitId in soloImages
			? soloImages[person.portraitId as keyof typeof soloImages]
			: undefined
	);

	const language = $derived(data.language as 'sv' | 'en');
</script>

<svelte:head>
	<title>{data.meta?.title ?? 'Resume print'}</title>
</svelte:head>

<div class="bg-white text-slate-900">
	<ResumePrint
		data={data.resume.data}
		{image}
		{language}
		person={person}
		profileTechStack={person?.techStack}
	/>
</div>
