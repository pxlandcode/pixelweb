<script lang="ts">
        import { Button } from '@pixelcode_/blocks/components';
        import { onMount } from 'svelte';
        import DrawerCase from './DrawerCase.svelte';
        import { fetchCases } from '$lib/services/api/caseService';
        import type { CaseRecord } from '$lib/types';

        let cases = $state<CaseRecord[]>([]);
        let isLoading = $state(true);
        let loadError = $state<string | null>(null);
        let feedback = $state<{ type: 'success' | 'error'; message: string } | null>(null);

        let drawerOpen = $state(false);
        let activeCase = $state<CaseRecord | null>(null);

        const loadCases = async () => {
                isLoading = true;
                loadError = null;

                try {
                        const result = await fetchCases();
                        cases = result;
                } catch (error) {
                        console.error('[internal/cases] Failed to load cases', error);
                        loadError = 'We were unable to load the current cases. Please try again later.';
                } finally {
                        isLoading = false;
                }
        };

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

        const handleCaseSaved = (event: CustomEvent<CaseRecord>) => {
                const saved = event.detail;
                const index = cases.findIndex((entry) => String(entry.id) === String(saved.id));

                if (index === -1) {
                        cases = [saved, ...cases];
                } else {
                        cases = [...cases.slice(0, index), saved, ...cases.slice(index + 1)];
                }

                feedback = { type: 'success', message: `Saved “${saved.title}”.` };
                drawerOpen = false;
        };

        const handleCaseDeleted = (event: CustomEvent<string>) => {
                const id = event.detail;
                cases = cases.filter((entry) => String(entry.id) !== id);
                feedback = { type: 'success', message: 'Case deleted.' };
                drawerOpen = false;
        };

        onMount(() => {
                void loadCases();
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
        <div
                class={`mt-4 rounded-md border px-4 py-3 text-sm ${
                        feedback.type === 'success'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-red-200 bg-red-50 text-red-700'
                }`}
        >
                {feedback.message}
        </div>
{/if}

<div class="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {#if isLoading}
                <div class="p-6 text-sm text-gray-500">Loading cases…</div>
        {:else if loadError}
                <div class="p-6 text-sm text-red-600">{loadError}</div>
        {:else if !cases.length}
                <div class="p-6 text-sm text-gray-500">No cases have been created yet. Start by creating one above.</div>
        {:else}
                <ul class="divide-y divide-gray-200">
                        {#each cases as record (record.id)}
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
        on:saved={handleCaseSaved}
        on:deleted={handleCaseDeleted}
        on:close={handleDrawerClose}
/>
