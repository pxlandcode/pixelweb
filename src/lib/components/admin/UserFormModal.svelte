<script lang="ts">
        import { Alert, Button, Drawer, FormControl, Input, Select } from '@pixelcode_/blocks/components';
        import { createEventDispatcher } from 'svelte';

        export type UserRole = 'admin' | 'cms_admin' | 'employee' | 'employer';

        const dispatch = createEventDispatcher<
                { success: { message?: string }; close: void; error: { message?: string } }
        >();

        const roleOptions: Array<{ value: UserRole; label: string; description: string }> = [
                { value: 'admin', label: 'Admin', description: 'Full access to internal tools.' },
                { value: 'cms_admin', label: 'CMS Admin', description: 'Manage content and news.' },
                { value: 'employee', label: 'Employee', description: 'Access resumes and profile.' },
                { value: 'employer', label: 'Employer', description: 'Limited access to preboarding.' }
        ];

        type InitialUser = {
                id: string;
                first_name: string;
                last_name: string;
                email: string;
                roles: UserRole[];
                avatar_url?: string | null;
                active: boolean;
        };

        let {
                open = $bindable(false),
                loading = $bindable(false),
                error = $bindable<string | null>(null),
                mode = $bindable<'create' | 'edit'>('create'),
                initial = $bindable<InitialUser>({
                        id: '',
                        first_name: '',
                        last_name: '',
                        email: '',
                        roles: ['employee'],
                        avatar_url: null,
                        active: true
                })
        } = $props();

        let selectedRoles = $state<UserRole[]>(initial.roles ?? ['employee']);
        let avatarUrl = $state(initial.avatar_url ?? '');
        let avatarUploading = $state(false);
        let avatarError = $state<string | null>(null);
        let fileInput: HTMLInputElement | null = null;

        $effect(() => {
                selectedRoles = initial.roles ?? ['employee'];
                avatarUrl = initial.avatar_url ?? '';
        });

        const title = $derived(mode === 'create' ? 'Create user' : 'Edit user');
        const submitLabel = $derived(mode === 'create' ? 'Create user' : 'Save changes');

        const close = () => {
                open = false;
                dispatch('close');
        };

        const toggleRole = (role: UserRole) => {
                selectedRoles = selectedRoles.includes(role)
                        ? selectedRoles.filter((r) => r !== role)
                        : [...selectedRoles, role];
        };

        const handleAvatarUpload = async (file: File | null) => {
                if (!file) return;
                avatarError = null;
                avatarUploading = true;

                const payload = new FormData();
                payload.set('file', file);

                try {
                        const response = await fetch('/internal/api/users/upload-avatar', {
                                method: 'POST',
                                body: payload
                        });

                        if (!response.ok) {
                                const detail = await response.json().catch(() => null);
                                throw new Error(detail?.message ?? 'Upload failed.');
                        }

                        const data = await response.json();
                        avatarUrl = data.url;
                } catch (err) {
                        avatarError = err instanceof Error ? err.message : 'Upload failed.';
                } finally {
                        avatarUploading = false;
                }
        };

        const handleSubmit = async (event: SubmitEvent) => {
                event.preventDefault();
                const form = event.currentTarget as HTMLFormElement;
                const formData = new FormData(form);
                error = null;

                if (selectedRoles.length === 0) {
                        dispatch('error', { message: 'Select at least one role.' });
                        return;
                }

                // Ensure roles and avatar are included explicitly
                formData.delete('roles');
                selectedRoles.forEach((role) => formData.append('roles', role));
                formData.set('avatar_url', avatarUrl);

                try {
                        if (mode === 'create') {
                                const payload = Object.fromEntries(formData.entries());
                                const response = await fetch('/api/create-user', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                                ...payload,
                                                roles: selectedRoles,
                                                avatar_url: avatarUrl
                                        })
                                });

                                if (!response.ok) {
                                        const detail = await response.json().catch(() => null);
                                        dispatch('error', { message: detail?.message ?? 'Request failed.' });
                                        return;
                                }
                        } else {
                                const response = await fetch('?/updateUser', { method: 'POST', body: formData });

                                if (!response.ok) {
                                        const detail = await response.json().catch(() => null);
                                        dispatch('error', { message: detail?.message ?? 'Request failed.' });
                                        return;
                                }
                        }

                        dispatch('success', { message: mode === 'create' ? 'User created.' : 'User updated.' });

                        // Reset only when creating; keep selections on edit so the state mirrors what was saved.
                        if (mode === 'create') {
                                form.reset();
                                selectedRoles = ['employee'];
                                avatarUrl = '';
                        }

                        open = false;
                } catch (err) {
                        dispatch('error', { message: err instanceof Error ? err.message : 'Request failed.' });
                }
        };
</script>

<Drawer
        variant="right"
        bind:open={open}
        title={title}
        subtitle={
                mode === 'create'
                        ? 'Provision a new user with access and role.'
                        : 'Update role or activation status.'
        }
        class="mr-0 w-full max-w-2xl"
        dismissable
>
        <form class="flex flex-col gap-5 overflow-y-auto pb-16" on:submit={handleSubmit}>
                {#if mode === 'edit'}
                        <input type="hidden" name="user_id" value={initial.id} />
                {/if}

                <div class="grid gap-4 sm:grid-cols-2">
                        <FormControl label="First name" required class="gap-2 text-sm">
                                <Input
                                        id="first_name"
                                        name="first_name"
                                        required
                                        class="bg-white text-gray-900"
                                        value={initial.first_name}
                                />
                        </FormControl>

                        <FormControl label="Last name" required class="gap-2 text-sm">
                                <Input
                                        id="last_name"
                                        name="last_name"
                                        required
                                        class="bg-white text-gray-900"
                                        value={initial.last_name}
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
                                value={initial.email}
                                readonly={mode === 'edit'}
                        />
                </FormControl>

                        <FormControl label="Password" class="gap-2 text-sm" bl="Leave blank to keep current password.">
                        <Input
                                id="password"
                                name="password"
                                type="password"
                                minlength="6"
                                class="bg-white text-gray-900"
                        />
                </FormControl>

                <FormControl label="Active" class="gap-2 text-sm">
                        <Select id="active" name="active" required value={initial.active ? 'true' : 'false'}>
                                <option value="true">Active (can sign in)</option>
                                <option value="false">Inactive (cannot sign in)</option>
                        </Select>
                </FormControl>

                <FormControl label="Avatar" class="gap-2 text-sm" bl="Same image is used on the employee profile.">
                        <input type="hidden" name="avatar_url" value={avatarUrl} />
                        <div class="flex flex-col gap-3">
                                <div class="flex items-center gap-3">
                                        <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                class="border-gray-300 text-gray-800"
                                                onclick={() => fileInput?.click()}
                                                disabled={avatarUploading}
                                        >
                                                {avatarUploading ? 'Uploading…' : avatarUrl ? 'Replace image' : 'Upload image'}
                                        </Button>
                                        <input
                                                bind:this={fileInput}
                                                type="file"
                                                accept="image/*"
                                                class="hidden"
                                                on:change={(event) =>
                                                        handleAvatarUpload(
                                                                (event.currentTarget as HTMLInputElement).files?.[0] ?? null
                                                        )}
                                        />
                                        {#if avatarUrl}
                                                <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        class="text-gray-700"
                                                        onclick={() => (avatarUrl = '')}
                                                        disabled={avatarUploading}
                                                >
                                                        Remove
                                                </Button>
                                        {/if}
                                </div>
                                <Input
                                        placeholder="Paste an image URL instead"
                                        value={avatarUrl}
                                        on:change={(event) => (avatarUrl = (event.currentTarget as HTMLInputElement).value)}
                                        class="bg-white text-gray-900"
                                />
                                {#if avatarUrl}
                                        <div class="flex items-center gap-3">
                                                <img src={avatarUrl} alt="Avatar" class="h-12 w-12 rounded-full object-cover" />
                                                <span class="text-xs text-gray-600 break-all">{avatarUrl}</span>
                                        </div>
                                {/if}
                                {#if avatarError}
                                        <Alert variant="destructive" size="sm">
                                                <p class="text-sm font-medium text-gray-900">{avatarError}</p>
                                        </Alert>
                                {/if}
                        </div>
                </FormControl>

                <div class="rounded-lg border border-slate-200 bg-white p-4">
                        <p class="text-sm font-semibold text-gray-900">Roles</p>
                        <p class="text-xs text-gray-600 mb-3">
                                Users can hold multiple roles. Employees get an editable profile and appear in the employee list.
                        </p>
                        <div class="grid gap-2 sm:grid-cols-2">
                                {#each roleOptions as option}
                                        <label class="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 px-3 py-2 hover:border-slate-300">
                                                <input
                                                        type="checkbox"
                                                        name="roles"
                                                        value={option.value}
                                                        checked={selectedRoles.includes(option.value)}
                                                        on:change={() => toggleRole(option.value)}
                                                        class="mt-1 h-4 w-4 rounded border-slate-300 text-gray-900 focus:ring-2 focus:ring-orange-400"
                                                />
                                                <div class="space-y-1">
                                                        <p class="text-sm font-medium text-gray-900">{option.label}</p>
                                                        <p class="text-xs text-gray-600">{option.description}</p>
                                                </div>
                                        </label>
                                {/each}
                        </div>
                </div>

                {#if error}
                        <Alert variant="destructive" size="sm">
                                <p class="text-sm font-medium text-gray-900">{error}</p>
                        </Alert>
                {/if}

                <div class="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-white pt-4">
                        <Button variant="outline" type="button" on:click={close}>
                                Cancel
                        </Button>
                        <Button variant="primary" type="submit" loading={loading} loading-text="Saving…">
                                {submitLabel}
                        </Button>
                </div>
        </form>
</Drawer>
