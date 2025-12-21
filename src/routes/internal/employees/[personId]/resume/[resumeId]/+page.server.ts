import type { Actions, PageServerLoad } from './$types';
import { ResumeService } from '$lib/services/resume';
import { siteMeta } from '$lib/seo';
import { error, json } from '@sveltejs/kit';
import { getSupabaseAdminClient, createSupabaseServerClient, AUTH_COOKIE_NAMES } from '$lib/server/supabase';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, url }) => {
	const resumeId = params.resumeId;
	const personId = params.personId;

	if (!resumeId || !personId) {
		throw error(400, 'Invalid identifier');
	}

	const resume = await ResumeService.getResume(resumeId);
	const resumePerson = await ResumeService.getPerson(personId);

	if (!resume || resume.personId !== personId) {
		throw error(404, 'Resume not found');
	}

	const langParam = url.searchParams.get('lang');
	const language = langParam === 'en' ? 'en' : 'sv';

	return {
		resume,
		resumePerson,
		avatarUrl: resumePerson?.avatar_url ?? null,
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

export const actions: Actions = {
	saveResume: async ({ request, params, cookies }) => {
		const admin = getSupabaseAdminClient();
		const supabase = createSupabaseServerClient(cookies.get(AUTH_COOKIE_NAMES.access) ?? null);
		if (!admin || !supabase) {
			return fail(401, { ok: false, message: 'Unauthorized' });
		}

		const resumeId = params.resumeId;
		if (!resumeId) {
			return fail(400, { ok: false, message: 'Invalid resume id' });
		}

		const formData = await request.formData();
		const contentRaw = formData.get('content');

		if (typeof contentRaw !== 'string') {
			return fail(400, { ok: false, message: 'Missing resume content' });
		}

		let content: unknown = null;
		try {
			content = JSON.parse(contentRaw);
		} catch (err) {
			return fail(400, { ok: false, message: 'Invalid resume content' });
		}

		const { error: updateError } = await admin
			.from('resumes')
			.update({
				content,
				updated_at: new Date().toISOString()
			})
			.eq('id', resumeId);

		if (updateError) {
			return fail(500, { ok: false, message: updateError.message });
		}

		return { ok: true };
	}
};
