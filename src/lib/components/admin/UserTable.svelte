<script lang="ts">
        import {
                Alert,
                Badge,
                Button,
                Card,
                Select,
                SuperTable,
                TableHandler,
                Row,
                Cell,
                type SuperTableHead
        } from '@pixelcode_/blocks/components';
        import type { ActionData, PageData } from '../../../routes/internal/users/$types';

        export type UserRow = PageData['users'][number];

        export let users: UserRow[] = [];
        export let form: ActionData | null = null;

        type TableRow = UserRow & {
                source: UserRow;
                fullName: string;
                roleLabel: string;
                emailText: string;
        };

        const headings: SuperTableHead<TableRow>[] = [
                { heading: 'Name', sortable: 'fullName', width: 42 },
                { heading: 'Role', sortable: 'roleLabel', width: 18 },
                { heading: 'Actions', width: 40 }
        ];

        const toRows = (items: UserRow[]): TableRow[] =>
                items.map((user) => {
                        const fullName =
                                [user.first_name, user.last_name].filter(Boolean).join(' ') ||
                                user.email ||
                                'Unknown';

                        const emailText = user.email ?? 'Email not provided';

                        return {
                                ...user,
                                source: user,
                                fullName,
                                roleLabel: user.role.replace('_', ' '),
                                emailText
                        };
                });

        let tableRows: TableRow[] = toRows(users);
        let tableInstance = new TableHandler<TableRow>(headings, tableRows.map((row) => ({ ...row })));

        $: tableRows = toRows(users);
        $: tableInstance = new TableHandler<TableRow>(headings, tableRows.map((row) => ({ ...row })));
</script>

<Card class="border-border/20 bg-white p-4 space-y-4">
        <SuperTable instance={tableInstance} selectable={false} class="user-table w-full">
                {#each tableInstance.data as row (row.id)}
                        <Row.Root>
                                <Cell.Value class="align-top">
                                        <div class="space-y-2">
                                                <div>
                                                        <p class="text-sm font-semibold text-gray-900">{row.fullName}</p>
                                                        <p class="text-xs font-medium text-gray-700">{row.emailText}</p>
                                                </div>
                                                <p class="text-xs text-gray-600">ID: {row.id}</p>
                                        </div>
                                </Cell.Value>

                                <Cell.Value class="align-top">
                                        <Badge variant="default" size="xs" class="uppercase tracking-wide">
                                                {row.roleLabel}
                                        </Badge>
                                </Cell.Value>

                                <Cell.Value class="align-top">
                                        <form
                                                method="POST"
                                                action="?/updateRole"
                                                class="flex flex-wrap items-center justify-end gap-2 text-sm"
                                        >
                                                <input type="hidden" name="user_id" value={row.id} />
                                                <label class="sr-only" for={`role-${row.id}`}>Role</label>
                                                <Select id={`role-${row.id}`} name="role" size="sm" value={row.role}>
                                                        <option value="admin">Admin</option>
                                                        <option value="cms_admin">CMS Admin</option>
                                                        <option value="employee">Employee</option>
                                                        <option value="employer">Employer</option>
                                                </Select>
                                                <Button variant="primary" size="sm" type="submit">
                                                        Update
                                                </Button>
                                        </form>
                                </Cell.Value>
                        </Row.Root>
                {/each}
        </SuperTable>

        {#if users.length === 0}
                <p class="text-sm font-medium text-gray-700">
                        No users yet. Invite your first teammate with Create user.
                </p>
        {/if}
</Card>

{#if form?.message && form?.type === 'updateRole'}
        <Alert
                class="mt-4"
                variant={form.ok ? 'success' : 'destructive'}
                size="sm"
        >
                <p class="text-sm font-medium text-gray-900">{form.message}</p>
        </Alert>
{/if}

<style>
        .user-table .flex.justify-center.p-2.text-sm.font-semibold {
                display: none;
        }
</style>
