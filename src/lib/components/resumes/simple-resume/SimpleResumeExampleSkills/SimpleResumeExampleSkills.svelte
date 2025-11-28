<script lang="ts">
	import { Button } from '@pixelcode_/blocks/components';
	import { TechStackSelector } from '$lib/components';
	import { t, type Language } from '../utils';

	let {
		skills = $bindable(),
		isEditing = false,
		language = 'sv'
	}: {
		skills: string[];
		isEditing?: boolean;
		language?: Language;
	} = $props();
</script>

{#if isEditing}
	<div class="rounded-md border border-slate-200 bg-slate-50 p-4">
		<p class="mb-3 text-xs font-semibold tracking-wide text-slate-700 uppercase">
			Examples of skills
		</p>
		<TechStackSelector bind:value={skills} onchange={(s) => (skills = s ?? [])} />
	</div>
{:else if skills.length > 0}
	<div class="flex-shrink-0 rounded-md bg-slate-50 p-4">
		<p class="mb-3 text-xs font-semibold tracking-wide text-slate-700 uppercase">
			{language === 'sv' ? 'Exempel på färdigheter' : 'Examples of skills'}
		</p>
		<div class="flex flex-wrap gap-1">
			{#each skills as skill}
				<span class="rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-700">{skill}</span>
			{/each}
		</div>
	</div>
{/if}
