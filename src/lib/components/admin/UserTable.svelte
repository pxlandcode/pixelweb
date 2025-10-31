<script lang="ts">
        import type { PageData } from '../../../routes/internal/users/$types';
        import type { ActionData } from '../../../routes/internal/users/$types';

        export type UserRow = PageData['users'][number];

        export let users: UserRow[] = [];
        export let form: ActionData | null = null;
</script>

<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
                <thead class="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                                <th class="px-4 py-3 font-medium">Name</th>
                                <th class="px-4 py-3 font-medium">Role</th>
                                <th class="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                        {#if users.length === 0}
                                <tr>
                                        <td class="px-4 py-4 text-center text-sm text-gray-500" colspan="3">
                                                No users found. Invite someone from the create user button.
                                        </td>
                                </tr>
                        {/if}
                        {#each users as user}
                                <tr class="hover:bg-gray-50">
                                        <td class="px-4 py-3 text-gray-900">
                                                <div class="font-medium">
                                                        {[user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown'}
                                                </div>
                                                <div class="text-xs text-gray-500">{user.id}</div>
                                        </td>
                                        <td class="px-4 py-3 text-gray-700">
                                                <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                        {user.role.replace('_', ' ')}
                                                </span>
                                        </td>
                                        <td class="px-4 py-3 text-right">
                                                <form method="POST" action="?/updateRole" class="inline-flex items-center gap-2 text-sm">
                                                        <input type="hidden" name="user_id" value={user.id} />
                                                        <label class="sr-only" for={`role-${user.id}`}>Role</label>
                                                        <select
                                                                id={`role-${user.id}`}
                                                                name="role"
                                                                class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                                                        >
                                                                <option value="admin" selected={user.role === 'admin'}>Admin</option>
                                                                <option value="cms_admin" selected={user.role === 'cms_admin'}>CMS Admin</option>
                                                                <option value="employee" selected={user.role === 'employee'}>Employee</option>
                                                        </select>
                                                        <button
                                                                type="submit"
                                                                class="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                                                        >
                                                                Update
                                                        </button>
                                                </form>
                                        </td>
                                </tr>
                        {/each}
                </tbody>
        </table>
</div>

{#if form?.message && form?.type === 'updateRole'}
        <p class={`mt-4 rounded-md px-3 py-2 text-sm ${form.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'}`}>
                {form.message}
        </p>
{/if}
