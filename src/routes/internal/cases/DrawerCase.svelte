<script lang="ts">
        import {
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
        import { loadQuill, type QuillInstance } from '$lib/utils/quillLoader';
        import type { CaseRecord } from '$lib/types';
        import { createCase, deleteCase, updateCase } from '$lib/services/api/caseService';

        const dispatch = createEventDispatcher<{
                close: void;
                saved: CaseRecord;
                deleted: string;
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

        let eyebrow = $state('');
        let title = $state('');
        let description = $state('');
        let bulletsInput = $state('');
        let imagePosition = $state<ImagePosition>('right');
        let img = $state('');
        let previewUrl = $state('');
        let bodyHtml = $state('');

        let errorMessage = $state<string | null>(null);
        let uploadError = $state<string | null>(null);
        let isSaving = $state(false);
        let isDeleting = $state(false);
        let isUploading = $state(false);

        let quillContainer: HTMLDivElement | null = null;
        let quillEditor: QuillInstance | null = null;

        type UppyInstance = InstanceType<typeof Uppy>;
        let uppy: UppyInstance | null = null;
        let uppyContainer: HTMLDivElement | null = null;
        let tempObjectUrl: string | null = null;

        const normalizedBullets = $derived(
                () =>
                        bulletsInput
                                .split('\n')
                                .map((entry) => entry.trim())
                                .filter(Boolean)
        );

        const showUploader = $derived(() => !previewUrl);

        const resetForm = () => {
                eyebrow = '';
                title = '';
                description = '';
                bulletsInput = '';
                imagePosition = 'right';
                img = '';
                previewUrl = '';
                bodyHtml = '';
                errorMessage = null;
                uploadError = null;
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

        const handleSave = async () => {
                const trimmedTitle = title.trim();
                const trimmedEyebrow = eyebrow.trim();
                const trimmedDescription = description.trim();
                const trimmedBody = bodyHtml.trim();
                const bulletValues = normalizedBullets.length ? normalizedBullets : null;

                if (!trimmedTitle) {
                        errorMessage = 'Title is required.';
                        return;
                }

                isSaving = true;
                errorMessage = null;

                const payload = {
                        eyebrow: trimmedEyebrow || null,
                        title: trimmedTitle,
                        description: trimmedDescription || null,
                        bullets: bulletValues,
                        img: img.trim() || null,
                        imagePosition,
                        bodyHtml: trimmedBody || null
                };

                try {
                        const result = caseData
                                ? await updateCase(caseData.id, payload)
                                : await createCase(payload);

                        if (!result) {
                                errorMessage = 'The case could not be saved. Please try again.';
                                return;
                        }

                        dispatch('saved', result);
                        open = false;
                } catch (error) {
                        console.error('[DrawerCase] Failed to save case', error);
                        errorMessage = error instanceof Error ? error.message : 'Unexpected error while saving the case.';
                } finally {
                        isSaving = false;
                }
        };

        const handleDelete = async () => {
                if (!caseData) {
                        return;
                }

                if (!confirm(`Delete "${caseData.title}"? This action cannot be undone.`)) {
                        return;
                }

                isDeleting = true;
                errorMessage = null;

                try {
                        const success = await deleteCase(caseData.id);

                        if (!success) {
                                errorMessage = 'Failed to delete the case. Please try again.';
                                return;
                        }

                        dispatch('deleted', String(caseData.id));
                        open = false;
                } catch (error) {
                        console.error('[DrawerCase] Failed to delete case', error);
                        errorMessage = error instanceof Error ? error.message : 'Unexpected error while deleting the case.';
                } finally {
                        isDeleting = false;
                }
        };

        const handleDrawerClose = () => {
                dispatch('close');
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

<Drawer
        variant="right"
        bind:open
        title={caseData ? 'Edit case' : 'Create case'}
        subtitle="Manage the structured content and rich body for this case study."
        class="mr-0 w-full max-w-3xl"
        dismissable
        on:close={handleDrawerClose}
>
        <div class="flex flex-1 flex-col gap-6 overflow-y-auto pb-16">
                <div class="grid gap-6 md:grid-cols-2">
                        <FormControl label="Eyebrow" class="gap-2 text-sm">
                                <Input
                                        id="case-eyebrow"
                                        placeholder="Featured project"
                                        class="bg-white text-gray-900 placeholder:text-gray-400"
                                        bind:value={eyebrow}
                                />
                        </FormControl>

                        <FormControl label="Title" required class="gap-2 text-sm">
                                <Input
                                        id="case-title"
                                        placeholder="E-commerce redesign"
                                        class="bg-white text-gray-900 placeholder:text-gray-400"
                                        bind:value={title}
                                        required
                                />
                        </FormControl>
                </div>

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
                                <Select
                                        id="case-image-position"
                                        class="bg-white text-gray-900"
                                        bind:value={imagePosition}
                                >
                                        <option value="right">Image on the right</option>
                                        <option value="left">Image on the left</option>
                                </Select>
                                <p class="text-xs text-gray-500">Choose how the media is aligned inside the card.</p>
                        </FormControl>

                        <FormControl label="Bullets" class="gap-2 text-sm">
                                <TextArea
                                        id="case-bullets"
                                        rows={5}
                                        class="bg-white text-gray-900 placeholder:text-gray-400"
                                        placeholder="Rapid checkout experience\nGlobal content launch"
                                        bind:value={bulletsInput}
                                />
                                <p class="text-xs text-gray-500">Enter one bullet per line to highlight key results.</p>
                        </FormControl>
                </div>

                <FormControl label="Body" class="gap-2 text-sm">
                        <div
                                class="min-h-[14rem] rounded-lg border border-gray-200 bg-white"
                                bind:this={quillContainer}
                        />
                        <p class="text-xs text-gray-500">This rich text appears beneath the summary on the public case page.</p>
                </FormControl>

                <FormControl label="Image" class="gap-2 text-sm" tag="div">
                        <div class="flex flex-col gap-3">
                                {#if previewUrl}
                                        <div class="flex flex-col gap-3">
                                                <div class="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                                        <img src={previewUrl} alt="Case image preview" class="aspect-video w-full object-cover" />
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
                                                        {#if img}
                                                                <span class="text-xs text-gray-500">Using stored image.</span>
                                                        {/if}
                                                </div>
                                        </div>
                                {/if}

                                <div class:hidden={!showUploader} class="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-1.5">
                                        <div bind:this={uppyContainer} class="uppy-container h-44 w-full" />
                                </div>

                                {#if uploadError}
                                        <p class="text-sm text-red-600">{uploadError}</p>
                                {/if}
                                {#if isUploading}
                                        <p class="text-sm text-gray-500">Uploading image…</p>
                                {/if}
                        </div>
                        <p class="text-xs text-gray-500">Upload an illustrative image to accompany the case.</p>
                </FormControl>

                {#if errorMessage}
                        <div class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {errorMessage}
                        </div>
                {/if}

                <div class="mt-auto flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
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
</Drawer>
