<script lang="ts">
        import { Card, Button, Stack } from '@pixelcode_/blocks/components';
        import ResumePreview from '$lib/components/resumes/ResumePreview.svelte';
        import type { ResumeBlock } from '$lib/services/resumes';
        let { data } = $props();

        const findHeader = (blocks: ResumeBlock[]) => blocks.find((b) => b.type === 'header');
</script>

<section class="mx-auto max-w-5xl px-4 py-12">
        <div class="flex flex-col gap-2">
                <h1 class="text-3xl font-semibold text-gray-50">Consultant resumes</h1>
                <p class="text-sm text-gray-300">Public-facing list of consultant profiles using the main version.</p>
        </div>

        <Stack spacing="md" class="mt-6">
                <div class="grid gap-6 md:grid-cols-2">
                        {#each data.resumes as resume}
                                <Card class="bg-white text-slate-900">
                                        <div class="flex items-center justify-between pb-3">
                                                {#if findHeader(resume.content) as header}
                                                        <div>
                                                                <p class="text-xl font-semibold text-slate-900">{header.name}</p>
                                                                <p class="text-sm text-slate-700">{header.title}</p>
                                                        </div>
                                                {/if}
                                                <Button variant="primary" href={`/internal/resumes/consultant/${resume.id}`} size="sm">
                                                        View profile
                                                </Button>
                                        </div>
                                        <ResumePreview blocks={resume.content} />
                                </Card>
                        {/each}
                </div>
        </Stack>
</section>
