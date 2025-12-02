<script lang="ts">
	import { NewsTable, NewsFormModal } from '$lib/components';
	import { Alert, Button } from '@pixelcode_/blocks/components';

	let { data, form } = $props();

	let isModalOpen = $state(false);
	let activeArticle = $state<(typeof data.articles)[number] | null>(null);
	let modalAction = $state<'create' | 'update'>('create');
	let modalError = $state<string | null>(null);
	// Swap this feedback block with your toast system when available.
	let feedback = $state<{ type: 'success' | 'error'; message: string } | null>(null);
	let deleteForm = $state<HTMLFormElement | null>(null);
	let deleteInput = $state<HTMLInputElement | null>(null);
	let publishForm = $state<HTMLFormElement | null>(null);
	let publishInput = $state<HTMLInputElement | null>(null);
	let publishStatusInput = $state<HTMLInputElement | null>(null);

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

	const handlePublish = (article: (typeof data.articles)[number]) => {
		if (publishInput) {
			publishInput.value = String(article.id);
		}
		if (publishStatusInput) {
			publishStatusInput.value = article.status === 'draft' ? 'published' : article.status;
		}
		publishForm?.requestSubmit();
	};

	$effect(() => {
		if (!form?.type) return;

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
	});
</script>

<div class="flex items-center justify-between">
	<div>
		<h1 class="text-2xl font-semibold text-gray-900">News</h1>
		<p class="text-sm text-gray-700">Publish internal updates or highlight LinkedIn activity.</p>
	</div>
	<Button variant="primary" size="md" type="button" onclick={openCreateModal}>Create post</Button>
</div>

{#if feedback?.message}
	<Alert class="mt-4" variant={feedback.type === 'success' ? 'success' : 'destructive'} size="sm">
		<p class="text-sm font-medium text-gray-900">{feedback.message}</p>
	</Alert>
{/if}

<div class="mt-6">
	<NewsTable
		articles={data.articles}
		onEdit={openEditModal}
		onDelete={handleDelete}
		onPublish={handlePublish}
	/>
</div>

<form method="POST" action="?/delete" class="hidden" bind:this={deleteForm}>
	<input type="hidden" name="id" bind:this={deleteInput} />
</form>

<form method="POST" action="?/publish" class="hidden" bind:this={publishForm}>
	<input type="hidden" name="id" bind:this={publishInput} />
	<input type="hidden" name="status" value="published" bind:this={publishStatusInput} />
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
