import { redirect, type LayoutServerLoad } from '@sveltejs/kit';
import type { PostgrestError } from '@supabase/supabase-js';
import {
	AUTH_COOKIE_NAMES,
	clearAuthCookies,
	createSupabaseServerClient,
	getSupabaseAdminClient
} from '$lib/server/supabase';
import { siteMeta, type PageMetaInput } from '$lib/seo';

type Role = 'admin' | 'cms_admin' | 'employee';

type Profile = {
        first_name: string | null;
        last_name: string | null;
};

type LoadResult = {
        user: { id: string; email?: string } | null;
        profile: Profile | null;
        role: Role | null;
        meta?: PageMetaInput;
};

const normalizePath = (pathname: string) => pathname.replace(/\/$/, '') || '/';

const PUBLIC_PATHS = ['/internal/login', '/internal/reset-password'] as const;

// Role guard configuration centralizes who can visit each internal path.
const roleGuards: Array<{ pattern: RegExp; roles: Role[] }> = [
        { pattern: /^\/internal$/, roles: ['admin', 'cms_admin'] },
        { pattern: /^\/internal\/users/, roles: ['admin'] },
        { pattern: /^\/internal\/news/, roles: ['admin', 'cms_admin'] }
];

const guardRoute = (pathname: string, role: Role | null): string | null => {
        if (!role) return '/internal/login';

        const match = roleGuards.find((guard) => guard.pattern.test(pathname));
        if (!match) {
                // Allow routes that are not listed explicitly.
                return null;
        }

        if (!match.roles.includes(role)) {
                if (role === 'employee') {
                        return '/internal/login?unauthorized=1';
                }

                return '/internal?unauthorized=1';
        }

        return null;
};

const internalMeta = (pathname: string): PageMetaInput => ({
	title: `${siteMeta.name} — Internal workspace`,
	description: 'Secure workspace for the Pixelcode team to manage content and customer data.',
	path: pathname,
	noindex: true
});

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const pathname = normalizePath(url.pathname);
        const accessToken = cookies.get(AUTH_COOKIE_NAMES.access) ?? null;

	if (!accessToken) {
		if (PUBLIC_PATHS.includes(pathname as (typeof PUBLIC_PATHS)[number])) {
			return { user: null, profile: null, role: null, meta: internalMeta(pathname) };
		}

		throw redirect(303, '/internal/login');
	}

        if (pathname === '/internal/login') {
                throw redirect(303, '/internal');
        }

        const supabase = createSupabaseServerClient(accessToken);

        if (!supabase) {
                clearAuthCookies(cookies);
                throw redirect(303, '/internal/login');
        }

	try {
		const { data: userData, error: userError } = await supabase.auth.getUser();

		if (userError || !userData.user) {
			console.warn('[internal layout] no user from access token', {
				pathname,
				userError: userError?.message
			});
			clearAuthCookies(cookies);
			throw redirect(303, '/internal/login');
		}

		const userId = userData.user.id;

		const adminClient = getSupabaseAdminClient();

		const [{ data: profileData }, roleResult] = await Promise.all([
			supabase.from('profiles').select('first_name, last_name').eq('id', userId).maybeSingle(),
			(async () => {
				if (!adminClient) {
					const fallbackError: PostgrestError = {
						message: 'Admin client unavailable',
						details: null,
						hint: null,
						code: 'PGRST'
					};
					return { data: null, error: fallbackError };
				}

				return adminClient
					.from('user_roles')
					.select('role, user_id')
					.eq('user_id', userId)
					.limit(1)
					.maybeSingle();
			})()
		]);

		const roleRows = roleResult.data as { role: Role } | null;
		const roleError = roleResult.error;

		if (roleError) {
			console.error('[internal layout] role lookup error', {
				userId,
				roleError: roleError.message
			});
		} else {
			console.debug('[internal layout] role query result', {
				userId,
				roleRows
			});
		}

		if (!roleRows?.role) {
			console.warn('[internal layout] no explicit role found, defaulting to employee', {
				userId,
				pathname
			});
		}

		const role = (roleRows?.role as Role | undefined) ?? 'employee';

		const redirectTo = guardRoute(pathname, role);

		if (redirectTo) {
			console.warn('[internal layout] guard redirect', {
				pathname,
				role,
				redirectTo
			});
			throw redirect(303, redirectTo);
		}

		return {
			user: { id: userId, email: userData.user.email ?? undefined },
			profile: (profileData as Profile | null) ?? null,
			role,
			meta: internalMeta(pathname)
		} satisfies LoadResult;
	} catch (error) {
		console.error('[internal layout] load error', error);
		clearAuthCookies(cookies);
		throw redirect(303, '/internal/login');
	}
};
