<script lang="ts">
	import type { ExperienceItem } from '$lib/types/resume';
	import { Button, Input, FormControl } from '@pixelcode_/blocks/components';
	import { QuillEditor, TechStackSelector } from '$lib/components';
	import { t, getLocalizedValue, setLocalizedValue, formatDate, type Language } from '../utils';

	let {
		experiences = $bindable(),
		isEditing = false,
		language = 'sv',
		onAdd,
		onRemove,
		onMove
	}: {
		experiences: ExperienceItem[];
		isEditing?: boolean;
		language?: Language;
		onAdd?: () => void;
		onRemove?: (index: number) => void;
		onMove?: (index: number, direction: 'up' | 'down') => void;
	} = $props();
</script>

{#if isEditing || experiences.length > 0}
	<section class="resume-print-section mt-8">
		<!-- Section Header with dividers -->
		<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
			<h2 class="text-base font-bold text-slate-900 uppercase">
				{language === 'sv' ? 'Tidigare Erfarenheter' : 'Previous Experience'}
			</h2>
			<div class="flex items-center">
				<div class="h-px w-full bg-orange-500"></div>
			</div>
			<div class="flex items-center">
				<div class="h-px flex-1 bg-slate-300"></div>
			</div>
		</div>

		<div class="mt-4 space-y-6">
			{#if isEditing}
				{#each experiences as exp, index}
					<div class="rounded-xs border border-slate-200 bg-slate-50 p-4">
						<div class="mb-4 flex items-center justify-between">
							<h4 class="font-semibold text-slate-700">
								{exp.company || `Experience ${index + 1}`}
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
							<div class="grid grid-cols-2 gap-4">
								<FormControl label="Start Date (YYYY-MM-DD)">
									<Input
										bind:value={exp.startDate}
										class="border-slate-300 bg-white text-slate-900"
									/>
								</FormControl>
								<FormControl label="End Date (empty = Present)">
									<Input
										bind:value={exp.endDate}
										placeholder="Leave empty for 'Present'"
										class="border-slate-300 bg-white text-slate-900"
									/>
								</FormControl>
							</div>
							<div class="grid grid-cols-2 gap-4">
								<FormControl label="Company">
									<Input
										bind:value={exp.company}
										class="border-slate-300 bg-white text-slate-900"
									/>
								</FormControl>
								<div class="space-y-2">
									<FormControl label="Location (SV)">
										<Input
											value={getLocalizedValue(exp.location ?? '', 'sv')}
											oninput={(e) =>
												(exp.location = setLocalizedValue(
													exp.location ?? '',
													'sv',
													e.currentTarget.value
												))}
											class="border-slate-300 bg-white text-slate-900"
										/>
									</FormControl>
									<FormControl label="Location (EN)">
										<Input
											value={getLocalizedValue(exp.location ?? '', 'en')}
											oninput={(e) =>
												(exp.location = setLocalizedValue(
													exp.location ?? '',
													'en',
													e.currentTarget.value
												))}
											class="border-slate-300 bg-white text-slate-900"
										/>
									</FormControl>
								</div>
							</div>
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
								<p class="mb-1 text-sm font-medium text-slate-700">Description (SV)</p>
								<div class="rounded-xs border border-slate-300 bg-white">
									<QuillEditor
										content={getLocalizedValue(exp.description, 'sv')}
										onchange={(html) =>
											(exp.description = setLocalizedValue(exp.description, 'sv', html))}
									/>
								</div>
							</div>
							<div>
								<p class="mb-1 text-sm font-medium text-slate-700">Description (EN)</p>
								<div class="rounded-xs border border-slate-300 bg-white">
									<QuillEditor
										content={getLocalizedValue(exp.description, 'en')}
										onchange={(html) =>
											(exp.description = setLocalizedValue(exp.description, 'en', html))}
									/>
								</div>
							</div>
							<div>
								<p class="mb-1 text-sm font-medium text-slate-700">Technologies</p>
								<TechStackSelector
									bind:value={exp.technologies}
									onchange={(techs) => (exp.technologies = techs ?? [])}
								/>
							</div>
						</div>
					</div>
				{/each}
				<Button
					variant="outline"
					class="w-full border-dashed border-slate-300 text-slate-700 hover:bg-slate-50"
					onclick={onAdd}
				>
					+ Add Experience
				</Button>
			{:else}
				{#each experiences.filter((exp) => !exp.hidden) as exp}
					<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
						<!-- Column 1: Empty -->
						<div></div>

						<!-- Column 2: Period, Company, Location -->
						<div class="space-y-1">
							<p class="text-sm font-semibold text-slate-900">
								<span class="whitespace-nowrap">{formatDate(exp.startDate, language)}</span>
								{#if exp.endDate}
									<span> - </span>
									<span class="whitespace-nowrap">{formatDate(exp.endDate, language)}</span>
								{/if}
							</p>
							<p class="text-sm font-semibold text-slate-900">{exp.company}</p>
							{#if exp.location}
								<p class="text-sm text-slate-700">{t(exp.location, language)}</p>
							{/if}
						</div>

						<!-- Column 3: Role, Description, Technologies -->
						<div class="space-y-3">
							<h3 class="text-base font-bold break-words hyphens-auto text-slate-900" lang="en">
								{t(exp.role, language)}
							</h3>
							<div
								class="text-sm leading-relaxed break-words hyphens-auto text-slate-700"
								lang="en"
							>
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html t(exp.description, language)}
							</div>
							{#if exp.technologies.length > 0}
								<div class="flex flex-wrap gap-2">
									{#each exp.technologies as tech}
										<span class="rounded-xs bg-slate-100 px-3 py-1 text-xs text-slate-800"
											>{tech}</span
										>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</section>
{/if}
