<script lang="ts">
        import { enhance } from '$app/forms';
        import { PixelButton } from '$components';
        import type { ActionData, PageData } from './$types';

        export let data: PageData;
        export let form: ActionData;

        const model = data.model;
</script>

<svelte:head>
        <title>Readability Checker</title>
</svelte:head>

<main class="mx-auto flex w-full max-w-4xl flex-col gap-8 p-6">
        <header class="space-y-2">
                <h1 class="text-4xl font-bold text-primary">Readability Checker</h1>
                <p class="text-muted-foreground">Assess how understandable your marketing copy is to large language models.</p>
                <div class="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                        <span class="font-medium">Active model:</span>
                        <span class="font-mono">{model}</span>
                </div>
        </header>

        <form method="post" action="?/evaluate" class="space-y-4" use:enhance>
                <div class="space-y-2">
                        <label class="text-sm font-semibold" for="sample">Marketing copy</label>
                        <textarea
                                id="sample"
                                name="sample"
                                rows="8"
                                class="w-full rounded-md border border-border bg-background p-3 text-sm shadow-sm focus:border-primary focus:outline-none">{form?.sample ?? ''}</textarea>
                </div>
                {#if form?.error}
                        <p class="text-sm text-destructive">{form.error}</p>
                {/if}
                <PixelButton type="submit">Run readability audit</PixelButton>
        </form>

        {#if form?.result}
                <section class="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
                        <div>
                                <h2 class="text-2xl font-semibold">Clarity score</h2>
                                <p class="text-4xl font-bold text-primary">{form.result.clarity}</p>
                        </div>
                        <div>
                                <h3 class="text-lg font-semibold">Summary</h3>
                                <p class="text-sm text-muted-foreground">{form.result.summary}</p>
                        </div>
                        <div>
                                <h3 class="text-lg font-semibold">Top issues</h3>
                                <ul class="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                        {#each form.result.issues as issue}
                                                <li>{issue}</li>
                                        {/each}
                                </ul>
                        </div>
                </section>
        {/if}
</main>
