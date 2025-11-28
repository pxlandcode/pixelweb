<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';
	import { Input, FormControl, Button } from '@pixelcode_/blocks/components';
	import { TechStackSelector } from '$lib/components';
	import ResumeSectionRow from './ResumeSectionRow.svelte';

	let {
		block,
		isEditing = false,
		language = 'sv'
	} = $props<{
		block: Extract<ResumeBlock, { type: 'skills_categorized' }>;
		isEditing?: boolean;
		language?: 'sv' | 'en';
	}>();

	let editingBlock = $state({ ...block });

	$effect(() => {
		editingBlock = { ...block };
	});

	const resolveText = (content: any) => {
		if (!content) return { text: '', missing: false };
		if (typeof content === 'string') return { text: content, missing: false };
		if (content[language]) return { text: content[language], missing: false };
		const other = language === 'sv' ? 'en' : 'sv';
		return { text: content[other] || '', missing: true };
	};

	const normalizeCategory = (value: any) => {
		if (!value) return '';
		if (typeof value === 'string') return value.toLowerCase();
		return `${value.sv ?? ''} ${value.en ?? ''}`.toLowerCase();
	};

	const editingCategory = $derived(normalizeCategory(editingBlock.category));
	const blockCategory = $derived(normalizeCategory(block.category));

	const isTechniqueOrMethod = $derived(
		editingCategory.includes('technique') ||
			editingCategory.includes('method') ||
			editingCategory.includes('teknik') ||
			editingCategory.includes('metod')
	);
	const isLanguage = $derived(
		editingCategory.includes('language') || editingCategory.includes('språk')
	);
	const isPortfolio = $derived(
		editingCategory.includes('portfolio') || editingCategory.includes('portfölj')
	);
	const isEducation = $derived(
		editingCategory.includes('education') || editingCategory.includes('utbild')
	);
	const isLockedCategory = $derived(
		isTechniqueOrMethod || isLanguage || isPortfolio || isEducation
	);

	const filteredItems = $derived(
		block.items.filter((item) => {
			if (typeof item === 'string') return item.trim().length > 0;
			const label = resolveText(item.label).text.trim();
			const value = item.value ? resolveText(item.value).text.trim() : '';
			return label.length > 0 || value.length > 0;
		})
	);
	const shouldHide = $derived(
		!isEditing &&
			(blockCategory.includes('portfolio') ||
				blockCategory.includes('portfölj') ||
				blockCategory.includes('education') ||
				blockCategory.includes('utbild')) &&
			filteredItems.length === 0
	);

	const addItem = () => {
		if (isLanguage) {
			editingBlock.items = [...editingBlock.items, { label: '', value: '' }];
		} else if (isPortfolio) {
			editingBlock.items = [...editingBlock.items, ''];
		} else if (isEducation) {
			editingBlock.items = [...editingBlock.items, { label: '', value: '' }];
		} else {
			editingBlock.items = [...editingBlock.items, ''];
		}
	};

	const removeItem = (index: number) => {
		editingBlock.items = editingBlock.items.filter((_: unknown, i: number) => i !== index);
	};

	const category = $derived(resolveText(block.category));
</script>

{#if isEditing}
	<section class="resume-print-section mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
		{#if !isLockedCategory}
			<div class="mb-3 grid grid-cols-2 gap-4">
				<FormControl label="Category (SV)">
					<Input
						value={typeof editingBlock.category === 'string'
							? editingBlock.category
							: editingBlock.category.sv}
						oninput={(e) => {
							if (typeof editingBlock.category === 'string') {
								editingBlock.category = { sv: e.currentTarget.value, en: editingBlock.category };
							} else {
								editingBlock.category.sv = e.currentTarget.value;
							}
						}}
						class="border-slate-300 bg-white text-slate-900"
					/>
				</FormControl>
				<FormControl label="Category (EN)">
					<Input
						value={typeof editingBlock.category === 'string'
							? editingBlock.category
							: editingBlock.category.en}
						oninput={(e) => {
							if (typeof editingBlock.category === 'string') {
								editingBlock.category = { en: e.currentTarget.value, sv: editingBlock.category };
							} else {
								editingBlock.category.en = e.currentTarget.value;
							}
						}}
						class="border-slate-300 bg-white text-slate-900"
					/>
				</FormControl>
			</div>
		{:else}
			<p class="mb-3 text-sm font-semibold text-slate-700">
				{resolveText(editingBlock.category).text}
			</p>
		{/if}

		<div class="mt-3">
			{#if isTechniqueOrMethod}
				<label class="mb-1 block text-sm font-medium text-slate-700">Items</label>
				<TechStackSelector
					bind:value={editingBlock.items}
					onchange={(items) => (editingBlock.items = items)}
				/>
			{:else if isLanguage}
				<label class="mb-1 block text-sm font-medium text-slate-700">Languages</label>
				<div class="space-y-4">
					{#each editingBlock.items as item, index}
						{#if typeof item !== 'string'}
							<div class="rounded border border-slate-200 bg-white p-3">
								<div class="mb-2 flex justify-end">
									<Button variant="ghost" size="sm" onclick={() => removeItem(index)}>Remove</Button
									>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-2">
										<Input
											value={typeof item.label === 'string' ? item.label : item.label?.sv}
											oninput={(e) => {
												if (typeof item.label === 'string') {
													item.label = { sv: e.currentTarget.value, en: item.label };
												} else {
													item.label.sv = e.currentTarget.value;
												}
											}}
											placeholder="Language (SV)"
											class="border-slate-300 bg-white"
										/>
										<Input
											value={typeof item.label === 'string' ? item.label : item.label?.en}
											oninput={(e) => {
												if (typeof item.label === 'string') {
													item.label = { en: e.currentTarget.value, sv: item.label };
												} else {
													item.label.en = e.currentTarget.value;
												}
											}}
											placeholder="Language (EN)"
											class="border-slate-300 bg-white"
										/>
									</div>
									<div class="space-y-2">
										<Input
											value={typeof item.value === 'string' ? item.value : item.value?.sv}
											oninput={(e) => {
												if (typeof item.value === 'string' || !item.value) {
													item.value = {
														sv: e.currentTarget.value,
														en: typeof item.value === 'string' ? item.value : ''
													};
												} else {
													item.value.sv = e.currentTarget.value;
												}
											}}
											placeholder="Proficiency (SV)"
											class="border-slate-300 bg-white"
										/>
										<Input
											value={typeof item.value === 'string' ? item.value : item.value?.en}
											oninput={(e) => {
												if (typeof item.value === 'string' || !item.value) {
													item.value = {
														en: e.currentTarget.value,
														sv: typeof item.value === 'string' ? item.value : ''
													};
												} else {
													item.value.en = e.currentTarget.value;
												}
											}}
											placeholder="Proficiency (EN)"
											class="border-slate-300 bg-white"
										/>
									</div>
								</div>
							</div>
						{/if}
					{/each}
					<Button variant="outline" size="sm" onclick={addItem}>+ Add Language</Button>
				</div>
			{:else if isPortfolio}
				<label class="mb-1 block text-sm font-medium text-slate-700">Portfolio URLs</label>
				<div class="space-y-2">
					{#each editingBlock.items as item, index}
						{#if typeof item === 'string'}
							<div class="flex gap-2">
								<Input
									bind:value={editingBlock.items[index]}
									placeholder="https://..."
									class="flex-1 border-slate-300 bg-white"
								/>
								<Button variant="ghost" size="sm" onclick={() => removeItem(index)}>Remove</Button>
							</div>
						{/if}
					{/each}
					<Button variant="outline" size="sm" onclick={addItem}>+ Add URL</Button>
				</div>
			{:else if isEducation}
				<label class="mb-1 block text-sm font-medium text-slate-700">Educations</label>
				<div class="space-y-4">
					{#each editingBlock.items as item, index}
						{#if typeof item !== 'string'}
							<div class="rounded border border-slate-200 bg-white p-3">
								<div class="mb-2 flex justify-end">
									<Button variant="ghost" size="sm" onclick={() => removeItem(index)}>Remove</Button
									>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<Input
										value={typeof item.label === 'string' ? item.label : item.label?.sv}
										oninput={(e) => {
											if (typeof item.label === 'string') {
												item.label = { sv: e.currentTarget.value, en: item.label };
											} else {
												item.label.sv = e.currentTarget.value;
											}
										}}
										placeholder="Education (SV)"
										class="border-slate-300 bg-white"
									/>
									<Input
										value={typeof item.label === 'string' ? item.label : item.label?.en}
										oninput={(e) => {
											if (typeof item.label === 'string') {
												item.label = { en: e.currentTarget.value, sv: item.label };
											} else {
												item.label.en = e.currentTarget.value;
											}
										}}
										placeholder="Education (EN)"
										class="border-slate-300 bg-white"
									/>
									<Input
										value={typeof item.value === 'string' ? item.value : item.value?.sv}
										oninput={(e) => {
											if (typeof item.value === 'string' || !item.value) {
												item.value = {
													sv: e.currentTarget.value,
													en: typeof item.value === 'string' ? item.value : ''
												};
											} else {
												item.value.sv = e.currentTarget.value;
											}
										}}
										placeholder="Details (SV)"
										class="border-slate-300 bg-white"
									/>
									<Input
										value={typeof item.value === 'string' ? item.value : item.value?.en}
										oninput={(e) => {
											if (typeof item.value === 'string' || !item.value) {
												item.value = {
													en: e.currentTarget.value,
													sv: typeof item.value === 'string' ? item.value : ''
												};
											} else {
												item.value.en = e.currentTarget.value;
											}
										}}
										placeholder="Details (EN)"
										class="border-slate-300 bg-white"
									/>
								</div>
							</div>
						{/if}
					{/each}
					<Button variant="outline" size="sm" onclick={addItem}>+ Add Education</Button>
				</div>
			{:else}
				<!-- Fallback for generic lists -->
				<label class="mb-1 block text-sm font-medium text-slate-700">Items</label>
				<div class="space-y-2">
					{#each editingBlock.items as item, index}
						{#if typeof item === 'string'}
							<div class="flex gap-2">
								<Input
									bind:value={editingBlock.items[index]}
									class="flex-1 border-slate-300 bg-white"
								/>
								<Button variant="ghost" size="sm" onclick={() => removeItem(index)}>Remove</Button>
							</div>
						{/if}
					{/each}
					<Button variant="outline" size="sm" onclick={addItem}>+ Add Item</Button>
				</div>
			{/if}
		</div>
	</section>
{:else if !shouldHide}
	<section class="resume-print-section mb-6">
		<ResumeSectionRow
			label={category.text}
			skipFirstColumn={isTechniqueOrMethod || isPortfolio || isLanguage || isEducation}
		>
			{#if blockCategory.includes('language') || blockCategory.includes('språk')}
				<div class="flex flex-col gap-1 text-sm text-slate-800">
					{#each block.items as item}
						{#if typeof item === 'string'}
							<p><span class="font-bold">{item}</span></p>
						{:else}
							{@const label = resolveText(item.label)}
							{@const value = resolveText(item.value)}
							<p>
								<span class="font-bold">
									{label.text}
									{#if label.missing}<span class="text-[10px] font-normal text-amber-600"
											>(missing)</span
										>{/if}
								</span>: {value.text || ''}
								{#if value.missing}<span class="text-[10px] text-amber-600">(missing)</span>{/if}
							</p>
						{/if}
					{/each}
				</div>
			{:else if blockCategory.includes('portfolio') || blockCategory.includes('portfölj')}
				<div class="flex flex-wrap gap-2 text-sm text-slate-800">
					{#each block.items as item}
						{#if typeof item === 'string'}
							<a
								href={item}
								target="_blank"
								rel="noopener noreferrer"
								class="underline decoration-slate-400 underline-offset-2 hover:decoration-slate-700"
								>{item}</a
							>
						{:else if item.value}
							{@const val = resolveText(item.value)}
							<a
								href={val.text}
								target="_blank"
								rel="noopener noreferrer"
								class="underline decoration-slate-400 underline-offset-2 hover:decoration-slate-700"
								>{val.text}</a
							>
						{/if}
					{/each}
				</div>
			{:else if blockCategory.includes('education') || blockCategory.includes('utbild')}
				<div class="flex flex-col gap-1 text-sm text-slate-800">
					{#each block.items as item}
						{#if typeof item === 'string'}
							<p>{item}</p>
						{:else}
							{@const label = resolveText(item.label)}
							{@const value = resolveText(item.value)}
							<p>
								<span class="font-semibold">{label.text}</span>
								{#if value.text}<span>: {value.text}</span>{/if}
							</p>
						{/if}
					{/each}
				</div>
			{:else}
				<div class="flex flex-wrap gap-2">
					{#each block.items as item}
						{#if typeof item === 'string'}
							<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800">{item}</span>
						{:else}
							{@const label = resolveText(item.label)}
							{@const value = resolveText(item.value)}
							<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800">
								<span class="font-semibold">{label.text}</span>
								{#if item.value}
									<span>: {value.text}</span>
								{/if}
							</span>
						{/if}
					{/each}
				</div>
			{/if}
		</ResumeSectionRow>
	</section>
{/if}
