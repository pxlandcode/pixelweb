<script lang="ts">
	import { UserTable, UserFormModal } from '$lib/components';
	import { Alert, Button } from '@pixelcode_/blocks/components';

	let { data, form } = $props();

	let isModalOpen = $state(false);
	let feedback = $state<{ type: 'success' | 'error'; message: string } | null>(null);

	const handleUserCreated = (event: CustomEvent<{ message?: string }>) => {
		feedback = { type: 'success', message: event.detail?.message ?? 'User created successfully.' };
		isModalOpen = false;
	};

	const handleCreateError = (event: CustomEvent<{ message?: string }>) => {
		feedback = { type: 'error', message: event.detail?.message ?? 'Failed to create user.' };
	};

	$effect(() => {
		if (form?.type !== 'updateRole') return;

		feedback = {
			type: form.ok ? 'success' : 'error',
			message: form.message ?? ''
		};
	});
</script>

<div class="flex items-center justify-between">
	<div>
		<h1 class="text-2xl font-semibold text-gray-900">Users</h1>
		<p class="text-sm text-gray-700">Invite teammates and adjust their permissions.</p>
	</div>
	<Button
		variant="primary"
		size="md"
		type="button"
		onclick={() => {
			feedback = null;
			isModalOpen = true;
		}}
	>
		Create user
	</Button>
</div>

{#if feedback}
	<Alert class="mt-4" variant={feedback.type === 'success' ? 'success' : 'destructive'} size="sm">
		<p class="text-sm font-medium text-gray-900">{feedback.message}</p>
	</Alert>
{/if}

<div class="mt-6">
	<UserTable users={data.users} {form} />
</div>

<UserFormModal
	bind:open={isModalOpen}
	on:success={handleUserCreated}
	on:error={handleCreateError}
	on:close={() => (isModalOpen = false)}
/>
