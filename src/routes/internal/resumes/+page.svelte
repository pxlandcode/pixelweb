<script lang="ts">
        import { Button, Card, Input, Stack } from '@pixelcode_/blocks/components';
        let { data } = $props();
        let search = $state('');
</script>

<div class="flex items-center justify-between">
        <div>
                <h1 class="text-2xl font-semibold text-gray-900">Resumes</h1>
                <p class="text-sm text-gray-700">Filter consultant resumes and open the drawer to edit.</p>
        </div>
        <Button variant="primary" size="md" href="/internal/resumes/new">New resume</Button>
</div>

<Stack spacing="md" class="mt-6">
        <div class="flex flex-wrap items-center gap-3">
                <Input placeholder="Search consultant or title" bind:value={search} class="w-72" />
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {#each data.resumes.filter((resume) =>
                        resume.content.some((block) =>
                                block.type === 'title' &&
                                `${block.heading} ${block.subheading ?? ''}`
                                        .toLowerCase()
                                        .includes(search.toLowerCase())
                        )
                ) as resume}
                        <Card class="flex flex-col gap-3">
                                <div class="flex items-start justify-between">
                                        <div>
                                                {#if resume.content.find((b) => b.type === 'title') as titleBlock}
                                                        <p class="text-sm font-semibold text-gray-900">{titleBlock.heading}</p>
                                                        {#if titleBlock.subheading}
                                                                <p class="text-xs text-gray-600">{titleBlock.subheading}</p>
                                                        {/if}
                                                {/if}
                                                <p class="mt-1 text-xs text-gray-500">Version: {resume.version_name}</p>
                                        </div>
                                        <div class="flex items-center gap-2 text-xs text-gray-600">
                                                {#if resume.is_main}<span class="rounded bg-emerald-100 px-2 py-1">Main</span>{/if}
                                                {#if !resume.is_active}<span class="rounded bg-amber-100 px-2 py-1">Inactive</span>{/if}
                                        </div>
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
                {/each}
        </div>
</Stack>
