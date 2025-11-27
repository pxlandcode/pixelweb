<script lang="ts">
	import type { ResumeBlock } from '$lib/services/resumes';
	import QuillEditor from '../QuillEditor.svelte';
	import { Button, Input, FormControl } from '@pixelcode_/blocks/components';
	import TechStackSelector from '../TechStackSelector.svelte';

	let {
		block,
		isEditing = false,
		onMove,
		onRemove,
		onToggleVisibility,
		language = 'sv'
	} = $props<{
		block: Extract<ResumeBlock, { type: 'experience_item' }>;
		isEditing?: boolean;
		onMove?: (direction: 'up' | 'down') => void;
		onRemove?: () => void;
		onToggleVisibility?: () => void;
		language?: 'sv' | 'en';
	}>();

	let editingBlock = $state(block);

	$effect(() => {
		editingBlock = block;
	});

	const resolveText = (content: any) => {
		if (!content) return { text: '', missing: false };
		if (typeof content === 'string') return { text: content, missing: false };
		if (content[language]) return { text: content[language], missing: false };
		const other = language === 'sv' ? 'en' : 'sv';
		return { text: content[other] || '', missing: true };
	};

	const roleText = $derived(
		Array.isArray(editingBlock.role)
			? editingBlock.role.map((r) => resolveText(r).text).join(' / ')
			: resolveText(editingBlock.role).text
	);
	const descriptionText = $derived(resolveText(editingBlock.description));
	const locationText = $derived(
		editingBlock.location ? resolveText(editingBlock.location) : { text: '', missing: false }
	);

	function formatDate(dateString: string | null | undefined): string {
		if (!dateString) return 'Present';
		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			console.error('Invalid date string:', dateString);
			return dateString; // Return original string if invalid date
		}
		const month = date.toLocaleDateString('en-US', { month: 'short' });
		const year = date.getFullYear();
		return `${month} ${year}`;
	}
</script>

{#if isEditing}
	<div
		class="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 transition-opacity"
		class:opacity-60={editingBlock.hidden}
	>
		<div class="mb-4 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<h4 class="font-semibold text-slate-700">{editingBlock.company}</h4>
				<button
					class="rounded-full px-2 py-0.5 text-xs font-medium transition-colors"
					class:bg-green-100={!editingBlock.hidden}
					class:text-green-800={!editingBlock.hidden}
					class:bg-slate-200={editingBlock.hidden}
					class:text-slate-600={editingBlock.hidden}
					onclick={() => onToggleVisibility?.()}
				>
					{editingBlock.hidden ? 'Hidden' : 'Visible'}
				</button>
			</div>
			<div class="flex gap-2">
				<Button variant="ghost" size="sm" onclick={() => onMove?.('up')}>↑</Button>
				<Button variant="ghost" size="sm" onclick={() => onMove?.('down')}>↓</Button>
				<Button
					variant="ghost"
					size="sm"
					class="text-red-600 hover:bg-red-50"
					onclick={() => onRemove?.()}
				>
					Remove
				</Button>
			</div>
		</div>

		<div class="space-y-3">
			<div class="grid grid-cols-2 gap-4">
				<FormControl label="Start Date (YYYY-MM-DD)">
					<Input
						bind:value={editingBlock.startDate}
						class="border-slate-300 bg-white text-slate-900"
					/>
				</FormControl>
				<FormControl label="End Date (Optional, YYYY-MM-DD)">
					<Input
						bind:value={editingBlock.endDate}
						placeholder="Leave empty for 'Present'"
						class="border-slate-300 bg-white text-slate-900"
					/>
				</FormControl>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<FormControl label="Company">
					<Input
						bind:value={editingBlock.company}
						class="border-slate-300 bg-white text-slate-900"
					/>
				</FormControl>
				<div class="space-y-2">
					<FormControl label="Location (SV)">
						<Input
							value={typeof editingBlock.location === 'string'
								? editingBlock.location
								: editingBlock.location?.sv}
							oninput={(e) => {
								if (typeof editingBlock.location === 'string' || !editingBlock.location) {
									editingBlock.location = {
										sv: e.currentTarget.value,
										en: typeof editingBlock.location === 'string' ? editingBlock.location : ''
									};
								} else {
									editingBlock.location.sv = e.currentTarget.value;
								}
							}}
							class="border-slate-300 bg-white text-slate-900"
						/>
					</FormControl>
					<FormControl label="Location (EN)">
						<Input
							value={typeof editingBlock.location === 'string'
								? editingBlock.location
								: editingBlock.location?.en}
							oninput={(e) => {
								if (typeof editingBlock.location === 'string' || !editingBlock.location) {
									editingBlock.location = {
										en: e.currentTarget.value,
										sv: typeof editingBlock.location === 'string' ? editingBlock.location : ''
									};
								} else {
									editingBlock.location.en = e.currentTarget.value;
								}
							}}
							class="border-slate-300 bg-white text-slate-900"
						/>
					</FormControl>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<FormControl label="Role (SV)">
					<Input
						value={Array.isArray(editingBlock.role)
							? typeof editingBlock.role[0] === 'string'
								? editingBlock.role[0]
								: editingBlock.role[0]?.sv
							: typeof editingBlock.role === 'string'
								? editingBlock.role
								: editingBlock.role?.sv}
						oninput={(e) => {
							const val = e.currentTarget.value;
							if (Array.isArray(editingBlock.role)) {
								// Simplify array to single object for editing
								const currentEn =
									typeof editingBlock.role[0] === 'string'
										? editingBlock.role[0]
										: editingBlock.role[0]?.en || '';
								editingBlock.role = { sv: val, en: currentEn };
							} else if (typeof editingBlock.role === 'string') {
								editingBlock.role = { sv: val, en: editingBlock.role };
							} else {
								editingBlock.role.sv = val;
							}
						}}
						class="border-slate-300 bg-white text-slate-900"
					/>
				</FormControl>
				<FormControl label="Role (EN)">
					<Input
						value={Array.isArray(editingBlock.role)
							? typeof editingBlock.role[0] === 'string'
								? editingBlock.role[0]
								: editingBlock.role[0]?.en
							: typeof editingBlock.role === 'string'
								? editingBlock.role
								: editingBlock.role?.en}
						oninput={(e) => {
							const val = e.currentTarget.value;
							if (Array.isArray(editingBlock.role)) {
								// Simplify array to single object for editing
								const currentSv =
									typeof editingBlock.role[0] === 'string'
										? editingBlock.role[0]
										: editingBlock.role[0]?.sv || '';
								editingBlock.role = { en: val, sv: currentSv };
							} else if (typeof editingBlock.role === 'string') {
								editingBlock.role = { en: val, sv: editingBlock.role };
							} else {
								editingBlock.role.en = val;
							}
						}}
						class="border-slate-300 bg-white text-slate-900"
					/>
				</FormControl>
			</div>

			<div>
				<label class="mb-1 block text-sm font-medium text-slate-700">Description (SV)</label>
				<div class="rounded-md border border-slate-300 bg-white">
					<QuillEditor
						content={typeof editingBlock.description === 'string'
							? editingBlock.description
							: editingBlock.description.sv}
						onchange={(html) => {
							if (typeof editingBlock.description === 'string') {
								editingBlock.description = { sv: html, en: editingBlock.description };
							} else {
								editingBlock.description.sv = html;
							}
						}}
					/>
				</div>
			</div>
			<div>
				<label class="mb-1 block text-sm font-medium text-slate-700">Description (EN)</label>
				<div class="rounded-md border border-slate-300 bg-white">
					<QuillEditor
						content={typeof editingBlock.description === 'string'
							? editingBlock.description
							: editingBlock.description.en}
						onchange={(html) => {
							if (typeof editingBlock.description === 'string') {
								editingBlock.description = { en: html, sv: editingBlock.description };
							} else {
								editingBlock.description.en = html;
							}
						}}
					/>
				</div>
			</div>

			<div>
				<label class="mb-1 block text-sm font-medium text-slate-700">Technologies</label>
				<TechStackSelector
					bind:value={editingBlock.technologies}
					onchange={(techs) => (editingBlock.technologies = techs)}
				/>
			</div>
		</div>
	</div>
{:else}
	<section class="resume-print-section mb-6">
		<div class="grid-print-experience grid gap-6 md:grid-cols-[15%_15%_1fr]">
			<!-- Column 1: Empty -->
			<div></div>

			<!-- Column 2: Period, Company, Location -->
			<div class="space-y-1">
				<p class="text-sm font-semibold text-slate-900">
					<span class="whitespace-nowrap">{formatDate(editingBlock.startDate)}</span>
					{#if editingBlock.endDate}
						<span> - </span>
						<span class="whitespace-nowrap">{formatDate(editingBlock.endDate)}</span>
					{/if}
				</p>
				<p class="text-sm font-semibold text-slate-900">{editingBlock.company}</p>
				{#if editingBlock.location}
					<p class="text-sm text-slate-700">
						{locationText.text}
						{#if locationText.missing}
							<span class="ml-1 text-[10px] text-amber-600">(missing translation)</span>
						{/if}
					</p>
				{/if}
			</div>

			<!-- Column 3: Role, Description, Technologies -->
			<div class="space-y-3">
				<h3 class="text-base font-bold break-words hyphens-auto text-slate-900" lang="en">
					{roleText}
				</h3>
				<div class="text-sm leading-relaxed break-words hyphens-auto text-slate-700" lang="en">
					{#if descriptionText.missing}
						<div class="mb-2">
							<span
								class="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
							>
								Missing translation
							</span>
						</div>
					{/if}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html descriptionText.text}
				</div>
				{#if editingBlock.technologies.length}
					<div class="flex flex-wrap gap-2">
						{#each editingBlock.technologies as tech}
							<span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800">{tech}</span>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</section>
{/if}
