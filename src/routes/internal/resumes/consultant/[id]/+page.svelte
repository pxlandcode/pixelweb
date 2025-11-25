<script lang="ts">
        import { Button, Card } from '@pixelcode_/blocks/components';
        import ResumePreview from '$lib/components/resumes/ResumePreview.svelte';
        let { data } = $props();
</script>

<div class="flex items-center justify-between">
        <div>
                <h1 class="text-2xl font-semibold text-gray-50">Consultant resume</h1>
                <p class="text-sm text-gray-300">Read-only view for clients with export options.</p>
        </div>
        <div class="flex items-center gap-2">
                <Button variant="secondary" href={`/api/resumes/${data.resume.id}/pdf`}>Download PDF</Button>
                {#if data.resume.allow_word_export}
                        <Button variant="secondary" href={`/api/resumes/${data.resume.id}/word`}>
                                Download Word
                        </Button>
                {/if}
        </div>
</div>

<Card class="mt-6 bg-white text-slate-900">
        <ResumePreview blocks={data.resume.content} />
</Card>
