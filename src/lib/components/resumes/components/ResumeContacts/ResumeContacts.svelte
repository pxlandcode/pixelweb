<script lang="ts">
	import { Button, Input, FormControl } from '@pixelcode_/blocks/components';
	import type { ContactPerson } from '$lib/types/resume';
	import type { Language } from '../utils';

	let {
		contacts = $bindable(),
		isEditing = false,
		language = 'sv',
		onAdd,
		onRemove
	}: {
		contacts: ContactPerson[];
		isEditing?: boolean;
		language?: Language;
		onAdd?: () => void;
		onRemove?: (index: number) => void;
	} = $props();
</script>

{#if isEditing}
	<div class="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
		<p class="text-xs font-semibold tracking-wide text-slate-600 uppercase">Contacts</p>
		{#each contacts as contact, index}
			<div class="space-y-2 rounded border border-slate-200 bg-white p-3">
				<div class="flex justify-end">
					<Button variant="ghost" size="sm" onclick={() => onRemove?.(index)}>Remove</Button>
				</div>
				<FormControl label="Name">
					<Input bind:value={contact.name} class="border-slate-300 bg-white text-slate-900" />
				</FormControl>
				<FormControl label="Phone">
					<Input bind:value={contact.phone} class="border-slate-300 bg-white text-slate-900" />
				</FormControl>
				<FormControl label="Email">
					<Input bind:value={contact.email} class="border-slate-300 bg-white text-slate-900" />
				</FormControl>
			</div>
		{/each}
		<Button variant="outline" size="sm" class="w-full" onclick={onAdd}>+ Add Contact</Button>
	</div>
{:else if contacts.length > 0}
	<div class="flex-shrink-0 space-y-3 rounded-md bg-slate-50 p-4">
		{#each contacts as contact}
			<div class="space-y-1">
				<p class="text-xs font-semibold tracking-wide text-slate-600 uppercase">
					{language === 'sv' ? 'Kontakt' : 'Contact'}
				</p>
				<div class="space-y-2 text-sm text-slate-800">
					<div class="leading-tight">
						<p class="text-sm font-medium">{contact.name}</p>
						{#if contact.phone}<p class="text-xs text-slate-600">{contact.phone}</p>{/if}
						{#if contact.email}<p class="text-xs text-slate-600">{contact.email}</p>{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
