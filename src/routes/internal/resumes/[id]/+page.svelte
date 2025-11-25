<script lang="ts">
        import { Button, Card, Input, Tabs, Textarea } from '@pixelcode_/blocks/components';
        import { resumeStore } from '$lib/stores/resumeStore';
        import type { ResumeBlock } from '$lib/services/resumes';
        let { data } = $props();

        $effect(() => {
                if (data.resume) {
                        resumeStore.setResume(data.resume);
                }
        });

        const addBlock = (block: ResumeBlock) => {
                resumeStore.updateBlocks((blocks) => [...blocks, block]);
        };
</script>

<div class="flex items-center justify-between">
        <div>
                <h1 class="text-2xl font-semibold text-gray-900">Resume builder</h1>
                <p class="text-sm text-gray-700">Side-by-side editor with live preview.</p>
        </div>
        <div class="flex items-center gap-2">
                <Button variant="secondary" href={`/api/resumes/${data.resume.id}/pdf`}>PDF</Button>
                <Button variant="secondary" href={`/api/resumes/${data.resume.id}/word`}>Word</Button>
                <Button variant="primary">Save</Button>
        </div>
</div>

<Tabs class="mt-6" value="edit">
        <Tabs.List>
                <Tabs.Trigger value="edit">Edit</Tabs.Trigger>
                <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
                <Tabs.Trigger value="versions">Versions</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="edit" class="mt-4 grid gap-4 md:grid-cols-2">
                <Card class="flex flex-col gap-3">
                        <div class="flex items-center justify-between">
                                <p class="text-sm font-semibold text-gray-900">Blocks</p>
                                <Button size="xs" variant="ghost" onclick={() => addBlock({ type: 'body', text: '' })}>
                                        Add body
                                </Button>
                        </div>
                        <div class="flex flex-col gap-3">
                                {#each $resumeStore.state.blocks as block, index}
                                        <Card class="border border-dashed">
                                                <div class="flex items-center justify-between">
                                                        <p class="text-sm font-semibold text-gray-900">{block.type}</p>
                                                        <span class="text-xs text-gray-500">#{index + 1}</span>
                                                </div>
                                                {#if block.type === 'title'}
                                                        <Input value={block.heading} readonly />
                                                {:else if block.type === 'body'}
                                                        <Textarea value={block.text} rows={3} readonly />
                                                {:else if block.type === 'bullets'}
                                                        <ul class="list-disc pl-4 text-sm text-gray-700">
                                                                {#each block.items as item}<li>{item}</li>{/each}
                                                        </ul>
                                                {:else if block.type === 'contact'}
                                                        <p class="text-sm text-gray-700">{block.email}</p>
                                                {:else if block.type === 'skills'}
                                                        <div class="flex flex-wrap gap-2">
                                                                {#each block.skills as skill}
                                                                        <span class="rounded bg-slate-100 px-2 py-1 text-xs">{skill.name}</span>
                                                                {/each}
                                                        </div>
                                                {:else if block.type === 'role_history'}
                                                        <div class="space-y-2">
                                                                {#each block.entries as entry}
                                                                        <div class="rounded border p-2">
                                                                                <p class="text-sm font-semibold">{entry.title}</p>
                                                                                <p class="text-xs text-gray-600">{entry.organization}</p>
                                                                        </div>
                                                                {/each}
                                                        </div>
                                                {:else if block.type === 'image'}
                                                        <img src={block.url} alt={block.alt} class="h-32 w-full object-cover" />
                                                {/if}
                                        </Card>
                                {/each}
                        </div>
                </Card>

                <Card class="resume-print-page">
                        <div class="resume-print-section">
                                {#if $resumeStore.state.blocks.find((b) => b.type === 'title') as titleBlock}
                                        <p class="text-lg font-semibold text-gray-900">{titleBlock.heading}</p>
                                        {#if titleBlock.subheading}
                                                <p class="text-sm text-gray-700">{titleBlock.subheading}</p>
                                        {/if}
                                {/if}
                        </div>
                        {#each $resumeStore.state.blocks as block}
                                {#if block.type === 'body'}
                                        <p class="resume-print-section text-sm text-gray-700">{block.text}</p>
                                {:else if block.type === 'bullets'}
                                        <ul class="resume-print-section list-disc pl-5 text-sm text-gray-700">
                                                {#each block.items as item}<li>{item}</li>{/each}
                                        </ul>
                                {:else if block.type === 'skills'}
                                        <div class="resume-print-section grid grid-cols-2 gap-2 text-sm text-gray-800">
                                                {#each block.skills as skill}
                                                        <span>{skill.name}</span>
                                                {/each}
                                        </div>
                                {:else if block.type === 'contact'}
                                        <div class="resume-print-section text-sm text-gray-700">
                                                <p>{block.email}</p>
                                                {#if block.phone}<p>{block.phone}</p>{/if}
                                                {#if block.location}<p>{block.location}</p>{/if}
                                        </div>
                                {:else if block.type === 'role_history'}
                                        <div class="resume-print-section space-y-2">
                                                {#each block.entries as entry}
                                                        <div>
                                                                <p class="font-semibold text-sm text-gray-900">{entry.title}</p>
                                                                <p class="text-xs text-gray-600">{entry.organization}</p>
                                                        </div>
                                                {/each}
                                        </div>
                                {/if}
                        {/each}
                </Card>
        </Tabs.Content>

        <Tabs.Content value="preview" class="mt-4">
                <Card class="resume-print-page">
                        <p class="text-sm text-gray-700">Preview generated from current blocks.</p>
                </Card>
        </Tabs.Content>

        <Tabs.Content value="versions" class="mt-4">
                <Card class="flex flex-col gap-3">
                        <div class="flex items-center justify-between">
                                <p class="text-sm font-semibold text-gray-900">Versions</p>
                                <Button size="xs" variant="ghost">New version</Button>
                        </div>
                        <div class="flex flex-col divide-y divide-gray-100">
                                {#each data.resume.versions ?? [] as version}
                                        <div class="flex items-center justify-between py-3">
                                                <div>
                                                        <p class="text-sm font-semibold text-gray-900">{version.version_name}</p>
                                                        <p class="text-xs text-gray-600">{version.created_at}</p>
                                                </div>
                                                <div class="flex items-center gap-2 text-xs text-gray-700">
                                                        {#if version.is_main}<span class="rounded bg-emerald-100 px-2 py-1">Main</span>{/if}
                                                        {#if !version.is_active}<span class="rounded bg-amber-100 px-2 py-1">Inactive</span>{/if}
                                                        <Button size="xs" variant="secondary" onclick={() => resumeStore.setActiveVersion(version.id)}>
                                                                Load
                                                        </Button>
                                                </div>
                                        </div>
                                {/each}
                        </div>
                </Card>
        </Tabs.Content>
</Tabs>
