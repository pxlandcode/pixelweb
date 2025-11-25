<script lang="ts">
        import { Card, Button, Stack } from '@pixelcode_/blocks/components';
        let { data } = $props();
</script>

<section class="mx-auto max-w-5xl px-4 py-12">
        <div class="flex flex-col gap-2">
                <h1 class="text-3xl font-semibold text-gray-900">Consultant resumes</h1>
                <p class="text-sm text-gray-700">Public-facing list of consultant profiles using the main version.</p>
        </div>

        <Stack spacing="md" class="mt-6">
                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {#each data.resumes as resume}
                                <Card class="flex flex-col gap-3">
                                        {#if resume.content.find((b) => b.type === 'title') as titleBlock}
                                                <p class="text-lg font-semibold text-gray-900">{titleBlock.heading}</p>
                                                {#if titleBlock.subheading}<p class="text-sm text-gray-700">{titleBlock.subheading}</p>{/if}
                                        {/if}
                                        <Button variant="primary" href={`/internal/resumes/consultant/${resume.id}`}>
                                                View profile
                                        </Button>
                                </Card>
                        {/each}
                </div>
        </Stack>
</section>
