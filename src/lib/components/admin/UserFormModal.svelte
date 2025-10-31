<script lang="ts">
        import { Alert, Button, FormControl, Input, Select } from '@pixelcode_/blocks/components';
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
                <div class="relative w-full max-w-lg rounded-2xl border border-border/20 bg-white p-6 shadow-xl">
                        <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                class="absolute right-3 top-3 text-gray-700"
                                aria-label="Close"
                                on:click={close}
                        >
                                <span aria-hidden="true">×</span>
                        </Button>

                        <h2 class="text-lg font-semibold text-gray-900">Create user</h2>
                        <p class="mt-1 text-sm text-gray-700">
                                Provide the user details. Password and role will be forwarded to the edge function that provisions the account.
                        </p>

                        <form class="mt-6 space-y-4" on:submit={handleSubmit}>
                                <div class="grid gap-4 sm:grid-cols-2">
                                        <FormControl label="First name" required class="gap-2 text-sm">
                                                <Input
                                                        id="first_name"
                                                        name="first_name"
                                                        required
                                                        class="bg-white text-gray-900"
                                                />
                                        </FormControl>

                                        <FormControl label="Last name" required class="gap-2 text-sm">
                                                <Input
                                                        id="last_name"
                                                        name="last_name"
                                                        required
                                                        class="bg-white text-gray-900"
                                                />
                                        </FormControl>
                                </div>

                                <FormControl label="Email" required class="gap-2 text-sm">
                                        <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                class="bg-white text-gray-900"
                                        />
                                </FormControl>

                                <FormControl label="Password" required class="gap-2 text-sm" bl="Minimum 6 characters.">
                                        <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                minlength="6"
                                                required
                                                class="bg-white text-gray-900"
                                        />
                                </FormControl>

                                <FormControl label="Role" required class="gap-2 text-sm">
                                        <Select id="role" name="role" required>
                                                <option value="admin">Admin</option>
                                                <option value="cms_admin">CMS Admin</option>
                                                <option value="employee">Employee</option>
                                        </Select>
                                </FormControl>

                                {#if error}
                                        <Alert variant="destructive" size="sm">
                                                <p class="text-sm font-medium text-gray-900">{error}</p>
                                        </Alert>
                                {/if}

                                <div class="flex justify-end gap-3">
                                        <Button variant="outline" type="button" on:click={close}>
                                                Cancel
                                        </Button>
                                        <Button variant="primary" type="submit" loading={loading} loading-text="Creating…">
                                                Create user
                                        </Button>
                                </div>
                        </form>
                </div>
        </div>
{/if}
