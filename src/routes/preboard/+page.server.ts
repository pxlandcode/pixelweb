import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AUTH_COOKIE_NAMES } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ cookies }) => {
	const accessToken = cookies.get(AUTH_COOKIE_NAMES.access);

	if (accessToken) {
		redirect(303, '/internal/preboard');
	}

	redirect(303, '/internal/login?redirect=%2Finternal%2Fpreboard');
};
