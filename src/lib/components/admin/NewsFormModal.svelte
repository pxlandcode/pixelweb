<script lang="ts">
	import {
		Alert,
		Button,
		Drawer,
		FormControl,
		Input,
		Select,
		TextArea
	} from '@pixelcode_/blocks/components';
        import { createEventDispatcher, onDestroy, tick } from 'svelte';
	import Uppy from '@uppy/core';
	import Dashboard from '@uppy/dashboard';
	import XHRUpload from '@uppy/xhr-upload';
	import type { UppyFile } from '@uppy/utils/lib/UppyFile';
	import type { PageData } from '../../../routes/internal/news/$types';

	type Article = PageData['articles'][number] | null;
	type Kind = PageData['kinds'][number];
	type AnyUppyFile = UppyFile<Record<string, unknown>, unknown>;

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

	const uploadEndpoint = '/internal/api/news/upload';

	type UppyInstance = InstanceType<typeof Uppy>;

	let uppy: UppyInstance | null = null;
	let uppyContainer: HTMLDivElement | null = null;

	let coverImageUrl = $state(article?.cover_image ?? '');
	let previewUrl = $state(coverImageUrl);
	let uploadError = $state<string | null>(null);
	let isUploading = $state(false);
	let copied = $state(false);
	let copyTimeout: ReturnType<typeof setTimeout> | null = null;
	let tempObjectUrl: string | null = null;

	const showUploader = $derived(!previewUrl);

	const revokeTempObjectUrl = () => {
		if (tempObjectUrl) {
			URL.revokeObjectURL(tempObjectUrl);
			tempObjectUrl = null;
		}
	};

	const setPreviewFromLocalFile = (file: AnyUppyFile) => {
		const blob = file.data as Blob | undefined;
		if (!blob) return;

		revokeTempObjectUrl();
		tempObjectUrl = URL.createObjectURL(blob);
		previewUrl = tempObjectUrl;
	};

	const resetUploaderState = () => {
		if (!uppy) {
			return;
		}

		uppy.cancelAll();
		uppy.resetProgress();
		revokeTempObjectUrl();
	};

	const destroyUppy = () => {
		if (!uppy) {
			return;
		}

		console.log('[NewsFormModal] Destroying Uppy instance');
		uppy.cancelAll();
		uppy.destroy();
		if (uppyContainer) {
			uppyContainer.innerHTML = '';
		}
		uppy = null;
		revokeTempObjectUrl();
	};

	const handleReplaceImage = () => {
		coverImageUrl = '';
		previewUrl = '';
		copied = false;
		if (copyTimeout) {
			clearTimeout(copyTimeout);
			copyTimeout = null;
		}
		uploadError = null;
		isUploading = false;
		resetUploaderState();
	};

	const copyImageUrl = async () => {
		if (!coverImageUrl) return;

		try {
			await navigator.clipboard.writeText(coverImageUrl);
			copied = true;
			if (copyTimeout) {
				clearTimeout(copyTimeout);
			}
			copyTimeout = setTimeout(() => {
				copied = false;
				copyTimeout = null;
			}, 2000);
		} catch (error) {
			console.error('Failed to copy cover image URL', error);
		}
	};

	const initializeUppy = () => {
		if (uppy || !uppyContainer) {
			console.log('[NewsFormModal] Skipping Uppy init', {
				hasInstance: Boolean(uppy),
				hasContainer: Boolean(uppyContainer)
			});
			return;
		}

		console.log('[NewsFormModal] Initializing Uppy', { container: uppyContainer });

		uppy = new Uppy({
			autoProceed: true,
			allowMultipleUploads: false,
			restrictions: {
				maxNumberOfFiles: 1,
				allowedFileTypes: ['image/*']
			}
		});

		uppy.use(Dashboard, {
			target: uppyContainer,
			inline: true,
			proudlyDisplayPoweredByUppy: false,
			showRemoveButtonAfterComplete: true,
			note: 'PNG, JPG, GIF up to 10MB'
		});

		uppy.use(XHRUpload, {
			endpoint: uploadEndpoint,
			fieldName: 'file',
			formData: true,
			withCredentials: true,
			limit: 1,
			allowedMetaFields: []
		});

		uppy.on('file-added', (file) => {
			console.log('[NewsFormModal] Uppy file added', file);
			setPreviewFromLocalFile(file as AnyUppyFile);
		});

		uppy.on('file-removed', (file, reason) => {
			console.log('[NewsFormModal] Uppy file removed', { file, reason });
			revokeTempObjectUrl();
			if (!coverImageUrl) {
				previewUrl = '';
			}
		});

		uppy.on('upload', () => {
			isUploading = true;
			uploadError = null;
			console.log('[NewsFormModal] Upload started');
		});

		uppy.on('upload-error', (_file, error) => {
			isUploading = false;
			uploadError = error?.message ?? 'Upload failed. Please try again.';
			console.error('[NewsFormModal] Upload error', error);
		});

		uppy.on('upload-success', (file, response) => {
			isUploading = false;
			uploadError = null;
			console.log('[NewsFormModal] Upload success', response);

			const url = response?.body?.url as string | undefined;
			const path = response?.body?.path as string | undefined;

			if (!url) {
				console.warn('[NewsFormModal] Upload response missing URL', response);
				uploadError = 'Upload succeeded but no URL was returned.';
				return;
			}

			revokeTempObjectUrl();
			coverImageUrl = url;
			previewUrl = url;
			copied = false;
			console.log('[NewsFormModal] Stored upload info', { url, path, fileName: file.name });
		});

		uppy.on('complete', () => {
			isUploading = false;
			console.log('[NewsFormModal] Upload complete');
		});
	};

	$effect(() => {
		if (open) {
			void (async () => {
				await tick();
				if (!open) {
					console.log('[NewsFormModal] Drawer closed before Uppy init, skipping');
					return;
				}
				if (uppyContainer && !uppy) {
					console.log('[NewsFormModal] Drawer opened, initializing Uppy after tick');
					initializeUppy();
				}
			})();
		} else {
			destroyUppy();
		}
	});

	onDestroy(() => {
		destroyUppy();
		if (copyTimeout) {
			clearTimeout(copyTimeout);
		}
	});

	let lastArticleId = $state(article?.id ?? null);

	$effect(() => {
		const currentArticleId = article?.id ?? null;

		if (currentArticleId !== lastArticleId) {
			coverImageUrl = article?.cover_image ?? '';
			previewUrl = coverImageUrl;
			uploadError = null;
			copied = false;
			if (copyTimeout) {
				clearTimeout(copyTimeout);
				copyTimeout = null;
			}
			isUploading = false;
			resetUploaderState();

			lastArticleId = currentArticleId;
		}
	});

	$effect(() => {
		if (!open) {
			resetUploaderState();
			uploadError = null;
			isUploading = false;
			copied = false;
			if (copyTimeout) {
				clearTimeout(copyTimeout);
				copyTimeout = null;
			}
			coverImageUrl = article?.cover_image ?? '';
			previewUrl = coverImageUrl;
		}
	});

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
	<form
		method="POST"
		action={`?/${action}`}
		class="flex flex-1 flex-col gap-6 overflow-y-auto pb-16"
	>
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

				<FormControl
					label="Cover image"
					class="gap-2 text-sm"
					bl="Upload a new image or keep the existing cover."
					tag="div"
				>
				<div class="flex flex-col gap-3">
					{#if previewUrl}
						<div class="flex flex-col gap-3">
					<div class="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
						<img src={previewUrl} alt="Cover image preview" class="aspect-square w-full object-cover" />
					</div>

							<div class="flex flex-wrap items-center gap-2">
								<Button
									type="button"
									variant="outline"
									class="border-gray-300 text-gray-700 hover:bg-gray-50"
									onclick={handleReplaceImage}
									disabled={isUploading}
								>
									Replace image
								</Button>

								{#if coverImageUrl}
									<Button
										type="button"
										variant="ghost"
										class="text-gray-700 hover:bg-gray-100"
										onclick={copyImageUrl}
										disabled={isUploading}
									>
										Copy image URL
									</Button>
								{/if}

								{#if copied}
									<span class="text-xs font-medium text-emerald-600"> Copied! </span>
								{/if}
							</div>
						</div>
					{/if}

					<div
						class:hidden={!showUploader}
						class="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-1.5"
					>
							<div bind:this={uppyContainer} class="uppy-container h-44 w-full" />
					</div>

					{#if uploadError}
						<Alert variant="destructive" size="sm">
							<p class="text-sm font-medium text-gray-900">{uploadError}</p>
						</Alert>
					{/if}

					{#if isUploading}
						<p class="text-xs font-medium text-gray-600">Uploading…</p>
					{/if}

					{#if !previewUrl}
						<p class="text-xs text-gray-500">
							Images are uploaded to Supabase Storage and automatically linked to this article.
						</p>
					{/if}
				</div>

				<input type="hidden" id="cover_image" name="cover_image" value={coverImageUrl} />
			</FormControl>
		</div>

		<FormControl
			label="Content"
			class="gap-2 text-sm"
			bl="Leave empty for LinkedIn-only announcements."
		>
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

		<div
			class="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-gray-200 bg-white pt-4"
		>
			<Button
				type="button"
				variant="outline"
				class="border-gray-300 text-gray-700 hover:bg-gray-50"
				onclick={close}
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

<style>
	:global(.uppy-container .uppy-Dashboard) {
		height: 100%;
		background: transparent;
		border: none;
		box-shadow: none;
	}

	:global(.uppy-container .uppy-Dashboard-inner) {
		min-height: 180px;
		max-height: 180px;
	}

	:global(.uppy-container .uppy-Dashboard-AddFiles) {
		min-height: 160px;
	}
</style>
