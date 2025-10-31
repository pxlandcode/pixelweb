<script lang="ts">
	import { Alert, Button, Drawer, FormControl, Input, Select, TextArea } from '@pixelcode_/blocks/components';
	import { createEventDispatcher } from 'svelte';
	import type { PageData } from '../../../routes/internal/news/$types';

	type Article = PageData['articles'][number] | null;
	type Kind = PageData['kinds'][number];

	const dispatch = createEventDispatcher<{ close: void }>();

	let {
		open = $bindable(false),
		article = null,
		kinds = [],
		action = 'create',
		submitting = false,
		errorMessage = null
	} = $props<{
		open?: boolean;
		article?: Article | null;
		kinds?: Kind[];
		action?: 'create' | 'update';
		submitting?: boolean;
		errorMessage?: string | null;
	}>();

	const modalTitle = $derived(article ? 'Edit article' : 'Create article');
	const submitLabel = $derived(action === 'update' ? 'Save changes' : 'Create article');

	const toLocalDatetimeValue = (value: string | null | undefined) => {
		if (!value) return '';

		const date = new Date(value);

		if (Number.isNaN(date.getTime())) {
			return '';
		}

		const pad = (v: number) => v.toString().padStart(2, '0');

		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
			date.getMinutes()
		)}`;
	};

	const close = () => {
		open = false;
	};

	let previousOpen = $state(open);

	$effect(() => {
		if (previousOpen && !open) {
			dispatch('close');
		}

		previousOpen = open;
	});
</script>

<Drawer
	variant="right"
	bind:open
	title={modalTitle}
	subtitle="Publish an internal article or link out to LinkedIn. Provide either a slug or a LinkedIn URL."
	class="mr-0 w-full max-w-2xl"
	dismissable
>
	<form method="POST" action={`?/${action}`} class="flex flex-1 flex-col gap-6 overflow-y-auto pb-16">
		{#if article}
			<input type="hidden" name="id" value={article.id} />
		{/if}

		<div class="grid gap-6 md:grid-cols-2">
			<FormControl label="Title" required class="gap-2 text-sm">
				<Input
					id="title"
					name="title"
					required
					value={article?.title ?? ''}
					placeholder="Autumn product launch roundup"
					class="bg-white text-gray-900 placeholder:text-gray-400"
				/>
			</FormControl>

			<FormControl label="Status" required class="gap-2 text-sm">
				<Select
					id="status"
					name="status"
					value={article?.status ?? 'draft'}
					class="bg-white text-gray-900"
				>
					<option value="draft">Draft</option>
					<option value="published">Published</option>
				</Select>
			</FormControl>
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			<FormControl label="Kind" required class="gap-2 text-sm">
				<Select
					id="kind_id"
					name="kind_id"
					required
					value={article?.kind_id ? String(article.kind_id) : ''}
					class="bg-white text-gray-900"
				>
					<option value="">Select kind…</option>
					{#each kinds as kind}
						<option value={String(kind.id)}>{kind.name}</option>
					{/each}
				</Select>
			</FormControl>

			<FormControl label="Cover image URL" class="gap-2 text-sm" bl="Optional. Provide a full URL.">
				<Input
					id="cover_image"
					name="cover_image"
					type="url"
					value={article?.cover_image ?? ''}
					placeholder="https://cdn.pixel.com/news/cover.jpg"
					class="bg-white text-gray-900 placeholder:text-gray-400"
				/>
			</FormControl>
		</div>

		<FormControl label="Content" class="gap-2 text-sm" bl="Leave empty for LinkedIn-only announcements.">
			<TextArea
				id="content"
				name="content"
				rows={6}
				value={article?.content ?? ''}
				class="bg-white text-gray-900 placeholder:text-gray-400"
			/>
		</FormControl>

		<div class="grid gap-6 md:grid-cols-2">
			<FormControl label="Slug" class="gap-2 text-sm" bl="Shown on internal CMS routes.">
				<Input
					id="slug"
					name="slug"
					value={article?.slug ?? ''}
					placeholder="internal-update"
					class="bg-white text-gray-900 placeholder:text-gray-400"
				/>
			</FormControl>

			<FormControl label="LinkedIn URL" class="gap-2 text-sm" bl="Leave empty when using a slug.">
				<Input
					id="linkedin_url"
					name="linkedin_url"
					type="url"
					value={article?.linkedin_url ?? ''}
					placeholder="https://www.linkedin.com/posts/..."
					class="bg-white text-gray-900 placeholder:text-gray-400"
				/>
			</FormControl>
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			<FormControl
				label="Publish at"
				class="gap-2 text-sm"
				bl="Optional. Use local time, format YYYY-MM-DDTHH:MM."
			>
				<Input
					id="published_at"
					name="published_at"
					type="datetime-local"
					value={toLocalDatetimeValue(article?.published_at)}
					class="bg-white text-gray-900"
				/>
			</FormControl>
		</div>

		{#if errorMessage}
			<Alert variant="destructive" size="sm">
				<p class="text-sm font-medium text-gray-900">{errorMessage}</p>
			</Alert>
		{/if}

		<div class="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-gray-200 bg-white pt-4">
			<Button
				type="button"
				variant="outline"
				class="border-gray-300 text-gray-700 hover:bg-gray-50"
				on:click={close}
			>
				Cancel
			</Button>
			<Button
				type="submit"
				variant="primary"
				class="bg-gray-900 text-white hover:bg-gray-800"
				loading={submitting}
				loading-text="Saving…"
			>
				{submitting ? 'Saving…' : submitLabel}
			</Button>
		</div>
	</form>
</Drawer>
