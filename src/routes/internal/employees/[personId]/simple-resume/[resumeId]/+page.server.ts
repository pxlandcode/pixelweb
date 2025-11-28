import type { PageServerLoad } from './$types';
import { ResumeService } from '$lib/services/simpleResume';
import { siteMeta } from '$lib/seo';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, url }) => {
	const resume = ResumeService.getResume(params.resumeId);

	if (!resume) {
		throw error(404, 'Resume not found');
	}

	const langParam = url.searchParams.get('lang');
	const language = langParam === 'en' ? 'en' : 'sv';

	return {
		resume,
		language,
		isPdf: url.searchParams.get('pdf') === '1',
		meta: {
			title: `${siteMeta.name} — Resume ${resume.title}`,
			description: 'View and manage resume.',
			noindex: true,
			path: `/internal/employees/${params.personId}/simple-resume/${params.resumeId}`
		}
	};
};
