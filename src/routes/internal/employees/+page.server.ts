import type { PageServerLoad } from './$types';
import {
        AUTH_COOKIE_NAMES,
        createSupabaseServerClient,
        getSupabaseAdminClient
} from '$lib/server/supabase';
import { siteMeta } from '$lib/seo';

export const load: PageServerLoad = async ({ cookies }) => {
        const supabase = createSupabaseServerClient(cookies.get(AUTH_COOKIE_NAMES.access) ?? null);

        if (!supabase) {
                return { employees: [], meta: null };
        }

        const adminClient = getSupabaseAdminClient();

        const [{ data: profiles }, rolesResult, authUsersResult] = await Promise.all([
                supabase
                        .from('profiles')
                        .select('id, first_name, last_name, avatar_url')
                        .order('last_name', { ascending: true }),
                (async () => {
                        if (!adminClient) return { data: null, error: new Error('Admin client unavailable') };
                        return adminClient.from('user_roles').select('user_id, role').eq('role', 'employee');
                })(),
                (async () => {
                        if (!adminClient) return { data: null, error: new Error('Admin client unavailable') };
                        const { data, error } = await adminClient.auth.admin.listUsers();
                        return { data: data?.users ?? null, error };
                })()
        ]);

        const roles = rolesResult.data ?? [];
        const employeeIds = new Set<string>();
        for (const row of roles ?? []) {
                if (row.role === 'employee') {
                        employeeIds.add(row.user_id);
                }
        }

        const authMap = new Map<string, { email?: string; isEmployee?: boolean }>();
        for (const user of authUsersResult.data ?? []) {
                const rolesFromAuth = Array.isArray(user.app_metadata?.roles)
                        ? (user.app_metadata?.roles as string[])
                        : typeof user.app_metadata?.role === 'string'
                                ? [user.app_metadata.role as string]
                                : [];
                const isEmployee = rolesFromAuth.includes('employee') || rolesFromAuth.includes('employees');

                if (isEmployee) {
                        employeeIds.add(user.id);
                }

                authMap.set(user.id, {
                        email: user.email ?? undefined,
                        isEmployee
                });
        }

        const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

        const employees = Array.from(employeeIds).map((id) => {
                const profile = profileMap.get(id);
                return {
                        id,
                        first_name: profile?.first_name ?? '',
                        last_name: profile?.last_name ?? '',
                        avatar_url: profile?.avatar_url ?? null,
                        email: authMap.get(id)?.email ?? null
                };
        });

        return {
                employees,
                meta: {
                        title: `${siteMeta.name} — Internal resumes`,
                        description: 'Manage consultant resumes and export packages.',
                        noindex: true,
                        path: '/internal/employees'
                }
        };
};
