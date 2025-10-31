import { fail, type Actions, type PageServerLoad } from '@sveltejs/kit';
import { AUTH_COOKIE_NAMES, createSupabaseServerClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ cookies }) => {
        const supabase = createSupabaseServerClient(cookies.get(AUTH_COOKIE_NAMES.access) ?? null);

        if (!supabase) {
                return { users: [] };
        }

        // Combine profile rows with role assignments until a database view is available.
        const [{ data: profiles }, { data: roles }] = await Promise.all([
                supabase.from('profiles').select('id, first_name, last_name').order('last_name', { ascending: true }),
                supabase.from('user_roles').select('user_id, role')
        ]);

        const roleMap = new Map<string, string>();
        for (const row of roles ?? []) {
                roleMap.set(row.user_id, row.role);
        }

        const users = (profiles ?? []).map((profile) => ({
                id: profile.id,
                first_name: profile.first_name,
                last_name: profile.last_name,
                role: (roleMap.get(profile.id) as 'admin' | 'cms_admin' | 'employee' | undefined) ?? 'employee'
        }));

        return { users };
};

export const actions: Actions = {
        updateRole: async ({ request, cookies }) => {
                const supabase = createSupabaseServerClient(cookies.get(AUTH_COOKIE_NAMES.access) ?? null);

                if (!supabase) {
                        return fail(401, { type: 'updateRole', ok: false, message: 'You are not authenticated.' });
                }

                const formData = await request.formData();
                const userId = formData.get('user_id');
                const role = formData.get('role');

                if (typeof userId !== 'string' || typeof role !== 'string') {
                        return fail(400, { type: 'updateRole', ok: false, message: 'Invalid form submission.' });
                }

                const { error } = await supabase
                        .from('user_roles')
                        .upsert({ user_id: userId, role }, { onConflict: 'user_id' });

                if (error) {
                        return fail(500, { type: 'updateRole', ok: false, message: error.message });
                }

                return { type: 'updateRole', ok: true, message: 'Role updated successfully.' };
        }
};
