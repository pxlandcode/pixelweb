<script lang="ts">
	import { enhance } from '$app/forms';
	import { Badge, Button, Card, FormControl, TextArea } from '@pixelcode_/blocks/components';
	import type { ActionData, PageData } from '../readability-checker/$types';

	export let data: PageData;
	export let form: ActionData;

	const model = data.model;
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
				for="sample"
				label="Marketing copy"
				required
				bl="We recommend auditing 300–2,000 characters at a time."
			>
				<TextArea
					id="sample"
					name="sample"
					rows={10}
					value={form?.sample ?? ''}
					placeholder="Drop in your hero copy, feature descriptions, FAQs…"
				/>
			</FormControl>
			{#if form?.error}
				<p class="text-sm text-destructive">{form.error}</p>
			{/if}
			<div class="flex justify-end">
				<Button type="submit" size="lg">Run compatibility audit</Button>
			</div>
		</form>
	</Card>

	{#if form?.result}
		<section class="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
			<Card class="gap-4 bg-card/80 p-6">
				<h2 class="text-lg font-semibold text-foreground">Clarity score</h2>
				<p class="text-5xl font-bold text-primary">{form.result.clarity}</p>
				<p class="text-sm text-muted-fg">
					A higher score indicates your copy can be summarized with confidence by compatible LLMs.
				</p>
			</Card>
			<Card class="gap-5 bg-card/80 p-6">
				<div class="space-y-2">
					<h3 class="text-lg font-semibold text-foreground">Summary</h3>
					<p class="text-sm leading-relaxed text-muted-fg">{form.result.summary}</p>
				</div>
				<div class="space-y-2">
					<h3 class="text-lg font-semibold text-foreground">Top issues</h3>
					<ul class="list-disc space-y-2 pl-5 text-sm text-muted-fg">
						{#each form.result.issues as issue}
							<li>{issue}</li>
						{/each}
					</ul>
				</div>
			</Card>
		</section>
	{/if}
</main>
