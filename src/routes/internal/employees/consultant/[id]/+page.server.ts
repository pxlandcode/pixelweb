import type { PageServerLoad } from './$types';
import { loadConsultantResume } from '$lib/services/resumes';
import { siteMeta } from '$lib/seo';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
        const resume = await loadConsultantResume(params.id);

        if (!resume) {
                throw error(404, 'Resume not found');
        }

        return {
                resume,
                meta: {
                        title: `${siteMeta.name} — Consultant resume`,
                        description: 'Client-friendly view of the consultant resume.',
                        noindex: true,
                        path: `/internal/resumes/consultant/${params.id}`
                }
        };
};
