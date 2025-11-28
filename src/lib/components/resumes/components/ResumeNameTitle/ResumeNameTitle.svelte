<script lang="ts">
	import { Input, FormControl } from '@pixelcode_/blocks/components';
	import type { LocalizedText } from '$lib/types/resume';
	import { t, getLocalizedValue, setLocalizedValue, type Language } from '../utils';

	let {
		name = $bindable(),
		title = $bindable(),
		isEditing = false,
		language = 'sv'
	}: {
		name: string;
		title: LocalizedText;
		isEditing?: boolean;
		language?: Language;
	} = $props();
</script>

{#if isEditing}
	<div class="space-y-3">
		<FormControl label="Name">
			<Input bind:value={name} class="border-slate-300 bg-white text-lg font-bold text-slate-900" />
		</FormControl>
		<FormControl label="Title (SV)">
			<Input
				value={getLocalizedValue(title, 'sv')}
				oninput={(e) => (title = setLocalizedValue(title, 'sv', e.currentTarget.value))}
				class="border-slate-300 bg-white text-slate-900"
			/>
		</FormControl>
		<FormControl label="Title (EN)">
			<Input
				value={getLocalizedValue(title, 'en')}
				oninput={(e) => (title = setLocalizedValue(title, 'en', e.currentTarget.value))}
				class="border-slate-300 bg-white text-slate-900"
			/>
		</FormControl>
	</div>
{:else}
	<div>
		{#if name}
			<h1 class="mb-2 text-4xl font-bold text-slate-900">{name}</h1>
		{/if}
		<h2 class="text-xl font-medium text-slate-700">{t(title, language)}</h2>
	</div>
{/if}
