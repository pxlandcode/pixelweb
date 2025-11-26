<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { loadQuill, type QuillInstance } from '$lib/utils/quillLoader';

	let {
		content = $bindable(''),
		placeholder = 'Write something...',
		toolbarOptions = [
			['bold', 'italic', 'underline', 'blockquote'],
			[{ list: 'ordered' }, { list: 'bullet' }],
			['clean']
		]
	} = $props<{
		content?: string;
		placeholder?: string;
		toolbarOptions?: unknown[];
	}>();

	let quillContainer: HTMLDivElement | null = null;
	let quillEditor: QuillInstance | null = null;

	const destroyQuill = () => {
		if (quillEditor) {
			quillEditor = null;
		}
		if (quillContainer) {
			quillContainer.innerHTML = '';
		}
	};

	const mountQuill = async () => {
		if (!quillContainer) return;
		if (quillEditor) return;

		const QuillConstructor = await loadQuill();
		if (!QuillConstructor) return;

		quillEditor = new QuillConstructor(quillContainer, {
			theme: 'snow',
			placeholder,
			modules: {
				toolbar: toolbarOptions
			}
		});

		// Initial content
		if (content) {
			quillEditor.clipboard.dangerouslyPasteHTML(content);
		}

		// Listen for changes
		quillEditor.on('text-change', () => {
			content = quillEditor?.root.innerHTML ?? '';
		});
	};

	$effect(() => {
		if (quillEditor && content !== quillEditor.root.innerHTML) {
			// Only update if the content is significantly different to avoid cursor jumping
			// This is a simple check, might need more robust handling for complex scenarios
			// but for now we trust the editor's internal state for local edits.
			// Actually, syncing back from prop to editor while editing is tricky.
			// We'll assume one-way binding for now (editor -> prop) is primary during edit.
			// If we need to reset from outside, we might need a key or a method.
			// For this simple use case, we'll just check if it's empty in editor but not in prop (initial load)
			if (quillEditor.root.innerHTML === '<p><br></p>' && content) {
				quillEditor.clipboard.dangerouslyPasteHTML(content);
			}
		}
	});

	onMount(() => {
		mountQuill();
	});

	onDestroy(() => {
		destroyQuill();
	});
</script>

<div class="quill-wrapper">
	<div bind:this={quillContainer} class="bg-white text-slate-900"></div>
</div>

<style>
	/* Quill editor text color override if needed */
	:global(.ql-editor) {
		color: rgb(15 23 42) !important; /* text-slate-900 */
		min-height: 100px;
	}
	:global(.ql-toolbar) {
		border-top-left-radius: 0.375rem;
		border-top-right-radius: 0.375rem;
		border-color: #e2e8f0 !important;
	}
	:global(.ql-container) {
		border-bottom-left-radius: 0.375rem;
		border-bottom-right-radius: 0.375rem;
		border-color: #e2e8f0 !important;
	}
	:global(.ql-editor blockquote) {
		border-left-width: 2px;
		border-color: rgb(251 146 60) !important; /* orange-400 */
		padding-left: 0.75rem; /* pl-3 */
		font-size: 0.875rem; /* text-sm */
		color: rgb(51 65 85) !important; /* text-slate-700 */
		font-style: italic;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
		position: relative;
	}
	:global(.ql-editor blockquote::before) {
		content: '"';
	}
	:global(.ql-editor blockquote::after) {
		content: '"';
	}
</style>
