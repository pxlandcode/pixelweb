<script lang="ts">
	import ResumeDownloadBuilder from '$lib/components/resumes/ResumeDownloadBuilder.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.meta?.title ?? 'Resume print'}</title>
</svelte:head>

<div class="bg-white text-slate-900">
	<ResumeDownloadBuilder blocks={data.resume.content} personId={data.resume.personId} />
</div>
