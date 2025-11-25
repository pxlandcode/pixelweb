import type { PageServerLoad } from './$types';
import { listPublicResumes } from '$lib/services/resumes';
import { siteMeta } from '$lib/seo';

export const load: PageServerLoad = async () => {
        const resumes = await listPublicResumes();

        return {
                resumes,
                meta: {
                        title: `${siteMeta.name} — Consultant resumes`,
                        description: 'Browse consultant resumes built with Pixel & Code.',
                        path: '/resumes'
                }
        };
};
