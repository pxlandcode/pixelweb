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
		onToggleVisibility
	} = $props<{
		block: Extract<ResumeBlock, { type: 'experience_item' }>;
		isEditing?: boolean;
		onMove?: (direction: 'up' | 'down') => void;
		onRemove?: () => void;
		onToggleVisibility?: () => void;
	}>();

	let editingBlock = $state(block);

	$effect(() => {
		editingBlock = block;
	});

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
				<FormControl label="Location (Optional)">
					<Input
						bind:value={editingBlock.location}
						placeholder="City, Country"
						class="border-slate-300 bg-white text-slate-900"
					/>
				</FormControl>
			</div>

			<FormControl label="Role">
				<Input bind:value={editingBlock.role} class="border-slate-300 bg-white text-slate-900" />
			</FormControl>

			<div>
				<label class="mb-1 block text-sm font-medium text-slate-700">Description</label>
				<div class="rounded-md border border-slate-300 bg-white">
					<QuillEditor bind:content={editingBlock.description} />
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
		<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
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
					<p class="text-sm text-slate-700">{editingBlock.location}</p>
				{/if}
			</div>

			<!-- Column 3: Role, Description, Technologies -->
			<div class="space-y-3">
				<h3 class="text-base font-bold break-words hyphens-auto text-slate-900" lang="en">
					{Array.isArray(editingBlock.role) ? editingBlock.role.join(' / ') : editingBlock.role}
				</h3>
				<div class="text-sm leading-relaxed break-words hyphens-auto text-slate-700" lang="en">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html editingBlock.description}
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
