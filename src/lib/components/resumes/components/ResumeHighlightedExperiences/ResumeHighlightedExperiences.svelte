<script lang="ts">
	import type { HighlightedExperience, LocalizedText } from '$lib/types/resume';
	import { Button, Input, FormControl } from '@pixelcode_/blocks/components';
	import { QuillEditor, TechStackSelector } from '$lib/components';
	import { t, getLocalizedValue, setLocalizedValue, type Language } from '../utils';

	let {
		experiences = $bindable(),
		isEditing = false,
		language = 'sv',
		onAdd,
		onRemove,
		onMove
	}: {
		experiences: HighlightedExperience[];
		isEditing?: boolean;
		language?: Language;
		onAdd?: () => void;
		onRemove?: (index: number) => void;
		onMove?: (index: number, direction: 'up' | 'down') => void;
	} = $props();
</script>

<div class="space-y-4">
	{#if !isEditing && experiences.length > 0}
		<h3 class="pt-4 text-base font-bold tracking-wide text-slate-900 uppercase">
			{language === 'sv' ? 'Utvald Erfarenhet' : 'Highlighted Experience'}
		</h3>
	{/if}

	{#if isEditing}
		<div class="rounded-xs border border-slate-200 bg-slate-50 p-4">
			<h3 class="mb-4 text-sm font-semibold text-slate-700">Highlighted Experiences</h3>
			{#each experiences as exp, index (exp._id ?? index)}
				<div class="mb-4 rounded-xs border border-slate-200 bg-white p-4">
					<div class="mb-4 flex items-center justify-between">
						<h4 class="font-semibold text-slate-700">
							Experience {index + 1}
							{#if exp.hidden}
								<span class="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
									Hidden
								</span>
							{/if}
						</h4>
						<div class="flex gap-2">
							<Button
								variant={exp.hidden ? 'outline' : 'ghost'}
								size="sm"
								onclick={() => (exp.hidden = !exp.hidden)}
							>
								{exp.hidden ? 'Show' : 'Hide'}
							</Button>
							<Button
								variant="ghost"
								size="sm"
								disabled={index === 0}
								onclick={() => onMove?.(index, 'up')}>↑</Button
							>
							<Button
								variant="ghost"
								size="sm"
								disabled={index === experiences.length - 1}
								onclick={() => onMove?.(index, 'down')}>↓</Button
							>
							<Button
								variant="ghost"
								size="sm"
								class="text-red-600 hover:bg-red-50"
								onclick={() => onRemove?.(index)}>Remove</Button
							>
						</div>
					</div>
					<div class="space-y-3">
						<FormControl label="Company">
							<Input bind:value={exp.company} class="border-slate-300 bg-white text-slate-900" />
						</FormControl>
						<div class="grid grid-cols-2 gap-4">
							<FormControl label="Role (SV)">
								<Input
									value={getLocalizedValue(exp.role, 'sv')}
									oninput={(e) =>
										(exp.role = setLocalizedValue(exp.role, 'sv', e.currentTarget.value))}
									class="border-slate-300 bg-white text-slate-900"
								/>
							</FormControl>
							<FormControl label="Role (EN)">
								<Input
									value={getLocalizedValue(exp.role, 'en')}
									oninput={(e) =>
										(exp.role = setLocalizedValue(exp.role, 'en', e.currentTarget.value))}
									class="border-slate-300 bg-white text-slate-900"
								/>
							</FormControl>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-slate-700">Description (SV)</label>
							<div class="rounded-xs border border-slate-300 bg-white">
								<QuillEditor
									content={getLocalizedValue(exp.description, 'sv')}
									onchange={(html) =>
										(exp.description = setLocalizedValue(exp.description, 'sv', html))}
								/>
							</div>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-slate-700">Description (EN)</label>
							<div class="rounded-xs border border-slate-300 bg-white">
								<QuillEditor
									content={getLocalizedValue(exp.description, 'en')}
									onchange={(html) =>
										(exp.description = setLocalizedValue(exp.description, 'en', html))}
								/>
							</div>
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-slate-700"
								>{language === 'sv' ? 'Nyckeltekniker' : 'Key Technologies'}</label
							>
							<TechStackSelector
								bind:value={exp.technologies}
								onchange={(techs) => (exp.technologies = techs ?? [])}
							/>
						</div>
					</div>
				</div>
			{/each}
			<Button variant="outline" class="w-full border-dashed" onclick={onAdd}
				>+ Add Highlighted Experience</Button
			>
		</div>
	{:else}
		{#each experiences.filter((exp) => !exp.hidden) as exp}
			<div class="space-y-3 border-l border-primary pl-4">
				<div>
					<p class="text-sm font-semibold text-slate-900">{exp.company}</p>
					<p class="text-sm text-slate-700 italic">{t(exp.role, language)}</p>
				</div>
				<div class="experience-description text-sm leading-relaxed text-slate-700">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html t(exp.description, language)}
				</div>
				{#if exp.technologies.length > 0}
					<div class="space-y-1">
						<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
							{language === 'sv' ? 'Nyckeltekniker' : 'Key Technologies'}
						</p>
						<div class="flex flex-wrap gap-2">
							{#each exp.technologies as tech}
								<span class="rounded-xs bg-slate-100 px-3 py-1 text-xs text-slate-800">{tech}</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	{/if}
</div>

<style>
	:global(.experience-description blockquote) {
		border-left-width: 2px;
		border-color: rgb(251 146 60);
		padding-left: 0.75rem;
		font-size: 0.875rem;
		color: rgb(51 65 85);
		font-style: italic;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
		position: relative;
	}
	:global(.experience-description blockquote::before) {
		content: '"';
	}
	:global(.experience-description blockquote::after) {
		content: '"';
	}
</style>
