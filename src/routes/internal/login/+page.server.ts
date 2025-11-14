import { fail, redirect, type Actions } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '$env/static/private';
import { AUTH_COOKIE_NAMES } from '$lib/server/supabase';
import { dev } from '$app/environment';

const cookieOptions = {
        path: '/',
        httpOnly: true,
        sameSite: 'lax' as const,
        secure: !dev
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
                const redirectTo = formData.get('redirectTo');

                if (typeof email !== 'string' || typeof password !== 'string') {
                        return fail(400, { message: 'Email and password are required.' });
                }

                const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                        auth: {
                                persistSession: false,
                                autoRefreshToken: false
                        }
                });

		const { data, error } = await supabase.auth.signInWithPassword({ email, password });

		console.log('[internal/login] signInWithPassword response', {
			email,
			ok: !error,
			error: error?.message ?? null
		});

		if (error || !data.session) {
			return fail(400, { message: error?.message ?? 'Unable to sign in.' });
		}

		const { session } = data;

                cookies.set(AUTH_COOKIE_NAMES.access, session.access_token, {
                        ...cookieOptions,
                        maxAge: session.expires_in
                });

                cookies.set(AUTH_COOKIE_NAMES.refresh, session.refresh_token, {
                        ...cookieOptions,
                        maxAge: 60 * 60 * 24 * 30
                });

		const destination =
                        typeof redirectTo === 'string' && redirectTo.startsWith('/internal')
                                ? redirectTo
                                : '/internal';

		throw redirect(303, destination);
	}
};
