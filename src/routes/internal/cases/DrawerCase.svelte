<script lang="ts">
import { Button, FormControl, Input, Select, TextArea } from '@pixelcode_/blocks/components';
import PixelDrawer from '$lib/components/PixelDrawer.svelte';
	import { createEventDispatcher, onDestroy, tick } from 'svelte';
	import Uppy from '@uppy/core';
	import Dashboard from '@uppy/dashboard';
	import XHRUpload from '@uppy/xhr-upload';
	import type { UppyFile } from '@uppy/utils/lib/UppyFile';
	import { loadQuill, type QuillInstance } from '$lib/utils/quillLoader';
	import type { CaseRecord } from '$lib/types';

	const dispatch = createEventDispatcher<{
		close: void;
	}>();

	const uploadEndpoint = '/internal/api/cases/upload';

	let {
		open = $bindable(false),
		caseData = null
	}: {
		open?: boolean;
		caseData?: CaseRecord | null;
	} = $props();

	type AnyUppyFile = UppyFile<Record<string, unknown>, Record<string, unknown>>;
	type ImagePosition = 'left' | 'right';

	let title = $state('');
	let eyebrow = $state('');
	let description = $state('');
	let bullets = $state('');
	let bulletsInput = $state('');
	let img = $state('');
	let imagePosition = $state<'left' | 'right'>('right');
	let bodyHtml = $state('');
	let previewUrl = $state('');
	let feedback = $state<{ type: 'success' | 'error'; message: string } | null>(null);
	let errorMessage = $state<string | null>(null);
	let uploadError = $state<string | null>(null);
	let isSaving = $state(false);
	let isDeleting = $state(false);
	let isUploading = $state(false);

	let quillContainer: HTMLDivElement | null = null;
	let quillEditor: QuillInstance | null = null;

	let createForm: HTMLFormElement | null = null;
	let updateForm: HTMLFormElement | null = null;
	let deleteForm: HTMLFormElement | null = null;

	type UppyInstance = InstanceType<typeof Uppy>;
	let uppy: UppyInstance | null = null;
	let uppyContainer: HTMLDivElement | null = null;
	let tempObjectUrl: string | null = null;

	const normalizedBullets = $derived(() =>
		bulletsInput
			.split('\n')
			.map((entry) => entry.trim())
			.filter(Boolean)
	);

	const showUploader = $derived(() => !previewUrl);

	const resetForm = () => {
		title = '';
		eyebrow = '';
		description = '';
		bullets = '';
		img = '';
		imagePosition = 'right';
		bodyHtml = '';
		feedback = null;
	};
	const applyCaseToForm = (record: CaseRecord | null) => {
		if (!record) {
			resetForm();
			return;
		}

		eyebrow = record.eyebrow ?? '';
		title = record.title ?? '';
		description = record.description ?? '';
		bulletsInput = (record.bullets ?? []).join('\n');
		imagePosition = record.imagePosition ?? 'right';
		img = record.img ?? '';
		previewUrl = record.img ?? '';
		bodyHtml = record.bodyHtml ?? '';
		errorMessage = null;
	};

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

	const destroyQuill = () => {
		if (quillEditor) {
			quillEditor = null;
		}
		if (quillContainer) {
			quillContainer.innerHTML = '';
		}
	};

	const mountQuill = async () => {
		if (!quillContainer) {
			return;
		}

		if (!quillEditor) {
			const QuillConstructor = await loadQuill();
			if (!QuillConstructor) {
				return;
			}

			quillEditor = new QuillConstructor(quillContainer, {
				theme: 'snow',
				placeholder: 'Write the detailed case body…',
				modules: {
					toolbar: [
						[{ header: [1, 2, false] }],
						['bold', 'italic', 'underline', 'strike'],
						[{ list: 'ordered' }, { list: 'bullet' }],
						['link', 'clean']
					]
				}
			});

			quillEditor.on('text-change', () => {
				bodyHtml = quillEditor?.root.innerHTML ?? '';
			});
		}

		const content = bodyHtml || '';

		if (content) {
			quillEditor?.clipboard.dangerouslyPasteHTML(content);
		} else {
			quillEditor?.setText?.('');
		}
	};

	const initializeUppy = () => {
		if (uppy || !uppyContainer) {
			return;
		}

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
			note: 'PNG, JPG up to 10MB'
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
			setPreviewFromLocalFile(file as AnyUppyFile);
			uploadError = null;
		});

		uppy.on('file-removed', () => {
			revokeTempObjectUrl();
			if (!img) {
				previewUrl = '';
			}
		});

		uppy.on('upload', () => {
			isUploading = true;
			uploadError = null;
		});

		uppy.on('upload-error', (_file, error) => {
			isUploading = false;
			uploadError = error?.message ?? 'Upload failed. Please try again.';
		});

		uppy.on('upload-success', (_file, response) => {
			isUploading = false;
			uploadError = null;

			const url = (response?.body as { url?: string })?.url;

			if (!url) {
				uploadError = 'Upload succeeded but no URL was returned.';
				return;
			}

			revokeTempObjectUrl();
			img = url;
			previewUrl = url;
		});

		uppy.on('complete', () => {
			isUploading = false;
		});
	};

	const destroyUppy = () => {
		if (!uppy) {
			return;
		}

		uppy.cancelAll();
		uppy.destroy();
		uppy = null;

		if (uppyContainer) {
			uppyContainer.innerHTML = '';
		}

		revokeTempObjectUrl();
	};

	const handleReplaceImage = () => {
		img = '';
		previewUrl = '';
		uploadError = null;
		revokeTempObjectUrl();
		uppy?.cancelAll();
	};

	const handleSave = () => {
		const trimmedTitle = title.trim();

		if (!trimmedTitle) {
			errorMessage = 'Title is required.';
			return;
		}

		isSaving = true;
		errorMessage = null;

		// Submit the appropriate form
		if (caseData) {
			updateForm?.requestSubmit();
		} else {
			createForm?.requestSubmit();
		}
	};

	const handleDelete = () => {
		if (!caseData) {
			return;
		}

		if (!confirm(`Delete "${caseData.title}"? This action cannot be undone.`)) {
			return;
		}

		isDeleting = true;
		errorMessage = null;

		deleteForm?.requestSubmit();
	};

	let wasOpen = false;

	$effect(() => {
		if (!open) {
			if (wasOpen) {
				dispatch('close');
			}
			wasOpen = false;
			destroyQuill();
			destroyUppy();
			resetForm();
			return;
		}

		wasOpen = true;

		void tick().then(async () => {
			if (!open) return;

			applyCaseToForm(caseData ?? null);

			await mountQuill();
			initializeUppy();
		});
	});

	onDestroy(() => {
		destroyQuill();
		destroyUppy();
	});
</script>

<PixelDrawer
	variant="right"
	bind:open
	title={caseData ? 'Edit case' : 'Create case'}
	subtitle="Manage the structured content and rich body for this case study."
	class="mr-0 w-full max-w-3xl"
	dismissable
>
	<div class="flex flex-1 flex-col gap-6 overflow-y-auto pb-16">
		<FormControl label="Title" required class="gap-2 text-sm">
			<Input
				id="case-title"
				placeholder="E-commerce redesign"
				class="bg-white text-gray-900 placeholder:text-gray-400"
				bind:value={title}
				required
			/>
		</FormControl>

		<FormControl label="Eyebrow" class="gap-2 text-sm">
			<Input
				id="case-eyebrow"
				placeholder="Featured project"
				class="bg-white text-gray-900 placeholder:text-gray-400"
				bind:value={eyebrow}
			/>
		</FormControl>

		<FormControl label="Description" class="gap-2 text-sm">
			<TextArea
				id="case-description"
				rows={3}
				placeholder="High-level summary that appears on the card."
				class="bg-white text-gray-900 placeholder:text-gray-400"
				bind:value={description}
			/>
		</FormControl>

		<div class="grid gap-6 md:grid-cols-2">
			<FormControl label="Image position" class="gap-2 text-sm">
				<Select id="case-image-position" class="bg-white text-gray-900" bind:value={imagePosition}>
					<option value="right">Image on the right</option>
					<option value="left">Image on the left</option>
				</Select>
				<p class="text-xs text-gray-500">Choose how the media is aligned inside the card.</p>
			</FormControl>

			<FormControl label="Case image" class="gap-2 text-sm" tag="div">
				<div class="flex flex-col gap-3">
					{#if previewUrl}
						<div class="flex flex-col gap-3">
							<div class="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
								<img
									src={previewUrl}
									alt="Case preview"
									class="aspect-square w-full object-cover"
								/>
							</div>

							<div class="flex flex-wrap items-center gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									class="border-gray-300 text-gray-700 hover:bg-gray-50"
									onclick={handleReplaceImage}
									disabled={isUploading}
								>
									Replace
								</Button>
							</div>
						</div>
					{/if}

					<div
						class:hidden={!showUploader}
						class="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-1.5"
					>
						<div bind:this={uppyContainer} class="uppy-container h-44 w-full"></div>
					</div>

					{#if uploadError}
						<p class="text-xs text-red-600">{uploadError}</p>
					{/if}
					{#if isUploading}
						<p class="text-xs text-gray-600">Uploading…</p>
					{/if}

					{#if !previewUrl}
						<p class="text-xs text-gray-500">PNG, JPG up to 10MB</p>
					{/if}
				</div>
			</FormControl>
		</div>

		<FormControl label="Bullets" class="gap-2 text-sm">
			<TextArea
				id="case-bullets"
				rows={4}
				class="bg-white text-gray-900 placeholder:text-gray-400"
				placeholder="Rapid checkout experience
Global content launch
Mobile-first design"
				bind:value={bulletsInput}
			/>
			<p class="text-xs text-gray-500">Enter one bullet per line to highlight key results.</p>
		</FormControl>

		<FormControl label="Body" class="gap-2 text-sm">
			<div
				class="min-h-[14rem] rounded-lg border border-gray-200 bg-white"
				bind:this={quillContainer}
			></div>
			<p class="text-xs text-gray-500">
				This rich text appears beneath the summary on the public case page.
			</p>
		</FormControl>

		{#if errorMessage}
			<div class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
				{errorMessage}
			</div>
		{/if}

		<div
			class="mt-auto flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between"
		>
			{#if caseData}
				<Button
					type="button"
					variant="ghost"
					class="justify-center text-red-600 hover:bg-red-50"
					onclick={handleDelete}
					disabled={isSaving || isDeleting}
				>
					{#if isDeleting}
						Deleting…
					{:else}
						Delete case
					{/if}
				</Button>
			{/if}

			<div class="flex flex-1 justify-end gap-2 sm:justify-end">
				<Button
					type="button"
					variant="outline"
					class="border-gray-300 text-gray-700 hover:bg-gray-50"
					onclick={() => (open = false)}
					disabled={isSaving}
				>
					Cancel
				</Button>
				<Button
					type="button"
					variant="primary"
					class="min-w-[8rem] justify-center"
					onclick={handleSave}
					disabled={isSaving || isUploading}
				>
					{#if isSaving}
						Saving…
					{:else if caseData}
						Save changes
					{:else}
						Create case
					{/if}
				</Button>
			</div>
		</div>
		</div>
</PixelDrawer>

<!-- Hidden forms for server actions -->
<form method="POST" action="?/create" class="hidden" bind:this={createForm}>
	<input type="hidden" name="title" bind:value={title} />
	<input type="hidden" name="eyebrow" bind:value={eyebrow} />
	<input type="hidden" name="description" bind:value={description} />
	<input type="hidden" name="bullets" bind:value={bulletsInput} />
	<input type="hidden" name="img" bind:value={img} />
	<input type="hidden" name="imagePosition" bind:value={imagePosition} />
	<input type="hidden" name="bodyHtml" bind:value={bodyHtml} />
</form>

<form method="POST" action="?/update" class="hidden" bind:this={updateForm}>
	<input type="hidden" name="id" value={caseData?.id ?? ''} />
	<input type="hidden" name="title" bind:value={title} />
	<input type="hidden" name="eyebrow" bind:value={eyebrow} />
	<input type="hidden" name="description" bind:value={description} />
	<input type="hidden" name="bullets" bind:value={bulletsInput} />
	<input type="hidden" name="img" bind:value={img} />
	<input type="hidden" name="imagePosition" bind:value={imagePosition} />
	<input type="hidden" name="bodyHtml" bind:value={bodyHtml} />
</form>

<form method="POST" action="?/delete" class="hidden" bind:this={deleteForm}>
	<input type="hidden" name="id" value={caseData?.id ?? ''} />
</form>

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

	/* Quill editor text color */
	:global(.ql-editor) {
		color: rgb(17 24 39) !important; /* text-gray-900 */
	}

	:global(.ql-editor.ql-blank::before) {
		color: rgb(156 163 175) !important; /* text-gray-400 for placeholder */
	}
</style>
