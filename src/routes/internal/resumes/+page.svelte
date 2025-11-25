<script lang="ts">
        import { Button, Card, Input, Stack, Tag } from '@pixelcode_/blocks/components';
        import type { ResumeBlock } from '$lib/services/resumes';
        let { data } = $props();
        let search = $state('');

        const findHeader = (blocks: ResumeBlock[]) => blocks.find((b) => b.type === 'header');
</script>

<div class="flex items-center justify-between">
        <div>
                <h1 class="text-2xl font-semibold text-gray-50">Resumes</h1>
                <p class="text-sm text-gray-300">Filter consultant resumes and open the editor.</p>
        </div>
        <Button variant="primary" size="md" href="/internal/resumes/new">New resume</Button>
</div>

<Stack spacing="md" class="mt-6">
        <div class="flex flex-wrap items-center gap-3">
                <Input placeholder="Search consultant or title" bind:value={search} class="w-72" />
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {#each data.resumes
                        .filter((resume) => {
                                const header = findHeader(resume.content);
                                if (!header) return true;
                                return `${header.name} ${header.title}`.toLowerCase().includes(search.toLowerCase());
                        }) as resume}
                        {#if findHeader(resume.content) as header}
                                <Card class="flex flex-col gap-3 bg-white text-slate-900">
                                        <div class="flex items-start justify-between gap-3">
                                                <div class="space-y-1">
                                                        <p class="text-lg font-semibold text-slate-900">{header.name}</p>
                                                        <p class="text-sm text-slate-700">{header.title}</p>
                                                        <p class="text-xs text-slate-500">Version: {resume.version_name}</p>
                                                </div>
                                                <div class="flex flex-col items-end gap-1 text-xs text-slate-700">
                                                        {#if resume.is_main}
                                                                <Tag tone="positive" size="sm">Main</Tag>
                                                        {/if}
                                                        {#if !resume.is_active}
                                                                <Tag tone="warning" size="sm">Inactive</Tag>
                                                        {/if}
                                                </div>
                                        </div>
                                        <div class="flex flex-wrap gap-2 text-xs text-slate-700">
                                                {#each header.contact_people?.[0]?.people ?? [] as person}
                                                        <span class="rounded-full bg-slate-100 px-3 py-1">{person.name}</span>
                                                {/each}
                                        </div>
                                        <div class="flex items-center gap-3">
                                                <Button size="sm" variant="ghost" href={`/internal/resumes/${resume.id}`}>
                                                        Open
                                                </Button>
                                                <Button size="sm" variant="secondary" href={`/internal/resumes/consultant/${resume.id}`}>
                                                        Client view
                                                </Button>
                                        </div>
                                </Card>
                        {/if}
                {/each}
        </div>
</Stack>
