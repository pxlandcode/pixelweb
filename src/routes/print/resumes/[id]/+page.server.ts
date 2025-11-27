import type { PageServerLoad } from './$types';
import { AUTH_COOKIE_NAMES, createSupabaseServerClient } from '$lib/server/supabase';
import { MockResumeService } from '$lib/api/mock-resumes';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, cookies, url }) => {
	const supabase = createSupabaseServerClient(cookies.get(AUTH_COOKIE_NAMES.access) ?? null);
	if (!supabase) {
		throw error(401, 'Unauthorized');
	}

	const langParam = url.searchParams.get('lang');
	const language = langParam === 'en' ? 'en' : 'sv';

	const resume =
		MockResumeService.getResumeByLanguage(params.id, language) ??
		MockResumeService.getResume(params.id);

	if (!resume) {
		throw error(404, 'Resume not found');
	}

	return {
		resume,
		language,
		isPdf: url.searchParams.get('pdf') === '1',
		meta: {
			title: `Resume ${resume.version}`,
			description: 'Printable resume',
			noindex: true,
			path: `/print/resumes/${params.id}`
		}
	};
};
