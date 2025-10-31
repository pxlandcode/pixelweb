<script lang="ts">
        import { createEventDispatcher } from 'svelte';
        import type { PageData } from '../../../routes/admin/news/$types';

        type Article = PageData['articles'][number] | null;
        type Kind = PageData['kinds'][number];

        const dispatch = createEventDispatcher<{ close: void }>();

        export let open = false;
        export let article: Article = null;
        export let kinds: Kind[] = [];
        export let action = 'create';
        export let submitting = false;
        export let errorMessage: string | null = null;

        $: modalTitle = article ? 'Edit article' : 'Create article';
        $: submitLabel = article ? 'Update article' : 'Create article';
</script>

{#if open}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-8">
                <div class="relative w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
                        <button
                                type="button"
                                class="absolute right-3 top-3 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                                on:click={() => {
                                        open = false;
                                        dispatch('close');
                                }}
                                aria-label="Close"
                        >
                                ×
                        </button>

                        <h2 class="text-lg font-semibold text-gray-900">{modalTitle}</h2>
                        <p class="mt-1 text-sm text-gray-500">
                                Articles may link to LinkedIn posts or internal CMS pages. Provide one of slug or LinkedIn URL per entry.
                        </p>

                        <form method="POST" action={`?/${action}`} class="mt-6 space-y-4">
                                {#if article}
                                        <input type="hidden" name="id" value={article.id} />
                                {/if}

                                <div class="grid gap-4 sm:grid-cols-2">
                                        <div class="space-y-1">
                                                <label class="text-sm font-medium text-gray-700" for="title">Title</label>
                                                <input
                                                        id="title"
                                                        name="title"
                                                        value={article?.title ?? ''}
                                                        required
                                                        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                                />
                                        </div>

                                        <div class="space-y-1">
                                                <label class="text-sm font-medium text-gray-700" for="status">Status</label>
                                                <select
                                                        id="status"
                                                        name="status"
                                                        class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                                        value={article?.status ?? 'draft'}
                                                >
                                                        <option value="draft">Draft</option>
                                                        <option value="published">Published</option>
                                                </select>
                                        </div>
                                </div>

                                <div class="space-y-1">
                                        <label class="text-sm font-medium text-gray-700" for="kind_id">Kind</label>
                                        <select
                                                id="kind_id"
                                                name="kind_id"
                                                required
                                                class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                        >
                                                <option value="" disabled selected={!article?.kind_id}>Select kind</option>
                                                {#each kinds as kind}
                                                        <option value={kind.id} selected={article?.kind_id === kind.id}>{kind.name}</option>
                                                {/each}
                                        </select>
                                </div>

                                <div class="space-y-1">
                                        <label class="text-sm font-medium text-gray-700" for="content">Content</label>
                                        <textarea
                                                id="content"
                                                name="content"
                                                rows="5"
                                                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                        >{article?.content ?? ''}</textarea>
                                        <p class="text-xs text-gray-500">Use this field for internal posts. LinkedIn posts can leave it empty.</p>
                                </div>

                                <div class="grid gap-4 sm:grid-cols-2">
                                        <div class="space-y-1">
                                                <label class="text-sm font-medium text-gray-700" for="slug">Slug</label>
                                                <input
                                                        id="slug"
                                                        name="slug"
                                                        value={article?.slug ?? ''}
                                                        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                                        placeholder="news-updates"
                                                />
                                                <p class="text-xs text-gray-500">Leave empty when linking to LinkedIn.</p>
                                        </div>
                                        <div class="space-y-1">
                                                <label class="text-sm font-medium text-gray-700" for="linkedin_url">LinkedIn URL</label>
                                                <input
                                                        id="linkedin_url"
                                                        name="linkedin_url"
                                                        type="url"
                                                        value={article?.linkedin_url ?? ''}
                                                        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                                        placeholder="https://www.linkedin.com/posts/..."
                                                />
                                                <p class="text-xs text-gray-500">Leave empty when using a slug.</p>
                                        </div>
                                </div>

                                {#if errorMessage}
                                        <p class="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-600">{errorMessage}</p>
                                {/if}

                                <div class="flex justify-end gap-3">
                                        <button
                                                type="button"
                                                class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
                                                on:click={() => {
                                        open = false;
                                        dispatch('close');
                                }}
                                        >
                                                Cancel
                                        </button>
                                        <button
                                                type="submit"
                                                class="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                                                disabled={submitting}
                                        >
                                                {submitting ? 'Saving…' : submitLabel}
                                        </button>
                                </div>
                        </form>
                </div>
        </div>
{/if}
