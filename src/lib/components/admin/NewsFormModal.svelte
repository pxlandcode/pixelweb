<script lang="ts">
        import { Alert, Button, Drawer, FormControl, Input, Select, TextArea } from '@pixelcode_/blocks/components';
        import { createEventDispatcher, onDestroy, onMount } from 'svelte';
        import '@uppy/core/dist/style.min.css';
        import '@uppy/dashboard/dist/style.min.css';
        import Uppy from '@uppy/core';
        import Dashboard from '@uppy/dashboard';
        import XHRUpload from '@uppy/xhr-upload';
        import { env } from '$env/dynamic/public';
        import { getSupabaseClient } from '$lib/supabaseClient';
	import type { PageData } from '../../../routes/internal/news/$types';

	type Article = PageData['articles'][number] | null;
	type Kind = PageData['kinds'][number];

        const dispatch = createEventDispatcher<{ close: void }>();

        type UppyMeta = {
                supabasePath?: string;
        };

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

        const supabaseUrl = env.PUBLIC_SUPABASE_URL ?? '';

        const supabase = $state(getSupabaseClient());
        let sessionToken = $state<string | null>(null);
        let authUnsubscribe: (() => void) | null = null;

        type UppyInstance = ReturnType<typeof Uppy>;

        let uppy: UppyInstance | null = null;
        let uppyContainer: HTMLDivElement | null = null;

        let coverImageUrl = $state(article?.cover_image ?? '');
        let previewUrl = $state(coverImageUrl);
        let uploadError = $state<string | null>(null);
        let isUploading = $state(false);
        let copied = $state(false);
        let copyTimeout: ReturnType<typeof setTimeout> | null = null;

        const showUploader = $derived(!previewUrl);

        const base64Encode = (value: string) => {
                return btoa(unescape(encodeURIComponent(value)));
        };

        const ensureSessionToken = async () => {
                if (sessionToken) return sessionToken;

                const { data, error } = await supabase.auth.getSession();

                if (error) {
                        throw error;
                }

                sessionToken = data.session?.access_token ?? null;

                return sessionToken;
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
                uppy?.reset();
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
                if (!uppyContainer) {
                        return;
                }

                if (!supabaseUrl) {
                        uploadError =
                                'Missing PUBLIC_SUPABASE_URL. Please configure the Supabase environment variables to enable uploads.';
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
                        note: 'PNG, JPG, GIF up to 10MB'
                });

                uppy.use(XHRUpload, {
                        limit: 1,
                        formData: false,
                        allowedMetaFields: ['supabasePath'],
                        getUploadParameters: async (file) => {
                                isUploading = true;
                                uploadError = null;

                                const token = await ensureSessionToken();

                                if (!token) {
                                        throw new Error('No Supabase session found. Please sign in again.');
                                }

                                const filePath = `images/${Date.now()}-${file.name}`;
                                (file.meta as UppyMeta).supabasePath = filePath;

                                const metadata = [
                                        ['bucketId', 'news'],
                                        ['objectName', filePath],
                                        ['contentType', file.type || 'application/octet-stream']
                                ]
                                        .map(([key, value]) => `${key} ${base64Encode(value)}`)
                                        .join(',');

                                const createResponse = await fetch(`${supabaseUrl}/storage/v1/upload/resumable`, {
                                        method: 'POST',
                                        headers: {
                                                Authorization: `Bearer ${token}`,
                                                'Tus-Resumable': '1.0.0',
                                                'Upload-Metadata': metadata,
                                                'Upload-Length': `${file.data.size}`,
                                                'x-upsert': 'false'
                                        }
                                });

                                if (!createResponse.ok) {
                                        const message = await createResponse.text();
                                        throw new Error(message || 'Failed to create Supabase upload session.');
                                }

                                const uploadUrl =
                                        createResponse.headers.get('location') ??
                                        createResponse.headers.get('Location');

                                if (!uploadUrl) {
                                        throw new Error('Supabase upload session is missing the upload URL.');
                                }

                                return {
                                        method: 'PATCH',
                                        url: uploadUrl,
                                        headers: {
                                                Authorization: `Bearer ${token}`,
                                                'Tus-Resumable': '1.0.0',
                                                'Upload-Offset': '0',
                                                'Content-Type': 'application/offset+octet-stream'
                                        }
                                };
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

                uppy.on('upload-success', (file) => {
                        isUploading = false;
                        uploadError = null;

                        const path = (file.meta as UppyMeta).supabasePath;

                        if (!path) {
                                return;
                        }

                        coverImageUrl = `${supabaseUrl}/storage/v1/object/public/news/${path}`;
                        previewUrl = coverImageUrl;
                        copied = false;
                });

                uppy.on('complete', () => {
                        isUploading = false;
                });
        };

        onMount(() => {
                let mounted = true;

                ensureSessionToken().catch((error) => {
                        console.error('Failed to resolve Supabase session', error);
                });

                const { data } = supabase.auth.onAuthStateChange((_event, session) => {
                        if (!mounted) return;
                        sessionToken = session?.access_token ?? null;
                });

                if (data?.subscription) {
                        authUnsubscribe = () => {
                                data.subscription.unsubscribe();
                        };
                }

                initializeUppy();

                return () => {
                        mounted = false;
                };
        });

        onDestroy(() => {
                uppy?.close({ reason: 'unmount' });
                authUnsubscribe?.();
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
                        uppy?.reset();

                        lastArticleId = currentArticleId;
                }
        });

        $effect(() => {
                if (!open) {
                        uppy?.reset();
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

                        <FormControl
                                label="Cover image"
                                class="gap-2 text-sm"
                                bl="Upload a new image or keep the existing cover."
                        >
                                <div class="flex flex-col gap-3">
                                        {#if previewUrl}
                                                <div class="flex flex-col gap-3">
                                                        <div class="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                                                <img
                                                                        src={previewUrl}
                                                                        alt="Cover image preview"
                                                                        class="h-48 w-full object-cover"
                                                                />
                                                        </div>

                                                        <div class="flex flex-wrap items-center gap-2">
                                                                <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        class="border-gray-300 text-gray-700 hover:bg-gray-50"
                                                                        on:click={handleReplaceImage}
                                                                        disabled={isUploading}
                                                                >
                                                                        Replace image
                                                                </Button>

                                                                {#if coverImageUrl}
                                                                        <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                class="text-gray-700 hover:bg-gray-100"
                                                                                on:click={copyImageUrl}
                                                                                disabled={isUploading}
                                                                        >
                                                                                Copy image URL
                                                                        </Button>
                                                                {/if}

                                                                {#if copied}
                                                                        <span class="text-xs font-medium text-emerald-600">
                                                                                Copied!
                                                                        </span>
                                                                {/if}
                                                        </div>
                                                </div>
                                        {/if}

                                        <div
                                                class:hidden={!showUploader}
                                                class="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-2"
                                        >
                                                <div bind:this={uppyContainer} class="uppy-container" />
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
                                                        Images are uploaded to Supabase Storage and automatically linked to this
                                                        article.
                                                </p>
                                        {/if}
                                </div>

                                <input type="hidden" id="cover_image" name="cover_image" value={coverImageUrl} />
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
