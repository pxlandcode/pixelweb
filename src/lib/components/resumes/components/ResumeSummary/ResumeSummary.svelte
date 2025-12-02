<script lang="ts">
	import type { LocalizedText } from '$lib/types/resume';
	import { QuillEditor } from '$lib/components';
	import { t, getLocalizedValue, setLocalizedValue, type Language } from '../utils';

	let {
		summary = $bindable(),
		isEditing = false,
		language = 'sv'
	}: {
		summary: LocalizedText;
		isEditing?: boolean;
		language?: Language;
	} = $props();
</script>

{#if isEditing}
	<div class="space-y-3">
		<div class="rounded-xs border border-slate-200 bg-white p-2">
			<p class="mb-1 text-sm font-medium text-slate-700">Summary (SV)</p>
			<QuillEditor
				content={getLocalizedValue(summary, 'sv')}
				onchange={(html) => (summary = setLocalizedValue(summary, 'sv', html))}
			/>
		</div>
		<div class="rounded-xs border border-slate-200 bg-white p-2">
			<p class="mb-1 text-sm font-medium text-slate-700">Summary (EN)</p>
			<QuillEditor
				content={getLocalizedValue(summary, 'en')}
				onchange={(html) => (summary = setLocalizedValue(summary, 'en', html))}
			/>
		</div>
	</div>
{:else}
	<div class="text-sm leading-relaxed text-slate-700">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html t(summary, language)}
	</div>
{/if}
