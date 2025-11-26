<script lang="ts">
        import type { ResumeBlock } from '$lib/services/resumes';
        let { blocks } = $props<{ blocks: ResumeBlock[] }>();

        const visibleBlocks = $derived(blocks.filter((b) => !b.hidden));
</script>

<div class="resume-print-page bg-white text-slate-900 shadow-sm">
        <div class="resume-print-section">
                {#if visibleBlocks.find((b) => b.type === 'header') as header}
                        <div class="grid gap-6 md:grid-cols-3 md:items-start">
                                <div class="md:col-span-2 space-y-3">
                                        <div>
                                                <p class="text-3xl font-semibold text-slate-900">{header.name}</p>
                                                <p class="text-lg font-medium text-slate-800">{header.title}</p>
                                        </div>
                                        <p class="text-sm leading-relaxed text-slate-700">{header.summary}</p>
                                </div>
                                <div class="space-y-2 border-l border-slate-200 pl-4">
                                        {#each header.contact_people as contact}
                                                <div class="space-y-1">
                                                        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                                {contact.label}
                                                        </p>
                                                        <div class="space-y-1 text-sm text-slate-800">
                                                                {#each contact.people as person}
                                                                        <div class="leading-tight">
                                                                                <p class="font-medium">{person.name}</p>
                                                                                {#if person.phone}<p class="text-slate-600">{person.phone}</p>{/if}
                                                                                {#if person.email}<p class="text-slate-600">{person.email}</p>{/if}
                                                                        </div>
                                                                {/each}
                                                        </div>
                                                </div>
                                        {/each}
                                </div>
                        </div>
                {/if}
        </div>

        {#each visibleBlocks as block}
                {#if block.type === 'skills_grid'}
                        <section class="resume-print-section">
                                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{block.title}</p>
                                <div
                                        class={`mt-2 grid gap-2 ${
                                                block.columns === 2
                                                        ? 'grid-cols-2'
                                                        : block.columns === 4
                                                          ? 'grid-cols-4'
                                                          : 'grid-cols-3'
                                        }`}
                                >
                                        {#each block.skills as skill}
                                                <div class="rounded border border-slate-200 px-3 py-2 text-sm text-slate-800">
                                                        {skill}
                                                </div>
                                        {/each}
                                </div>
                        </section>
                {:else if block.type === 'highlighted_experience'}
                        <section class="resume-print-section space-y-3">
                                <div>
                                        <p class="text-sm font-semibold text-slate-900">{block.company}</p>
                                        <p class="text-sm italic text-slate-700">{block.role}</p>
                                </div>
                                <p class="text-sm leading-relaxed text-slate-700">{block.description}</p>
                                {#if block.testimonial}
                                        <blockquote class="border-l-2 border-orange-400 pl-3 text-sm italic text-slate-700">
                                                “{block.testimonial}”
                                        </blockquote>
                                {/if}
                                <div class="space-y-1">
                                        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Technologies</p>
                                        <div class="flex flex-wrap gap-2">
                                                {#each block.technologies as tech}
                                                        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800">{tech}</span>
                                                {/each}
                                        </div>
                                </div>
                        </section>
                {:else if block.type === 'experience_section'}
                        <section class="resume-print-section">
                                <div class="flex items-center gap-3">
                                        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{block.title}</p>
                                        <div class="h-px flex-1 border-b border-slate-200"></div>
                                </div>
                        </section>
                {:else if block.type === 'experience_item'}
                        <section class="resume-print-section">
                                <div class="grid gap-3 md:grid-cols-[150px_1fr] md:items-start">
                                        <p class="text-sm font-semibold text-slate-700">{block.period}</p>
                                        <div class="space-y-2">
                                                <div>
                                                        <p class="text-sm font-semibold text-slate-900">{block.company}</p>
                                                        {#if block.location}
                                                                <p class="text-xs uppercase tracking-wide text-slate-500">{block.location}</p>
                                                        {/if}
                                                        <p class="text-sm text-slate-800">{Array.isArray(block.role) ? block.role.join(' / ') : block.role}</p>
                                                </div>
                                                <p class="text-sm leading-relaxed text-slate-700">{block.description}</p>
                                                {#if block.technologies.length}
                                                        <div class="space-y-1">
                                                                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                                        Technologies
                                                                </p>
                                                                <div class="flex flex-wrap gap-2">
                                                                        {#each block.technologies as tech}
                                                                                <span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800">
                                                                                        {tech}
                                                                                </span>
                                                                        {/each}
                                                                </div>
                                                        </div>
                                                {/if}
                                        </div>
                                </div>
                        </section>
                {:else if block.type === 'section_header'}
                        <section class="resume-print-section">
                                <div class="flex items-center gap-3">
                                        <p class="text-base font-semibold text-slate-900">{block.title}</p>
                                        {#if block.divider !== false}
                                                <div class="h-px flex-1 border-b border-slate-200"></div>
                                        {/if}
                                </div>
                        </section>
                {:else if block.type === 'skills_categorized'}
                        <section class="resume-print-section">
                                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{block.category}</p>
                                <div class="mt-1 space-y-1 text-sm text-slate-800">
                                        {#each block.items as item}
                                                {#if typeof item === 'string'}
                                                        <p>{item}</p>
                                                {:else}
                                                        <p>
                                                                <span class="font-semibold">{item.label}</span>
                                                                {#if item.value}
                                                                        <span class="text-slate-700">: {item.value}</span>
                                                                {/if}
                                                        </p>
                                                {/if}
                                        {/each}
                                </div>
                        </section>
                {:else if block.type === 'multi_column_info'}
                        <section class="resume-print-section space-y-2">
                                {#each block.items as item}
                                        <div class="grid gap-2 md:grid-cols-[140px_1fr] md:items-start">
                                                <p class="text-sm font-semibold text-slate-700">{item.label}</p>
                                                <div class="space-y-1 text-sm text-slate-800">
                                                        <p>{item.description}</p>
                                                        {#if item.technologies?.length}
                                                                <div class="flex flex-wrap gap-2">
                                                                        {#each item.technologies as tech}
                                                                                <span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800">
                                                                                        {tech}
                                                                                </span>
                                                                        {/each}
                                                                </div>
                                                        {/if}
                                                </div>
                                        </div>
                                {/each}
                        </section>
                {:else if block.type === 'testimonial'}
                        <section class="resume-print-section">
                                <blockquote class="border-l-2 border-orange-400 pl-3 text-sm italic text-slate-700">
                                        “{block.quote}”
                                </blockquote>
                                <p class="mt-2 text-sm font-semibold text-slate-800">{block.source}</p>
                        </section>
                {:else if block.type === 'footer'}
                        <section class="resume-print-section">
                                <p class="text-sm font-semibold text-orange-600">{block.note}</p>
                                {#if block.updated_at}
                                        <p class="text-xs text-slate-500">{block.updated_at}</p>
                                {/if}
                        </section>
                {/if}
        {/each}
</div>
