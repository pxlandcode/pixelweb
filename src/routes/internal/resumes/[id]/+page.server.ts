import type { PageServerLoad } from './$types';
import { AUTH_COOKIE_NAMES, createSupabaseServerClient } from '$lib/server/supabase';
import { loadInternalResumeDetail } from '$lib/services/resumes';
import { siteMeta } from '$lib/seo';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, cookies }) => {
        const supabase = createSupabaseServerClient(cookies.get(AUTH_COOKIE_NAMES.access) ?? null);
        if (!supabase) {
                throw error(401, 'Unauthorized');
        }

        const resume = await loadInternalResumeDetail(cookies.get(AUTH_COOKIE_NAMES.access) ?? '', params.id);

        if (!resume) {
                throw error(404, 'Resume not found');
        }

        return {
                resume,
                meta: {
                        title: `${siteMeta.name} — Resume ${resume.version_name}`,
                        description: 'Edit resume content and manage versions.',
                        noindex: true,
                        path: `/internal/resumes/${params.id}`
                }
        };
};
