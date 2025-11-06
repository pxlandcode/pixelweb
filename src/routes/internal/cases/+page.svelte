<script lang="ts">
	import { Button, Alert } from '@pixelcode_/blocks/components';
	import DrawerCase from './DrawerCase.svelte';
	import type { CaseRecord } from '$lib/types';

	let { data, form } = $props();

	let feedback = $state<{ type: 'success' | 'error'; message: string } | null>(null);

	let drawerOpen = $state(false);
	let activeCase = $state<CaseRecord | null>(null);
	let draggedItem = $state<CaseRecord | null>(null);
	let dragOverIndex = $state<number | null>(null);

	// Debug: Log the cases data to see what we're getting
	$effect(() => {
		console.log('Cases data:', data.cases);
		console.log('Main page cases:', mainPageCases);
	});

	// Separate main page cases and all cases
	const mainPageCases = $derived(
		data.cases
			.filter((c) => {
				console.log('Case:', c.title, 'showOnMainPage:', c.showOnMainPage, 'status:', c.status);
				return c.showOnMainPage && c.status === 'published';
			})
			.sort((a, b) => a.displayOrder - b.displayOrder)
	);

	const allCases = $derived(
		data.cases.sort((a, b) => {
			const dateA = new Date(a.created_at || 0).getTime();
			const dateB = new Date(b.created_at || 0).getTime();
			return dateB - dateA; // newest first
		})
	);

	const openCreateDrawer = () => {
		feedback = null;
		activeCase = null;
		drawerOpen = true;
	};

	const openEditDrawer = (record: CaseRecord) => {
		feedback = null;
		activeCase = record;
		drawerOpen = true;
	};

	const handleDrawerClose = () => {
		activeCase = null;
	};

	const handleDragStart = (e: DragEvent, item: CaseRecord) => {
		draggedItem = item;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
		}
	};

	const handleDragOver = (e: DragEvent, index: number) => {
		e.preventDefault();
		dragOverIndex = index;
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
	};

	const handleDragLeave = () => {
		dragOverIndex = null;
	};

	const handleDrop = async (e: DragEvent, targetItem: CaseRecord, targetIndex: number) => {
		e.preventDefault();
		dragOverIndex = null;

		if (!draggedItem || draggedItem.id === targetItem.id) {
			draggedItem = null;
			return;
		}

		// Reorder logic: update display orders
		const reordered = [...mainPageCases];
		const draggedIndex = reordered.findIndex((c) => c.id === draggedItem!.id);

		if (draggedIndex === -1) return;

		// Remove dragged item and insert at new position
		const [removed] = reordered.splice(draggedIndex, 1);
		reordered.splice(targetIndex, 0, removed);

		// Update display orders for all affected items
		const updates = reordered.map((item, idx) => ({
			id: item.id,
			displayOrder: idx + 1
		}));

		// Send updates to server
		try {
			const response = await fetch('?/reorder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({ updates: JSON.stringify(updates) })
			});

			if (!response.ok) {
				feedback = { type: 'error', message: 'Failed to reorder cases' };
			} else {
				// Refresh page data
				window.location.reload();
			}
		} catch (error) {
			console.error('Reorder error:', error);
			feedback = { type: 'error', message: 'Failed to reorder cases' };
		}

		draggedItem = null;
	};

	const handleDragEnd = () => {
		draggedItem = null;
		dragOverIndex = null;
	};

	const handleToggleMainPage = async (caseItem: CaseRecord) => {
		const formData = new FormData();
		formData.append('id', caseItem.id);
		formData.append('showOnMainPage', (!caseItem.showOnMainPage).toString());

		try {
			const response = await fetch('?/toggleMainPage', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				window.location.reload();
			}
		} catch (error) {
			console.error('Toggle error:', error);
			feedback = { type: 'error', message: 'Failed to toggle main page visibility' };
		}
	};

	const handleToggleStatus = async (caseItem: CaseRecord) => {
		const formData = new FormData();
		formData.append('id', caseItem.id);
		formData.append('status', caseItem.status === 'draft' ? 'published' : 'draft');

		try {
			const response = await fetch('?/toggleStatus', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				window.location.reload();
			}
		} catch (error) {
			console.error('Toggle status error:', error);
			feedback = { type: 'error', message: 'Failed to toggle status' };
		}
	};

	$effect(() => {
		if (!form?.type) return;

		feedback = {
			type: form.ok ? 'success' : 'error',
			message: form.message ?? ''
		};

		if (form.ok) {
			drawerOpen = false;
			activeCase = null;
		}
	});
</script>

<div class="flex items-center justify-between">
	<div>
		<h1 class="text-2xl font-semibold text-gray-900">Cases</h1>
		<p class="text-sm text-gray-600">
			Create and edit case studies that appear on the public site.
		</p>
	</div>
	<Button variant="primary" size="md" type="button" onclick={openCreateDrawer}>Create case</Button>
</div>

{#if feedback}
	<Alert class="mt-4" variant={feedback.type === 'success' ? 'success' : 'destructive'} size="sm">
		<p class="text-sm font-medium text-gray-900">{feedback.message}</p>
	</Alert>
{/if}

<!-- Main Page Cases Section -->
<section class="mt-8">
	<div class="mb-4">
		<h2 class="text-lg font-semibold text-gray-900">Main Page Cardstack</h2>
		<p class="text-sm text-gray-600">
			Drag to reorder. Only published cases shown on main page appear here.
		</p>
	</div>

	{#if mainPageCases.length === 0}
		<div class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
			<p class="text-sm text-gray-600">No cases are currently shown on the main page.</p>
			<p class="mt-1 text-xs text-gray-500">
				Edit a case and enable "Show on main page" to add it here.
			</p>
		</div>
	{:else}
		<ul class="space-y-2">
			{#each mainPageCases as caseItem, index (caseItem.id)}
				<li
					draggable="true"
					ondragstart={(e) => handleDragStart(e, caseItem)}
					ondragover={(e) => handleDragOver(e, index)}
					ondragleave={handleDragLeave}
					ondrop={(e) => handleDrop(e, caseItem, index)}
					ondragend={handleDragEnd}
					class="flex cursor-move items-center gap-4 rounded-lg border bg-white p-4 transition-all hover:shadow-md"
					class:border-primary={dragOverIndex === index}
					class:opacity-50={draggedItem?.id === caseItem.id}
					class:border-gray-200={dragOverIndex !== index}
				>
					<div
						class="flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-sm font-semibold text-gray-600"
					>
						{index + 1}
					</div>
					<div class="flex-1">
						{#if caseItem.eyebrow}
							<p class="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
								{caseItem.eyebrow}
							</p>
						{/if}
						<p class="font-semibold text-gray-900">{caseItem.title}</p>
						{#if caseItem.description}
							<p class="mt-1 line-clamp-1 text-sm text-gray-600">{caseItem.description}</p>
						{/if}
					</div>
					<div class="flex items-center gap-2">
						<span
							class="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
						>
							Published
						</span>
						<Button
							variant="outline"
							size="sm"
							class="border-gray-300 text-gray-700 hover:bg-gray-50"
							type="button"
							onclick={() => openEditDrawer(caseItem)}
						>
							Edit
						</Button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<!-- All Cases Table Section -->
<section class="mt-12">
	<div class="mb-4">
		<h2 class="text-lg font-semibold text-gray-900">All Cases</h2>
		<p class="text-sm text-gray-600">
			Manage all case studies including drafts and published content.
		</p>
	</div>

	<div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
		{#if !allCases.length}
			<div class="p-6 text-sm text-gray-500">
				No cases have been created yet. Start by creating one above.
			</div>
		{:else}
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							class="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase"
						>
							Case
						</th>
						<th
							class="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase"
						>
							Status
						</th>
						<th
							class="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase"
						>
							Main Page
						</th>
						<th
							class="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase"
						>
							Order
						</th>
						<th
							class="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-700 uppercase"
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each allCases as caseItem (caseItem.id)}
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-4">
								<div>
									{#if caseItem.eyebrow}
										<p class="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
											{caseItem.eyebrow}
										</p>
									{/if}
									<p class="font-medium text-gray-900">{caseItem.title}</p>
									{#if caseItem.description}
										<p class="mt-1 line-clamp-2 text-sm text-gray-600">{caseItem.description}</p>
									{/if}
								</div>
							</td>
							<td class="px-4 py-4">
								<span
									class="rounded-full px-2.5 py-1 text-xs font-medium"
									class:bg-emerald-100={caseItem.status === 'published'}
									class:text-emerald-700={caseItem.status === 'published'}
									class:bg-gray-100={caseItem.status === 'draft'}
									class:text-gray-700={caseItem.status === 'draft'}
								>
									{caseItem.status === 'published' ? 'Published' : 'Draft'}
								</span>
							</td>
							<td class="px-4 py-4">
								<button
									type="button"
									onclick={() => handleToggleMainPage(caseItem)}
									class="flex items-center gap-1.5 text-sm"
									disabled={caseItem.status !== 'published'}
								>
									<input
										type="checkbox"
										checked={caseItem.showOnMainPage}
										disabled={caseItem.status !== 'published'}
										class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
									/>
									<span class="text-gray-700" class:opacity-50={caseItem.status !== 'published'}>
										{caseItem.showOnMainPage ? 'Visible' : 'Hidden'}
									</span>
								</button>
							</td>
							<td class="px-4 py-4">
								<span class="text-sm text-gray-600">
									{caseItem.displayOrder}
								</span>
							</td>
							<td class="px-4 py-4">
								<div class="flex items-center justify-end gap-2">
									{#if caseItem.status === 'draft'}
										<Button
											variant="primary"
											size="sm"
											class="bg-emerald-500 text-white hover:bg-emerald-600"
											type="button"
											onclick={() => handleToggleStatus(caseItem)}
										>
											Publish
										</Button>
									{:else}
										<Button
											variant="outline"
											size="sm"
											class="border-gray-300 text-gray-700 hover:bg-gray-50"
											type="button"
											onclick={() => handleToggleStatus(caseItem)}
										>
											Unpublish
										</Button>
									{/if}
									<Button
										variant="outline"
										size="sm"
										class="border-gray-300 text-gray-700 hover:bg-gray-50"
										type="button"
										onclick={() => openEditDrawer(caseItem)}
									>
										Edit
									</Button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</section>

<DrawerCase bind:open={drawerOpen} caseData={activeCase} on:close={handleDrawerClose} />

<style>
	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
