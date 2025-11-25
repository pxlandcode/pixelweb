<script lang="ts">
        import { Button, Card } from '@pixelcode_/blocks/components';
        let { data } = $props();
</script>

<div class="flex items-center justify-between">
        <div>
                <h1 class="text-2xl font-semibold text-gray-900">Consultant resume</h1>
                <p class="text-sm text-gray-700">Read-only view for clients with export options.</p>
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

<Card class="mt-6 resume-print-page">
        {#each data.resume.content as block}
                {#if block.type === 'title'}
                        <div class="resume-print-section">
                                <p class="text-xl font-semibold text-gray-900">{block.heading}</p>
                                {#if block.subheading}<p class="text-sm text-gray-700">{block.subheading}</p>{/if}
                        </div>
                {:else if block.type === 'body'}
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
