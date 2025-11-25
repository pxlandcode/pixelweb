<script lang="ts">
        import { Button, Card, Input, Tabs, Tag, Textarea, Toggle } from '@pixelcode_/blocks/components';
        import ResumePreview from '$lib/components/resumes/ResumePreview.svelte';
        import { resumeStore } from '$lib/stores/resumeStore';
        import type { ResumeBlock } from '$lib/services/resumes';

        let { data } = $props();
        let selectedBlockId = $state<string | null>(null);
        const blocks = $derived($resumeStore.state.blocks);

        $effect(() => {
                if (data.resume) {
                        resumeStore.setResume(data.resume);
                        selectedBlockId = data.resume.content[0]?.id ?? null;
                }
        });

        const createBlock = (type: ResumeBlock['type']): ResumeBlock => {
                switch (type) {
                        case 'header':
                                return {
                                        type: 'header',
                                        name: 'New consultant',
                                        title: 'Role title',
                                        summary: 'Add a concise summary for this consultant.',
                                        contact_people: [
                                                { label: 'Contact', people: [{ name: 'Name', phone: '', email: '' }] }
                                        ]
                                };
                        case 'skills_grid':
                                return { type: 'skills_grid', title: 'Examples of skills', skills: [], columns: 3 };
                        case 'highlighted_experience':
                                return {
                                        type: 'highlighted_experience',
                                        company: 'Company',
                                        role: 'Role',
                                        description: 'Short highlight description.',
                                        testimonial: '',
                                        technologies: []
                                };
                        case 'experience_section':
                                return { type: 'experience_section', title: 'Previous Experience' };
                        case 'experience_item':
                                return {
                                        type: 'experience_item',
                                        period: '2024 - ongoing',
                                        company: 'Company',
                                        location: '',
                                        role: 'Role',
                                        description: 'Detailed description of the assignment.',
                                        technologies: []
                                };
                        case 'section_header':
                                return { type: 'section_header', title: 'Section title', divider: true };
                        case 'skills_categorized':
                                return { type: 'skills_categorized', category: 'Category', items: [] };
                        case 'multi_column_info':
                                return { type: 'multi_column_info', items: [{ label: 'Year', description: 'Detail' }] };
                        case 'testimonial':
                                return { type: 'testimonial', quote: 'Quote text', source: 'Source name' };
                        case 'footer':
                                return { type: 'footer', note: 'Footer note', updated_at: '' };
                        default:
                                return { type: 'section_header', title: 'Section title' } satisfies ResumeBlock;
                }
        };

        const addBlock = (type: ResumeBlock['type']) => {
                resumeStore.updateBlocks((blocks) => [...blocks, createBlock(type)]);
        };

        const updateBlock = (blockId: string, mutator: (block: ResumeBlock) => ResumeBlock) => {
                resumeStore.updateBlocks((blocks) => blocks.map((block) => (block.id === blockId ? mutator(block) : block)));
        };

        const selectedBlock = $derived(blocks.find((b) => b.id === selectedBlockId));

        $effect(() => {
                if (!blocks.length) return;
                if (!blocks.find((block) => block.id === selectedBlockId)) {
                        selectedBlockId = blocks[0]?.id ?? null;
                }
        });
        const availableTypes: { label: string; value: ResumeBlock['type'] }[] = [
                { label: 'Header', value: 'header' },
                { label: 'Skills Grid', value: 'skills_grid' },
                { label: 'Highlighted Experience', value: 'highlighted_experience' },
                { label: 'Experience Section', value: 'experience_section' },
                { label: 'Experience Item', value: 'experience_item' },
                { label: 'Section Header', value: 'section_header' },
                { label: 'Skills Categorized', value: 'skills_categorized' },
                { label: 'Multi-Column Info', value: 'multi_column_info' },
                { label: 'Testimonial', value: 'testimonial' },
                { label: 'Footer', value: 'footer' }
        ];

        const parseList = (value: string) =>
                value
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean);
</script>

<div class="flex items-center justify-between">
        <div>
                <h1 class="text-2xl font-semibold text-gray-50">Resume builder</h1>
                <p class="text-sm text-gray-300">Side-by-side editor with live preview.</p>
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
                <Tabs.Trigger value="versions">Versions</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="edit" class="mt-4 grid gap-4 lg:grid-cols-[420px_1fr]">
                <div class="space-y-4">
                        <Card class="bg-white text-slate-900">
                                <div class="flex items-center justify-between gap-2">
                                        <div>
                                                <p class="text-sm font-semibold text-slate-900">Blocks</p>
                                                <p class="text-xs text-slate-600">{$resumeStore.summary.visible} visible / {$resumeStore.summary.total} total</p>
                                        </div>
                                        <div class="flex items-center gap-2">
                                                <select
                                                        class="rounded border border-slate-200 bg-white px-2 py-1 text-sm text-slate-800"
                                                        on:change={(event) => {
                                                                const type = (event.currentTarget.value as ResumeBlock['type']) ?? 'header';
                                                                addBlock(type);
                                                                event.currentTarget.value = '';
                                                        }}
                                                >
                                                        <option value="" disabled selected>Add block</option>
                                                        {#each availableTypes as option}
                                                                {#if option.value !== 'header' || !$resumeStore.state.blocks.some((b) => b.type === 'header')}
                                                                        <option value={option.value}>{option.label}</option>
                                                                {/if}
                                                        {/each}
                                                </select>
                                        </div>
                                </div>
                                <div class="mt-4 space-y-3">
                                        {#each $resumeStore.state.blocks as block, index}
                                                <Card
                                                        class={`cursor-pointer border ${selectedBlockId === block.id ? 'border-orange-400' : 'border-slate-200'} bg-slate-50 text-slate-900`}
                                                        on:click={() => (selectedBlockId = block.id ?? null)}
                                                >
                                                        <div class="flex items-center justify-between gap-2">
                                                                <div class="space-y-1">
                                                                        <p class="text-sm font-semibold text-slate-900">{block.type.replace('_', ' ')}</p>
                                                                        <p class="text-xs text-slate-600">#{index + 1}</p>
                                                                </div>
                                                                <div class="flex items-center gap-2 text-xs text-slate-700">
                                                                        <Toggle
                                                                                size="sm"
                                                                                checked={!block.hidden}
                                                                                on:change={() => resumeStore.toggleHidden(block.id ?? '')}
                                                                        >
                                                                                {block.hidden ? 'Hidden' : 'Visible'}
                                                                        </Toggle>
                                                                        <Button
                                                                                size="xs"
                                                                                variant="ghost"
                                                                                onclick={(event) => {
                                                                                        event.stopPropagation();
                                                                                        resumeStore.moveBlock(block.id ?? '', 'up');
                                                                                }}
                                                                        >
                                                                                ↑
                                                                        </Button>
                                                                        <Button
                                                                                size="xs"
                                                                                variant="ghost"
                                                                                onclick={(event) => {
                                                                                        event.stopPropagation();
                                                                                        resumeStore.moveBlock(block.id ?? '', 'down');
                                                                                }}
                                                                        >
                                                                                ↓
                                                                        </Button>
                                                                        <Button
                                                                                size="xs"
                                                                                tone="danger"
                                                                                variant="ghost"
                                                                                onclick={(event) => {
                                                                                        event.stopPropagation();
                                                                                        resumeStore.removeBlock(block.id ?? '');
                                                                                }}
                                                                        >
                                                                                Remove
                                                                        </Button>
                                                                </div>
                                                        </div>
                                                </Card>
                                        {/each}
                                </div>
                        </Card>

                        {#if selectedBlock}
                                <Card class="bg-white text-slate-900 space-y-3">
                                        <div class="flex items-center justify-between">
                                                <p class="text-sm font-semibold text-slate-900">Edit {selectedBlock.type.replace('_', ' ')}</p>
                                                <Tag tone={selectedBlock.hidden ? 'warning' : 'positive'} size="sm">
                                                        {selectedBlock.hidden ? 'Hidden' : 'Visible'}
                                                </Tag>
                                        </div>

                                        {#if selectedBlock.type === 'header'}
                                                <Input
                                                        label="Name"
                                                        value={selectedBlock.name}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                name: event.currentTarget.value
                                                        }))}
                                                />
                                                <Input
                                                        label="Title"
                                                        value={selectedBlock.title}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                title: event.currentTarget.value
                                                        }))}
                                                />
                                                <Textarea
                                                        label="Summary"
                                                        rows={4}
                                                        value={selectedBlock.summary}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                summary: event.currentTarget.value
                                                        }))}
                                                />
                                                {#each selectedBlock.contact_people as contact, contactIndex}
                                                        <div class="rounded border border-slate-200 p-3 space-y-2">
                                                                <Input
                                                                        label="Label"
                                                                        value={contact.label}
                                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => {
                                                                                if (block.type !== 'header') return block;
                                                                                const next = [...block.contact_people];
                                                                                next[contactIndex] = {
                                                                                        ...next[contactIndex],
                                                                                        label: event.currentTarget.value
                                                                                };
                                                                                return { ...block, contact_people: next };
                                                                        })}
                                                                />
                                                                {#each contact.people as person, personIndex}
                                                                        <div class="grid gap-2 md:grid-cols-3">
                                                                                <Input
                                                                                        label="Name"
                                                                                        value={person.name}
                                                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => {
                                                                                                if (block.type !== 'header') return block;
                                                                                                const next = [...block.contact_people];
                                                                                                const updatedPeople = [...next[contactIndex].people];
                                                                                                updatedPeople[personIndex] = {
                                                                                                        ...updatedPeople[personIndex],
                                                                                                        name: event.currentTarget.value
                                                                                                };
                                                                                                next[contactIndex] = { ...next[contactIndex], people: updatedPeople };
                                                                                                return { ...block, contact_people: next };
                                                                                        })}
                                                                                />
                                                                                <Input
                                                                                        label="Phone"
                                                                                        value={person.phone ?? ''}
                                                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => {
                                                                                                if (block.type !== 'header') return block;
                                                                                                const next = [...block.contact_people];
                                                                                                const updatedPeople = [...next[contactIndex].people];
                                                                                                updatedPeople[personIndex] = {
                                                                                                        ...updatedPeople[personIndex],
                                                                                                        phone: event.currentTarget.value
                                                                                                };
                                                                                                next[contactIndex] = { ...next[contactIndex], people: updatedPeople };
                                                                                                return { ...block, contact_people: next };
                                                                                        })}
                                                                                />
                                                                                <Input
                                                                                        label="Email"
                                                                                        value={person.email ?? ''}
                                                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => {
                                                                                                if (block.type !== 'header') return block;
                                                                                                const next = [...block.contact_people];
                                                                                                const updatedPeople = [...next[contactIndex].people];
                                                                                                updatedPeople[personIndex] = {
                                                                                                        ...updatedPeople[personIndex],
                                                                                                        email: event.currentTarget.value
                                                                                                };
                                                                                                next[contactIndex] = { ...next[contactIndex], people: updatedPeople };
                                                                                                return { ...block, contact_people: next };
                                                                                        })}
                                                                                />
                                                                        </div>
                                                                {/each}
                                                        </div>
                                                {/each}
                                        {:else if selectedBlock.type === 'skills_grid'}
                                                <Input
                                                        label="Title"
                                                        value={selectedBlock.title}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                title: event.currentTarget.value
                                                        }))}
                                                />
                                                <Input
                                                        label="Columns"
                                                        type="number"
                                                        value={selectedBlock.columns ?? 3}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                columns: Number(event.currentTarget.value) || 1
                                                        }))}
                                                />
                                                <Textarea
                                                        label="Skills (one per line)"
                                                        rows={6}
                                                        value={selectedBlock.skills.join('\n')}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                skills: parseList(event.currentTarget.value)
                                                        }))}
                                                />
                                        {:else if selectedBlock.type === 'highlighted_experience'}
                                                <Input
                                                        label="Company"
                                                        value={selectedBlock.company}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                company: event.currentTarget.value
                                                        }))}
                                                />
                                                <Input
                                                        label="Role"
                                                        value={selectedBlock.role}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                role: event.currentTarget.value
                                                        }))}
                                                />
                                                <Textarea
                                                        label="Description"
                                                        rows={5}
                                                        value={selectedBlock.description}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                description: event.currentTarget.value
                                                        }))}
                                                />
                                                <Textarea
                                                        label="Testimonial"
                                                        rows={3}
                                                        value={selectedBlock.testimonial ?? ''}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                testimonial: event.currentTarget.value
                                                        }))}
                                                />
                                                <Textarea
                                                        label="Technologies (one per line)"
                                                        rows={4}
                                                        value={selectedBlock.technologies.join('\n')}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                technologies: parseList(event.currentTarget.value)
                                                        }))}
                                                />
                                        {:else if selectedBlock.type === 'experience_section'}
                                                <Input
                                                        label="Title"
                                                        value={selectedBlock.title}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                title: event.currentTarget.value
                                                        }))}
                                                />
                                        {:else if selectedBlock.type === 'experience_item'}
                                                <div class="grid gap-2 md:grid-cols-2">
                                                        <Input
                                                                label="Period"
                                                                value={selectedBlock.period}
                                                                on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                        ...block,
                                                                        period: event.currentTarget.value
                                                                }))}
                                                        />
                                                        <Input
                                                                label="Location"
                                                                value={selectedBlock.location ?? ''}
                                                                on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                        ...block,
                                                                        location: event.currentTarget.value
                                                                }))}
                                                        />
                                                </div>
                                                <Input
                                                        label="Company"
                                                        value={selectedBlock.company}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                company: event.currentTarget.value
                                                        }))}
                                                />
                                                <Input
                                                        label="Role"
                                                        value={Array.isArray(selectedBlock.role) ? selectedBlock.role.join(' / ') : selectedBlock.role}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                role: event.currentTarget.value
                                                        }))}
                                                />
                                                <Textarea
                                                        label="Description"
                                                        rows={5}
                                                        value={selectedBlock.description}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                description: event.currentTarget.value
                                                        }))}
                                                />
                                                <Textarea
                                                        label="Technologies (one per line)"
                                                        rows={4}
                                                        value={selectedBlock.technologies.join('\n')}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                technologies: parseList(event.currentTarget.value)
                                                        }))}
                                                />
                                        {:else if selectedBlock.type === 'section_header'}
                                                <Input
                                                        label="Title"
                                                        value={selectedBlock.title}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                title: event.currentTarget.value
                                                        }))}
                                                />
                                                <Toggle
                                                        checked={selectedBlock.divider !== false}
                                                        on:change={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                divider: event.detail.checked
                                                        }))}
                                                >
                                                        Show divider
                                                </Toggle>
                                        {:else if selectedBlock.type === 'skills_categorized'}
                                                <Input
                                                        label="Category"
                                                        value={selectedBlock.category}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                category: event.currentTarget.value
                                                        }))}
                                                />
                                                <Textarea
                                                        label="Items (one per line; use Label: Value for pairs)"
                                                        rows={6}
                                                        value={selectedBlock.items
                                                                .map((item) => (typeof item === 'string' ? item : `${item.label}: ${item.value ?? ''}`.trim()))
                                                                .join('\n')}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                items: event.currentTarget.value
                                                                        .split('\n')
                                                                        .map((line) => line.trim())
                                                                        .filter(Boolean)
                                                                        .map((line) => {
                                                                                if (line.includes(':')) {
                                                                                        const [label, ...rest] = line.split(':');
                                                                                        return { label: label.trim(), value: rest.join(':').trim() };
                                                                                }
                                                                                return line;
                                                                        })
                                                        }))}
                                                />
                                        {:else if selectedBlock.type === 'multi_column_info'}
                                                <div class="space-y-3">
                                                        {#each selectedBlock.items as item, idx}
                                                                <div class="rounded border border-slate-200 p-3 space-y-2">
                                                                        <Input
                                                                                label="Label"
                                                                                value={item.label}
                                                                                on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => {
                                                                                        if (block.type !== 'multi_column_info') return block;
                                                                                        const next = [...block.items];
                                                                                        next[idx] = { ...next[idx], label: event.currentTarget.value };
                                                                                        return { ...block, items: next };
                                                                                })}
                                                                        />
                                                                        <Textarea
                                                                                label="Description"
                                                                                rows={3}
                                                                                value={item.description}
                                                                                on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => {
                                                                                        if (block.type !== 'multi_column_info') return block;
                                                                                        const next = [...block.items];
                                                                                        next[idx] = { ...next[idx], description: event.currentTarget.value };
                                                                                        return { ...block, items: next };
                                                                                })}
                                                                        />
                                                                        <Textarea
                                                                                label="Technologies (one per line)"
                                                                                rows={2}
                                                                                value={(item.technologies ?? []).join('\n')}
                                                                                on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => {
                                                                                        if (block.type !== 'multi_column_info') return block;
                                                                                        const next = [...block.items];
                                                                                        next[idx] = {
                                                                                                ...next[idx],
                                                                                                technologies: parseList(event.currentTarget.value)
                                                                                        };
                                                                                        return { ...block, items: next };
                                                                                })}
                                                                        />
                                                                </div>
                                                        {/each}
                                                </div>
                                        {:else if selectedBlock.type === 'testimonial'}
                                                <Textarea
                                                        label="Quote"
                                                        rows={4}
                                                        value={selectedBlock.quote}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                quote: event.currentTarget.value
                                                        }))}
                                                />
                                                <Input
                                                        label="Source"
                                                        value={selectedBlock.source}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                source: event.currentTarget.value
                                                        }))}
                                                />
                                        {:else if selectedBlock.type === 'footer'}
                                                <Input
                                                        label="Note"
                                                        value={selectedBlock.note}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                note: event.currentTarget.value
                                                        }))}
                                                />
                                                <Input
                                                        label="Updated at"
                                                        value={selectedBlock.updated_at ?? ''}
                                                        on:input={(event) => updateBlock(selectedBlock.id ?? '', (block) => ({
                                                                ...block,
                                                                updated_at: event.currentTarget.value
                                                        }))}
                                                />
                                        {/if}
                                </Card>
                        {/if}
                </div>

                <div class="space-y-4">
                        <Card class="bg-white text-slate-900">
                                <div class="flex items-center justify-between">
                                        <p class="text-sm font-semibold text-slate-900">Preview</p>
                                        <p class="text-xs text-slate-600">Print-aligned layout</p>
                                </div>
                                <div class="mt-4">
                                        <ResumePreview blocks={$resumeStore.state.blocks} />
                                </div>
                        </Card>
                </div>
        </Tabs.Content>

        <Tabs.Content value="versions" class="mt-4">
                <Card class="flex flex-col gap-3 bg-white text-slate-900">
                        <div class="flex items-center justify-between">
                                <p class="text-sm font-semibold text-slate-900">Versions</p>
                                <Button size="xs" variant="ghost">New version</Button>
                        </div>
                        <div class="flex flex-col divide-y divide-slate-100">
                                {#each data.resume.versions ?? [] as version}
                                        <div class="flex items-center justify-between py-3">
                                                <div>
                                                        <p class="text-sm font-semibold text-slate-900">{version.version_name}</p>
                                                        <p class="text-xs text-slate-600">{version.created_at}</p>
                                                </div>
                                                <div class="flex items-center gap-2 text-xs text-slate-700">
                                                        {#if version.is_main}<Tag tone="positive" size="sm">Main</Tag>{/if}
                                                        {#if !version.is_active}<Tag tone="warning" size="sm">Inactive</Tag>{/if}
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
