import type { PageServerLoad } from './$types';
import { ResumeService } from '$lib/services/resume';
import { siteMeta } from '$lib/seo';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, url }) => {
	const resumeId = Number(params.resumeId);
	const personId = Number(params.personId);

	if (!Number.isFinite(resumeId) || !Number.isFinite(personId)) {
		throw error(400, 'Invalid identifier');
	}

	const resume = ResumeService.getResume(resumeId);

	if (!resume || resume.personId !== personId) {
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
			path: `/internal/employees/${personId}/resume/${resumeId}`
		}
	};
};
