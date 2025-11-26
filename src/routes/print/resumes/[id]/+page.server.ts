import type { PageServerLoad } from './$types';
import { AUTH_COOKIE_NAMES, createSupabaseServerClient } from '$lib/server/supabase';
import { MockResumeService } from '$lib/api/mock-resumes';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, cookies, url }) => {
        const supabase = createSupabaseServerClient(cookies.get(AUTH_COOKIE_NAMES.access) ?? null);
        if (!supabase) {
                throw error(401, 'Unauthorized');
        }

	const resume = MockResumeService.getResume(params.id);

	if (!resume) {
		throw error(404, 'Resume not found');
	}

        return {
                resume,
                isPdf: url.searchParams.get('pdf') === '1',
                meta: {
                        title: `Resume ${resume.version}`,
                        description: 'Printable resume',
                        noindex: true,
                        path: `/print/resumes/${params.id}`
                }
        };
};
