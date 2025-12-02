import type { PageServerLoad } from './$types';
import { AUTH_COOKIE_NAMES, createSupabaseServerClient } from '$lib/server/supabase';
import { loadInternalResumeList } from '$lib/services/resumes';
import { siteMeta } from '$lib/seo';

export const load: PageServerLoad = async ({ cookies }) => {
        const supabase = createSupabaseServerClient(cookies.get(AUTH_COOKIE_NAMES.access) ?? null);

        if (!supabase) {
                return { resumes: [], meta: null };
        }

        const { resumes } = await loadInternalResumeList(cookies.get(AUTH_COOKIE_NAMES.access) ?? '');

        return {
                resumes,
                meta: {
                        title: `${siteMeta.name} — Internal resumes`,
                        description: 'Manage consultant resumes and export packages.',
                        noindex: true,
                        path: '/internal/resumes'
                }
        };
};
