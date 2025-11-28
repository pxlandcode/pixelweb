import type { PageServerLoad } from './$types';
import { AUTH_COOKIE_NAMES, createSupabaseServerClient } from '$lib/server/supabase';
import { ResumeService } from '$lib/services/simpleResume';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, url, cookies }) => {
	const supabase = createSupabaseServerClient(cookies.get(AUTH_COOKIE_NAMES.access) ?? null);
	if (!supabase) {
		throw error(401, 'Unauthorized');
	}

	const langParam = url.searchParams.get('lang');
	const language = langParam === 'en' ? 'en' : 'sv';

	const resume = ResumeService.getResume(params.id);

	if (!resume) {
		throw error(404, 'Resume not found');
	}

	return {
		resume,
		language,
		meta: {
			title: `Resume ${resume.title}`,
			description: 'Printable resume',
			noindex: true,
			path: `/print/simple/${params.id}`
		}
	};
};
