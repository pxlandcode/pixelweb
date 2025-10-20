<script lang="ts">
	import { enhance } from '$app/forms';
	import { Badge, Button, Card, FormControl, Input } from '@pixelcode_/blocks/components';
	import { tooltip } from '@pixelcode_/blocks/attachments';
	import Info from 'lucide-svelte/icons/info';
	import type { Action } from 'svelte/action';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	const model = data.model;
	const rankingEnabled = data.rankingEnabled;

	const sections = [
		{
			key: 'discoverability',
			title: 'Discoverability',
			tooltip: 'How quickly someone can grasp what your company offers from this page.'
		},
		{
			key: 'understanding',
			title: 'Understanding',
			tooltip: 'Explains what the product does, who it is for, and why it matters.'
		},
		{
			key: 'clarity',
			title: 'Clarity',
			tooltip: 'Highlights whether your copy is straightforward and easy to skim.'
		},
		{
			key: 'evidence',
			title: 'Evidence',
			tooltip: 'Looks for proof points like testimonials, case studies, or logos.'
		},
		{
			key: 'tech',
			title: 'Technical',
			tooltip: 'Covers simple site hygiene such as metadata, headings, and load cues.'
		},
		{
			key: 'aiPolicy',
			title: 'AI Policy',
			tooltip: 'Shows if you explain how you use AI responsibly and transparently.'
		}
	] as const;

	const createTooltip = (text: string): Action<HTMLElement> => {
		const raw = tooltip(text);
		return (element) => {
			if (typeof raw !== 'function') {
				return {};
			}

			const result = raw(element);

			if (typeof result === 'function') {
				return { destroy: result };
			}

			return result ?? {};
		};
	};

	const tooltipDiscoverabilityScore = createTooltip(
		'Shows how quickly someone can figure out what your business does.'
	);
	const tooltipComprehensibilityScore = createTooltip(
		'Checks if the wording is clear, simple, and easy to follow.'
	);
	const tooltipAuthorityScore = createTooltip(
		'Looks for trust signals so your page feels credible and reliable.'
	);
	const tooltipOverviewScore = createTooltip(
		'A quick pulse on how clearly AI can summarize your page in plain language.'
	);
	const tooltipTopIssues = createTooltip(
		'The biggest blockers the AI noticed, translated into everyday language.'
	);
	const tooltipOneLiner = createTooltip(
		'A punchy elevator pitch the AI would give based on your page content.'
	);
	const tooltipInsights = createTooltip(
		'Actionable suggestions the AI generated to help improve your page for LLMs.'
	);
	const tooltipPresence = createTooltip(
		'Sample Brave search results so you can see if your site shows up and how high it ranks.'
	);
	const tooltipGrounding = createTooltip(
		'Shows the sources Brave AI relied on and whether your domain was mentioned.'
	);
	const tooltipDiagnostics = createTooltip(
		'Complete raw output for troubleshooting or sharing with support.'
	);

	$: clarityValue = form?.result?.report?.overview?.clarity ?? null;
	$: presenceRows = form?.result?.report?.presence?.serp ?? [];
	$: groundingRows = form?.result?.report?.presence?.grounding ?? [];

	const infoButtonClass =
		'inline-flex size-7 items-center justify-center rounded-full border border-transparent text-muted-fg transition-colors hover:border-border hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2';
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
		<button
			type="button"
			class={infoButtonClass}
			aria-label="What the presence table shows"
			use:tooltipPresence
		>
			<Info class="size-4" aria-hidden="true" />
		</button>
	</header>

	<Card class="gap-6 bg-card/80 p-6">
		<form method="post" action="?/evaluate" class="flex flex-col gap-5" use:enhance>
			<FormControl
				for="url"
				label="Marketing page URL"
				required
				bl="Paste the full URL of the page you want to audit."
			>
				<Input
					id="url"
					name="url"
					type="url"
					value={form?.url ?? ''}
					placeholder="https://www.example.com/landing"
					class="w-full  border border-border bg-white px-3 py-2 text-sm text-background shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
				/>
			</FormControl>
			<p class="text-xs text-muted-fg">
				{#if rankingEnabled}
					SERP presence signals are active. Provide search API keys to see live rankings.
				{:else}
					Set <code class="rounded bg-muted px-1">ENABLE_RANKING=1</code> with a search API key to enable
					SERP presence insights.
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
					<div class="flex items-center justify-center gap-2">
						<h3 class="text-sm font-semibold tracking-wide text-muted-fg uppercase">
							Discoverability
						</h3>
						<button
							type="button"
							class={infoButtonClass}
							aria-label="What the discoverability score means"
							use:tooltipDiscoverabilityScore
						>
							<Info class="size-4" aria-hidden="true" />
						</button>
					</div>
					<p class="text-4xl font-bold text-primary">
						{Math.round(form.result.scores.discoverabilityScore)}
					</p>
				</Card>
				<Card class="gap-2 bg-card/80 p-5 text-center">
					<div class="flex items-center justify-center gap-2">
						<h3 class="text-sm font-semibold tracking-wide text-muted-fg uppercase">
							Comprehensibility
						</h3>
						<button
							type="button"
							class={infoButtonClass}
							aria-label="What the comprehensibility score means"
							use:tooltipComprehensibilityScore
						>
							<Info class="size-4" aria-hidden="true" />
						</button>
					</div>
					<p class="text-4xl font-bold text-primary">
						{Math.round(form.result.scores.comprehensibilityScore)}
					</p>
				</Card>
				<Card class="gap-2 bg-card/80 p-5 text-center">
					<div class="flex items-center justify-center gap-2">
						<h3 class="text-sm font-semibold tracking-wide text-muted-fg uppercase">Authority</h3>
						<button
							type="button"
							class={infoButtonClass}
							aria-label="What the authority score means"
							use:tooltipAuthorityScore
						>
							<Info class="size-4" aria-hidden="true" />
						</button>
					</div>
					<p class="text-4xl font-bold text-primary">
						{Math.round(form.result.scores.authorityScore)}
					</p>
				</Card>
			</section>
		{/if}

		<section class="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
			<Card class="gap-4 bg-card/80 p-6">
				<div class="flex items-center justify-between gap-3">
					<h2 class="text-lg font-semibold text-foreground">LLM overview</h2>
					<button
						type="button"
						class={infoButtonClass}
						aria-label="What the LLM overview score means"
						use:tooltipOverviewScore
					>
						<Info class="size-4" aria-hidden="true" />
					</button>
				</div>
				<p class="text-5xl font-bold text-primary">
					{typeof clarityValue === 'number' ? clarityValue.toFixed(1) : '—'}
				</p>
				<p class="text-sm text-muted-fg">{form.result.report.overview.summary}</p>
			</Card>
			<Card class="gap-5 bg-card/80 p-6">
				<div class="space-y-2">
					<div class="flex items-center justify-between gap-3">
						<h3 class="text-lg font-semibold text-foreground">Top issues</h3>
						<button
							type="button"
							class={infoButtonClass}
							aria-label="What the top issues list means"
							use:tooltipTopIssues
						>
							<Info class="size-4" aria-hidden="true" />
						</button>
					</div>
					<ul class="list-disc space-y-2 pl-5 text-sm text-muted-fg">
						{#each form.result.report.overview.issues as issue}
							<li>{issue}</li>
						{/each}
					</ul>
				</div>
				<div class="space-y-2">
					<div class="flex items-center justify-between gap-3">
						<h3 class="text-lg font-semibold text-foreground">One-liner</h3>
						<button
							type="button"
							class={infoButtonClass}
							aria-label="What the one-liner is for"
							use:tooltipOneLiner
						>
							<Info class="size-4" aria-hidden="true" />
						</button>
					</div>
					<p class="text-sm leading-relaxed text-muted-fg">{form.result.analyzers.oneLiner}</p>
				</div>
			</Card>
		</section>

		{#if form.result.insights.length}
			<section class="space-y-3">
				<div class="flex flex-wrap items-center gap-3">
					<div class="flex items-center gap-2">
						<h3 class="text-lg font-semibold text-foreground">Insights</h3>
						<button
							type="button"
							class={infoButtonClass}
							aria-label="What the insights list is for"
							use:tooltipInsights
						>
							<Info class="size-4" aria-hidden="true" />
						</button>
					</div>
					<Badge variant="warning">Action</Badge>
				</div>
				<ul class="grid gap-3 md:grid-cols-3">
					{#each form.result.insights as insight}
						{@const insightTooltip = insight.tooltip ? createTooltip(insight.tooltip) : null}
						<li class="rounded-lg border border-border/60 bg-background/60 p-4">
							<div class="flex items-start justify-between gap-2">
								<p class="text-sm font-semibold text-foreground">{insight.label}</p>
								{#if insightTooltip}
									<button
										type="button"
										class={infoButtonClass}
										aria-label={`What ${insight.label} means`}
										use:insightTooltip
									>
										<Info class="size-4" aria-hidden="true" />
									</button>
								{/if}
							</div>
							<p class="text-xs text-muted-fg">{insight.action}</p>
							{#if insight.details}
								<p class="mt-2 text-[11px] leading-relaxed text-muted-fg">{insight.details}</p>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<section class="grid gap-4 md:grid-cols-2">
			{#each sections as section}
				<Card class="gap-3 bg-card/80 p-5" key={section.key}>
					{@const sectionTooltip = createTooltip(section.tooltip)}
					{@const sectionReport = form.result.report[section.key]}
					<div class="flex items-start justify-between gap-3">
						<h3 class="text-base font-semibold text-foreground">{section.title}</h3>
						<button
							type="button"
							class={infoButtonClass}
							aria-label={`What the ${section.title} section measures`}
							use:sectionTooltip
						>
							<Info class="size-4" aria-hidden="true" />
						</button>
					</div>
					<p class="text-sm text-muted-fg">{sectionReport.summary}</p>
					{#if sectionReport.highlights.length}
						<div class="space-y-2">
							<h4 class="text-xs font-semibold tracking-wide text-muted-fg uppercase">
								Highlights
							</h4>
							<ul class="list-disc space-y-1 pl-4 text-xs text-muted-fg">
								{#each sectionReport.highlights as highlight}
									<li>{highlight}</li>
								{/each}
							</ul>
						</div>
					{/if}
					{#if sectionReport.actions.length}
						<div class="space-y-2">
							<h4 class="text-xs font-semibold tracking-wide text-muted-fg uppercase">
								Recommended actions
							</h4>
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
				<div class="flex items-center justify-between gap-3">
					<div class="flex items-center gap-2">
						<h3 class="text-lg font-semibold text-foreground">Presence</h3>
						<button
							type="button"
							class={infoButtonClass}
							aria-label="What the presence table shows"
							use:tooltipPresence
						>
							<Info class="size-4" aria-hidden="true" />
						</button>
					</div>
					<Badge variant="info">Beta</Badge>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-left text-sm text-muted-fg">
						<thead>
							<tr class="border-b border-border/60 text-xs tracking-wide uppercase">
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

		{#if groundingRows.length}
			<Card class="gap-4 bg-card/80 p-6">
				<div class="flex items-center justify-between gap-3">
					<div class="flex items-center gap-2">
						<h3 class="text-lg font-semibold text-foreground">Brave AI citations</h3>
						<button
							type="button"
							class={infoButtonClass}
							aria-label="What the Brave AI citations list means"
							use:tooltipGrounding
						>
							<Info class="size-4" aria-hidden="true" />
						</button>
					</div>
					<Badge variant="info">Grounding</Badge>
				</div>
				<div class="space-y-4">
					{#each groundingRows as grounding}
						<article class="rounded-lg border border-border/40 bg-background/40 p-4">
							<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
								<h4 class="text-sm font-semibold text-foreground">{grounding.query}</h4>
								<span
									class={`text-xs font-semibold tracking-wide uppercase ${grounding.cited ? 'text-emerald-300' : 'text-muted-fg'}`}
								>
									{grounding.cited ? 'Cited domain' : 'Domain not cited'}
								</span>
							</div>
							<p class="mt-1 text-xs text-muted-fg">
								{grounding.cited
									? 'Din domän förekommer bland Brave AI:s källor för denna sökning.'
									: 'Brave AI citerade andra källor för denna sökning.'}
							</p>
							{#if grounding.citations.length}
								<ul class="mt-3 space-y-2">
									{#each grounding.citations.slice(0, 10) as citation}
										<li class="rounded-md border border-border/40 bg-background/60 p-3">
											<p class="text-sm font-medium text-foreground">
												{citation.title ?? citation.url}
											</p>
											<div
												class="mt-1 flex flex-col gap-1 text-xs text-muted-fg sm:flex-row sm:items-center sm:justify-between"
											>
												<span class="truncate text-xs text-muted-fg">{citation.url}</span>
												{#if citation.score !== undefined}
													<span
														class="rounded bg-muted/40 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted-fg uppercase"
													>
														Relevans: {citation.score.toFixed(2)}
													</span>
												{/if}
											</div>
										</li>
									{/each}
								</ul>
							{/if}
						</article>
					{/each}
				</div>
			</Card>
		{/if}

		<Card class="gap-4 bg-card/80 p-6">
			<div class="flex items-start justify-between gap-3">
				<details class="w-full">
					<summary class="cursor-pointer text-sm font-semibold text-foreground"
						>Raw diagnostics</summary
					>
					<pre
						class="mt-4 max-h-96 overflow-auto rounded bg-muted/50 p-4 text-xs text-muted-fg">{form
							.result.analyzers?.snapshotJson ?? ''}</pre>
				</details>
				<button
					type="button"
					class={infoButtonClass}
					aria-label="What the raw diagnostics contain"
					use:tooltipDiagnostics
				>
					<Info class="size-4" aria-hidden="true" />
				</button>
			</div>
		</Card>
	{/if}
</main>
