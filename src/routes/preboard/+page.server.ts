import { redirect, type PageServerLoad } from '@sveltejs/kit';
import { AUTH_COOKIE_NAMES } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ cookies }) => {
	const accessToken = cookies.get(AUTH_COOKIE_NAMES.access);

	if (accessToken) {
		throw redirect(303, '/internal/preboard');
	}

	throw redirect(303, '/internal/login?redirect=%2Finternal%2Fpreboard');
};
