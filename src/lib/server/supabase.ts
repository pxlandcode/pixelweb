import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '$env/static/private';
import type { Cookies } from '@sveltejs/kit';

export const AUTH_COOKIE_NAMES = {
        access: 'sb-access-token',
        refresh: 'sb-refresh-token'
} as const;

export const createSupabaseServerClient = (accessToken: string | null): SupabaseClient | null => {
        if (!accessToken) {
                return null;
        }

        return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                global: {
                        headers: {
                                Authorization: `Bearer ${accessToken}`
                        }
                },
                auth: {
                        persistSession: false,
                        autoRefreshToken: false
                }
        });
};

export const getSupabaseFromCookies = (cookies: Cookies): SupabaseClient | null => {
        const accessToken = cookies.get(AUTH_COOKIE_NAMES.access) ?? null;
        return createSupabaseServerClient(accessToken);
};

export const clearAuthCookies = (cookies: Cookies) => {
        cookies.delete(AUTH_COOKIE_NAMES.access, { path: '/' });
        cookies.delete(AUTH_COOKIE_NAMES.refresh, { path: '/' });
};
