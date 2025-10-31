<script lang="ts">
        import UserTable from '$lib/components/admin/UserTable.svelte';
        import UserFormModal from '$lib/components/admin/UserFormModal.svelte';

        let { data, form } = $props();

        let isModalOpen = false;
        let feedback: { type: 'success' | 'error'; message: string } | null = null;

        const handleUserCreated = (event: CustomEvent<{ message?: string }>) => {
                feedback = { type: 'success', message: event.detail?.message ?? 'User created successfully.' };
                isModalOpen = false;
        };

        const handleCreateError = (event: CustomEvent<{ message?: string }>) => {
                feedback = { type: 'error', message: event.detail?.message ?? 'Failed to create user.' };
        };

        $: if (form?.type === 'updateRole') {
                feedback = {
                        type: form.ok ? 'success' : 'error',
                        message: form.message ?? ''
                };
        }
</script>

<div class="flex items-center justify-between">
        <div>
                <h1 class="text-2xl font-semibold text-gray-900">Users</h1>
                <p class="text-sm text-gray-600">Invite teammates and adjust their permissions.</p>
        </div>
        <button
                class="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                type="button"
                on:click={() => {
                        feedback = null;
                        isModalOpen = true;
                }}
        >
                Create user
        </button>
</div>

{#if feedback}
        <p
                class={`mt-4 rounded-md px-4 py-3 text-sm ${
                        feedback.type === 'success'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-700'
                }`}
        >
                {feedback.message}
        </p>
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
