<script lang="ts">
        import type { PageData } from '../../../routes/internal/news/$types';

        export type ArticleRow = PageData['articles'][number];

        export let articles: ArticleRow[] = [];
        export let onEdit: (article: ArticleRow) => void;
        export let onDelete: (article: ArticleRow) => void;
</script>

<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
                <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                                <th class="px-4 py-3 font-medium">Title</th>
                                <th class="px-4 py-3 font-medium">Kind</th>
                                <th class="px-4 py-3 font-medium">Status</th>
                                <th class="px-4 py-3 font-medium">Link</th>
                                <th class="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                        {#if articles.length === 0}
                                <tr>
                                        <td class="px-4 py-4 text-center text-sm text-gray-500" colspan="5">
                                                No articles published yet. Use the button above to create one.
                                        </td>
                                </tr>
                        {/if}
                        {#each articles as article}
                                <tr class="hover:bg-gray-50">
                                        <td class="px-4 py-3 text-gray-900">
                                                <div class="font-medium">{article.title}</div>
                                                {#if article.slug}
                                                        <div class="text-xs text-gray-500">/{article.slug}</div>
                                                {/if}
                                        </td>
                                        <td class="px-4 py-3 text-gray-600">{article.kind_name ?? 'Unknown'}</td>
                                        <td class="px-4 py-3">
                                                <span class={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                                                        article.status === 'published'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                        {article.status}
                                                </span>
                                        </td>
                                        <td class="px-4 py-3 text-gray-600">
                                                {#if article.linkedin_url}
                                                        <a href={article.linkedin_url} class="text-gray-900 underline" target="_blank" rel="noreferrer">LinkedIn</a>
                                                {:else if article.slug}
                                                        <span class="text-gray-500">Internal</span>
                                                {:else}
                                                        <span class="text-gray-400">—</span>
                                                {/if}
                                        </td>
                                        <td class="px-4 py-3 text-right">
                                                <div class="flex justify-end gap-2 text-sm">
                                                        <button
                                                                class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
                                                                type="button"
                                                                on:click={() => onEdit(article)}
                                                        >
                                                                Edit
                                                        </button>
                                                        <button
                                                                class="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                                                                type="button"
                                                                on:click={() => onDelete(article)}
                                                        >
                                                                Delete
                                                        </button>
                                                </div>
                                        </td>
                                </tr>
                        {/each}
                </tbody>
        </table>
</div>
