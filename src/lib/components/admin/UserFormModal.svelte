<script lang="ts">
        import { createEventDispatcher } from 'svelte';

        export type UserRole = 'admin' | 'cms_admin' | 'employee';

        const dispatch = createEventDispatcher<
                { success: { message?: string }; close: void; error: { message?: string } }
        >();

        export let open = false;
        export let loading = false;
        export let error: string | null = null;

        const close = () => {
                open = false;
                dispatch('close');
        };

        const handleSubmit = async (event: SubmitEvent) => {
                event.preventDefault();
                const form = event.currentTarget as HTMLFormElement;
                const formData = new FormData(form);

                const payload = Object.fromEntries(formData.entries());

                try {
                        // TODO: swap this fetch call with the actual Edge Function endpoint once it is available.
                        const response = await fetch('/api/create-user', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                        });

                        if (!response.ok) {
                                const detail = await response.json().catch(() => null);
                                dispatch('error', { message: detail?.message ?? 'Failed to create user.' });
                                return;
                        }

                        dispatch('success', { message: 'User created successfully.' });
                        form.reset();
                } catch (err) {
                        dispatch('error', { message: err instanceof Error ? err.message : 'Failed to create user.' });
                }
        };
</script>

{#if open}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-8">
                <div class="relative w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
                        <button
                                type="button"
                                class="absolute right-3 top-3 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                                on:click={close}
                                aria-label="Close"
                        >
                                ×
                        </button>

                        <h2 class="text-lg font-semibold text-gray-900">Create user</h2>
                        <p class="mt-1 text-sm text-gray-500">
                                Provide the user details. Password and role will be forwarded to the edge function that provisions the account.
                        </p>

                        <form class="mt-6 space-y-4" on:submit={handleSubmit}>
                                <div class="grid gap-4 sm:grid-cols-2">
                                        <div class="space-y-1">
                                                <label class="text-sm font-medium text-gray-700" for="first_name">First name</label>
                                                <input
                                                        id="first_name"
                                                        name="first_name"
                                                        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                                        required
                                                />
                                        </div>
                                        <div class="space-y-1">
                                                <label class="text-sm font-medium text-gray-700" for="last_name">Last name</label>
                                                <input
                                                        id="last_name"
                                                        name="last_name"
                                                        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                                        required
                                                />
                                        </div>
                                </div>

                                <div class="space-y-1">
                                        <label class="text-sm font-medium text-gray-700" for="email">Email</label>
                                        <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                                required
                                        />
                                </div>

                                <div class="space-y-1">
                                        <label class="text-sm font-medium text-gray-700" for="password">Password</label>
                                        <input
                                                id="password"
                                                name="password"
                                                type="password"
                                                minlength="6"
                                                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                                required
                                        />
                                </div>

                                <div class="space-y-1">
                                        <label class="text-sm font-medium text-gray-700" for="role">Role</label>
                                        <select
                                                id="role"
                                                name="role"
                                                class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                                required
                                        >
                                                <option value="admin">Admin</option>
                                                <option value="cms_admin">CMS Admin</option>
                                                <option value="employee">Employee</option>
                                        </select>
                                </div>

                                {#if error}
                                        <p class="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-600">{error}</p>
                                {/if}

                                <div class="flex justify-end gap-3">
                                        <button
                                                type="button"
                                                class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
                                                on:click={close}
                                        >
                                                Cancel
                                        </button>
                                        <button
                                                type="submit"
                                                class="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                                                disabled={loading}
                                        >
                                                {loading ? 'Creating…' : 'Create user'}
                                        </button>
                                </div>
                        </form>
                </div>
        </div>
{/if}
