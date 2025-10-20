<script lang="ts">
        import { enhance } from '$app/forms';
        import { Badge, Button, Card, FormControl } from '@pixelcode_/blocks/components';
        import type { ActionData, PageData } from './$types';

        export let data: PageData;
        export let form: ActionData;

        const model = data.model;
        const rankingEnabled = data.rankingEnabled;

        const sections = [
                { key: 'discoverability', title: 'Discoverability' },
                { key: 'understanding', title: 'Understanding' },
                { key: 'clarity', title: 'Clarity' },
                { key: 'evidence', title: 'Evidence' },
                { key: 'tech', title: 'Technical' },
                { key: 'aiPolicy', title: 'AI Policy' }
        ] as const;

        $: clarityValue = form?.result?.report?.overview?.clarity ?? null;
        $: presenceRows = form?.result?.report?.presence?.serp ?? [];
</script>

<svelte:head>
	<title>AI Compatibility Checker</title>
</svelte:head>

<main class="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
	<header class="flex flex-col gap-4">
		<Badge variant="info" class="w-fit tracking-wide uppercase">
			<span>Active model</span>
			<span class="font-mono text-sm">{model}</span>
		</Badge>
		<h1 class="text-4xl font-semibold text-primary sm:text-5xl">AI Compatibility Checker</h1>
		<p class="max-w-3xl text-base leading-relaxed text-muted-fg">
			Paste your landing page copy to see how well modern language models will understand and
			summarize it.
		</p>
	</header>

        <Card class="gap-6 bg-card/80 p-6">
                <form method="post" action="?/evaluate" class="flex flex-col gap-5" use:enhance>
                        <FormControl
                                for="url"
                                label="Marketing page URL"
                                required
                                bl="Paste the full URL of the page you want to audit."
                        >
                                <input
                                        id="url"
                                        name="url"
                                        type="url"
                                        value={form?.url ?? ''}
                                        placeholder="https://www.example.com/landing"
                                        class="w-full rounded-md border border-border bg-background/60 px-3 py-2 text-base text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                        </FormControl>
                        <p class="text-xs text-muted-fg">
                                {#if rankingEnabled}
                                        SERP presence signals are active. Provide search API keys to see live rankings.
                                {:else}
                                        Set <code class="rounded bg-muted px-1">ENABLE_RANKING=1</code> with a search API key to
                                        enable SERP presence insights.
                                {/if}
                        </p>
                        {#if form?.error}
                                <p class="text-sm text-destructive">{form.error}</p>
                        {/if}
                        <div class="flex justify-end">
                                <Button type="submit" size="lg">Run compatibility audit</Button>
                        </div>
                </form>
        </Card>

        {#if form?.result}
                {#if form.result.scores}
                        <section class="grid gap-4 md:grid-cols-3">
                                <Card class="gap-2 bg-card/80 p-5 text-center">
                                        <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-fg">Discoverability</h3>
                                        <p class="text-4xl font-bold text-primary">{Math.round(form.result.scores.discoverabilityScore)}</p>
                                </Card>
                                <Card class="gap-2 bg-card/80 p-5 text-center">
                                        <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-fg">Comprehensibility</h3>
                                        <p class="text-4xl font-bold text-primary">{Math.round(form.result.scores.comprehensibilityScore)}</p>
                                </Card>
                                <Card class="gap-2 bg-card/80 p-5 text-center">
                                        <h3 class="text-sm font-semibold uppercase tracking-wide text-muted-fg">Authority</h3>
                                        <p class="text-4xl font-bold text-primary">{Math.round(form.result.scores.authorityScore)}</p>
                                </Card>
                        </section>
                {/if}

                <section class="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
                        <Card class="gap-4 bg-card/80 p-6">
                                <h2 class="text-lg font-semibold text-foreground">LLM overview</h2>
                                <p class="text-5xl font-bold text-primary">
                                        {typeof clarityValue === 'number' ? clarityValue.toFixed(1) : '—'}
                                </p>
                                <p class="text-sm text-muted-fg">{form.result.report.overview.summary}</p>
                        </Card>
                        <Card class="gap-5 bg-card/80 p-6">
                                <div class="space-y-2">
                                        <h3 class="text-lg font-semibold text-foreground">Top issues</h3>
                                        <ul class="list-disc space-y-2 pl-5 text-sm text-muted-fg">
                                                {#each form.result.report.overview.issues as issue}
                                                        <li>{issue}</li>
                                                {/each}
                                        </ul>
                                </div>
                                <div class="space-y-2">
                                        <h3 class="text-lg font-semibold text-foreground">One-liner</h3>
                                        <p class="text-sm leading-relaxed text-muted-fg">{form.result.analyzers.oneLiner}</p>
                                </div>
                        </Card>
                </section>

                {#if form.result.insights.length}
                        <section class="space-y-3">
                                <div class="flex items-center gap-2">
                                        <h3 class="text-lg font-semibold text-foreground">Insights</h3>
                                        <Badge variant="warning">Action</Badge>
                                </div>
                                <ul class="grid gap-3 md:grid-cols-3">
                                        {#each form.result.insights as insight}
                                                <li class="rounded-lg border border-border/60 bg-background/60 p-4">
                                                        <p class="text-sm font-semibold text-foreground">{insight.label}</p>
                                                        <p class="text-xs text-muted-fg">{insight.action}</p>
                                                </li>
                                        {/each}
                                </ul>
                        </section>
                {/if}

                <section class="grid gap-4 md:grid-cols-2">
                        {#each sections as section}
                                <Card class="gap-3 bg-card/80 p-5" key={section.key}>
                                        {@const sectionReport = form.result.report[section.key]}
                                        <h3 class="text-base font-semibold text-foreground">{section.title}</h3>
                                        <p class="text-sm text-muted-fg">{sectionReport.summary}</p>
                                        {#if sectionReport.highlights.length}
                                                <div class="space-y-2">
                                                        <h4 class="text-xs font-semibold uppercase tracking-wide text-muted-fg">Highlights</h4>
                                                        <ul class="list-disc space-y-1 pl-4 text-xs text-muted-fg">
                                                                {#each sectionReport.highlights as highlight}
                                                                        <li>{highlight}</li>
                                                                {/each}
                                                        </ul>
                                                </div>
                                        {/if}
                                        {#if sectionReport.actions.length}
                                                <div class="space-y-2">
                                                        <h4 class="text-xs font-semibold uppercase tracking-wide text-muted-fg">Recommended actions</h4>
                                                        <ul class="list-disc space-y-1 pl-4 text-xs text-muted-fg">
                                                                {#each sectionReport.actions as action}
                                                                        <li>{action}</li>
                                                                {/each}
                                                        </ul>
                                                </div>
                                        {/if}
                                </Card>
                        {/each}
                </section>

                {#if presenceRows.length}
                        <Card class="gap-4 bg-card/80 p-6">
                                <div class="flex items-center justify-between">
                                        <h3 class="text-lg font-semibold text-foreground">Presence</h3>
                                        <Badge variant="info">Beta</Badge>
                                </div>
                                <div class="overflow-x-auto">
                                        <table class="w-full text-left text-sm text-muted-fg">
                                                <thead>
                                                        <tr class="border-b border-border/60 text-xs uppercase tracking-wide">
                                                                <th class="py-2 pr-4">Query</th>
                                                                <th class="py-2 pr-4">Engine</th>
                                                                <th class="py-2">Rank</th>
                                                        </tr>
                                                </thead>
                                                <tbody>
                                                        {#each presenceRows as row}
                                                                <tr class="border-b border-border/40 last:border-none">
                                                                        <td class="py-2 pr-4">{row.query}</td>
                                                                        <td class="py-2 pr-4 uppercase">{row.engine}</td>
                                                                        <td class="py-2">{row.rank ?? '—'}</td>
                                                                </tr>
                                                        {/each}
                                                </tbody>
                                        </table>
                                </div>
                        </Card>
                {/if}

                <Card class="gap-4 bg-card/80 p-6">
                        <details>
                                <summary class="cursor-pointer text-sm font-semibold text-foreground">Raw diagnostics</summary>
                                <pre class="mt-4 max-h-96 overflow-auto rounded bg-muted/50 p-4 text-xs text-muted-fg">{form.result.analyzers?.snapshotJson ?? ''}</pre>
                        </details>
                </Card>
        {/if}
</main>
