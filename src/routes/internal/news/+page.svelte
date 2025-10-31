<script lang="ts">
        import NewsTable from '$lib/components/admin/NewsTable.svelte';
        import NewsFormModal from '$lib/components/admin/NewsFormModal.svelte';

        let { data, form } = $props();

        let isModalOpen = false;
        let activeArticle: (typeof data.articles)[number] | null = null;
        let modalAction: 'create' | 'update' = 'create';
        let modalError: string | null = null;
        // Swap this feedback block with your toast system when available.
        let feedback: { type: 'success' | 'error'; message: string } | null = null;
        let deleteForm: HTMLFormElement | null = null;
        let deleteInput: HTMLInputElement | null = null;

        const openCreateModal = () => {
                modalAction = 'create';
                activeArticle = null;
                modalError = null;
                isModalOpen = true;
        };

        const openEditModal = (article: (typeof data.articles)[number]) => {
                modalAction = 'update';
                activeArticle = article;
                modalError = null;
                isModalOpen = true;
        };

        const handleDelete = (article: (typeof data.articles)[number]) => {
                if (!confirm(`Delete "${article.title}"? This action cannot be undone.`)) {
                        return;
                }

                if (deleteInput) {
                        deleteInput.value = String(article.id);
                }

                deleteForm?.requestSubmit();
        };

        $: if (form?.type) {
                feedback = {
                        type: form.ok ? 'success' : 'error',
                        message: form.message ?? ''
                };

                if (form.type === 'create' || form.type === 'update') {
                        if (form.ok) {
                                isModalOpen = false;
                                activeArticle = null;
                                modalError = null;
                        } else {
                                modalError = form.message ?? null;
                                isModalOpen = true;
                        }
                }
        }
</script>

<div class="flex items-center justify-between">
        <div>
                <h1 class="text-2xl font-semibold text-gray-900">News</h1>
                <p class="text-sm text-gray-600">Publish internal updates or highlight LinkedIn activity.</p>
        </div>
        <button
                class="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                type="button"
                on:click={openCreateModal}
        >
                Create post
        </button>
</div>

{#if feedback?.message}
        <p
                class={`mt-4 rounded-md px-4 py-3 text-sm ${
                        feedback.type === 'success'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-700'
                }`}
        >
                {feedback.message}
        </p>
{/if}

<div class="mt-6">
        <NewsTable articles={data.articles} onEdit={openEditModal} onDelete={handleDelete} />
</div>

<form method="POST" action="?/delete" class="hidden" bind:this={deleteForm}>
        <input type="hidden" name="id" bind:this={deleteInput} />
</form>

<NewsFormModal
        bind:open={isModalOpen}
        article={activeArticle}
        kinds={data.kinds}
        errorMessage={modalError}
        action={modalAction}
        on:close={() => {
                modalError = null;
        }}
/>
