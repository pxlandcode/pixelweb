<script lang="ts">
	import {
		Button,
		Card,
		Tab,
		TabHandler,
		Icon,
		Toaster,
		toast
	} from '@pixelcode_/blocks/components';
	import { Edit, Save, Download, X } from 'lucide-svelte';
	import ResumePreview from '$lib/components/resumes/ResumePreview.svelte';
	import { resumeStore } from '$lib/stores/resumeStore';
	import type { ResumeBlock } from '$lib/services/resumes';

	let { data } = $props();
	let selectedBlockId = $state<string | null>(null);
	let showEditor = $state(false);
	let isEditing = $state(false);

	const resumeState = resumeStore.state;
	const resumeSummary = resumeStore.summary;
	const blocks = $derived($resumeState.blocks);
	const tabHandler = new TabHandler(['Edit', 'Versions'], { urlName: 'resumeTab' });

	$effect(() => {
		if (data.resume) {
			resumeStore.setResume(data.resume);
			selectedBlockId = data.resume.content[0]?.id ?? null;
		}
	});

	const handleCancel = () => {
		if (confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
			window.location.reload();
		}
	};

	const handleSave = () => {
		isEditing = false;
		toast.success?.('Resume saved!') ?? toast('Resume saved!');
	};

	const createBlock = (type: ResumeBlock['type']): ResumeBlock => {
		switch (type) {
			case 'header':
				return {
					type: 'header',
					name: 'New consultant',
					title: 'Role title',
					summary: 'Add a concise summary for this consultant.',
					contact_people: [{ label: 'Contact', people: [{ name: 'Name', phone: '', email: '' }] }]
				};
			case 'skills_grid':
				return { type: 'skills_grid', title: 'Examples of skills', skills: [], columns: 3 };
			case 'highlighted_experience':
				return {
					type: 'highlighted_experience',
					company: 'Company',
					role: 'Role',
					description: 'Short highlight description.',
					testimonial: '',
					technologies: []
				};
			case 'experience_section':
				return { type: 'experience_section', title: 'Previous Experience' };
			case 'experience_item':
				return {
					type: 'experience_item',
					period: '2024 - ongoing',
					company: 'Company',
					location: '',
					role: 'Role',
					description: 'Detailed description of the assignment.',
					technologies: []
				};
			case 'section_header':
				return { type: 'section_header', title: 'Section title', divider: true };
			case 'skills_categorized':
				return { type: 'skills_categorized', category: 'Category', items: [] };
			case 'multi_column_info':
				return { type: 'multi_column_info', items: [{ label: 'Year', description: 'Detail' }] };
			case 'testimonial':
				return { type: 'testimonial', quote: 'Quote text', source: 'Source name' };
			case 'footer':
				return { type: 'footer', note: 'Footer note', updated_at: '' };
			default:
				return { type: 'section_header', title: 'Section title' } satisfies ResumeBlock;
		}
	};

	const addBlock = (type: ResumeBlock['type']) => {
		resumeStore.updateBlocks((blocks) => [...blocks, createBlock(type)]);
	};

	const selectBlock = (blockId: string | null) => {
		selectedBlockId = blockId;
	};

	$effect(() => {
		if (!blocks.length) return;
		if (!blocks.find((block) => block.id === selectedBlockId)) {
			selectedBlockId = blocks[0]?.id ?? null;
		}
	});
	const availableTypes: { label: string; value: ResumeBlock['type'] }[] = [
		{ label: 'Header', value: 'header' },
		{ label: 'Skills Grid', value: 'skills_grid' },
		{ label: 'Highlighted Experience', value: 'highlighted_experience' },
		{ label: 'Experience Section', value: 'experience_section' },
		{ label: 'Experience Item', value: 'experience_item' },
		{ label: 'Section Header', value: 'section_header' },
		{ label: 'Skills Categorized', value: 'skills_categorized' },
		{ label: 'Multi-Column Info', value: 'multi_column_info' },
		{ label: 'Testimonial', value: 'testimonial' },
		{ label: 'Footer', value: 'footer' }
	];
</script>

<div class="flex items-center justify-between">
	<div>
		<h1 class="text-2xl font-semibold text-gray-50">Resume builder</h1>
		<p class="text-sm text-gray-300">Side-by-side editor with live preview.</p>
	</div>
</div>

<Toaster richColors position="top-center" closeButton />

<!-- Fixed Edit/Save Buttons in Bottom Right -->
<div class="fixed right-6 bottom-6 z-50 flex gap-2 print:hidden">
	{#if isEditing}
		<Button variant="inverted" onclick={handleCancel}>
			<Icon icon={X} size="sm" />
			Cancel
		</Button>
		<Button variant="primary" onclick={handleSave}>
			<Icon icon={Save} size="sm" />
			Save
		</Button>
	{:else}
		<Button variant="inverted" href={`/api/resumes/${data.resume.id}/pdf`}>
			<Icon icon={Download} size="sm" />
			Download
		</Button>
		<Button variant="primary" onclick={() => (isEditing = true)}>
			<Icon icon={Edit} size="sm" />
			Edit
		</Button>
	{/if}
</div>

<div class="mt-6 space-y-4">
	<Tab.Triggers instance={tabHandler} />

	<Tab.View active={tabHandler.activeView === 0} class="flex items-start gap-4">
		<div class="flex-1 space-y-4">
			<Card class="bg-white text-slate-900">
				<div class="mt-4">
					<ResumePreview
						blocks={$resumeState.blocks}
						{isEditing}
						editing={showEditor}
						{selectedBlockId}
						on:editBlock={(event) => selectBlock(event.detail)}
					/>
				</div>
			</Card>
		</div>
	</Tab.View>

	<Tab.View active={tabHandler.activeView === 1} class="mt-4">
		<Card class="flex flex-col gap-3 bg-white text-slate-900">
			<div class="flex items-center justify-between">
				<p class="text-sm font-semibold text-slate-900">Versions</p>
				<Button size="xs" variant="ghost">New version</Button>
			</div>
			<div class="flex flex-col divide-y divide-slate-100">
				{#each data.resume.versions ?? [] as version}
					<div class="flex items-center justify-between py-3">
						<div>
							<p class="text-sm font-semibold text-slate-900">{version.version_name}</p>
							<p class="text-xs text-slate-600">{version.created_at}</p>
						</div>
						<div class="flex items-center gap-2 text-xs text-slate-700">
							{#if version.is_main}<Badge variant="success" size="xs">Main</Badge>{/if}
							{#if !version.is_active}<Badge variant="warning" size="xs">Inactive</Badge>{/if}
							<Button
								size="xs"
								variant="secondary"
								onclick={() => resumeStore.setActiveVersion(version.id)}
							>
								Load
							</Button>
						</div>
					</div>
				{/each}
			</div>
		</Card>
	</Tab.View>
</div>
