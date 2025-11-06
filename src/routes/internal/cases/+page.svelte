<script lang="ts">
	import { Button, Alert } from '@pixelcode_/blocks/components';
	import DrawerCase from './DrawerCase.svelte';
	import type { CaseRecord } from '$lib/types';

	let { data, form } = $props();

	let feedback = $state<{ type: 'success' | 'error'; message: string } | null>(null);

	let drawerOpen = $state(false);
	let activeCase = $state<CaseRecord | null>(null);

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
		<p class="text-sm text-gray-600">Create and edit case studies that appear on the public site.</p>
	</div>
	<Button variant="primary" size="md" type="button" onclick={openCreateDrawer}>
		Create case
	</Button>
</div>

{#if feedback}
	<Alert class="mt-4" variant={feedback.type === 'success' ? 'success' : 'destructive'} size="sm">
		<p class="text-sm font-medium text-gray-900">{feedback.message}</p>
	</Alert>
{/if}

<div class="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
	{#if !data.cases.length}
		<div class="p-6 text-sm text-gray-500">No cases have been created yet. Start by creating one above.</div>
	{:else}
		<ul class="divide-y divide-gray-200">
			{#each data.cases as record (record.id)}
				<li class="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div class="flex-1">
						{#if record.eyebrow}
							<p class="text-xs font-semibold uppercase tracking-wide text-indigo-600">
								{record.eyebrow}
							</p>
						{/if}
						<p class="text-base font-semibold text-gray-900">{record.title}</p>
						{#if record.description}
							<p class="mt-1 text-sm text-gray-600">{record.description}</p>
						{/if}
					</div>
					<div class="flex shrink-0 items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							class="border-gray-300 text-gray-700 hover:bg-gray-50"
							type="button"
							onclick={() => openEditDrawer(record)}
						>
							Edit
						</Button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<DrawerCase
	bind:open={drawerOpen}
	caseData={activeCase}
	on:close={handleDrawerClose}
/>
