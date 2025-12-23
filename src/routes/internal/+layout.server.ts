import { redirect, type LayoutServerLoad } from '@sveltejs/kit';
import type { PostgrestError } from '@supabase/supabase-js';
import {
	AUTH_COOKIE_NAMES,
	clearAuthCookies,
	createSupabaseServerClient,
	getSupabaseAdminClient
} from '$lib/server/supabase';
import { siteMeta, type PageMetaInput } from '$lib/seo';

type Role = 'admin' | 'cms_admin' | 'employee' | 'employer';

type Profile = {
	first_name: string | null;
	last_name: string | null;
};

type LoadResult = {
	user: { id: string; email?: string } | null;
	profile: Profile | null;
	role: Role | null;
	roles: Role[];
	meta?: PageMetaInput;
};

const normalizePath = (pathname: string) => pathname.replace(/\/$/, '') || '/';

const PUBLIC_PATHS = ['/internal/login', '/internal/reset-password'] as const;

// Role guard configuration centralizes who can visit each internal path.
const roleGuards: Array<{ pattern: RegExp; roles: Role[] }> = [
	{ pattern: /^\/internal$/, roles: ['admin', 'cms_admin', 'employee', 'employer'] },
	{ pattern: /^\/internal\/users/, roles: ['admin', 'employer'] },
	{ pattern: /^\/internal\/news/, roles: ['admin', 'cms_admin'] },
	{ pattern: /^\/internal\/preboard$/, roles: ['admin', 'cms_admin', 'employee', 'employer'] },
	{ pattern: /^\/internal\/employees(\/.*)?$/, roles: ['admin', 'employer', 'employee'] },
	{ pattern: /^\/internal\/feedback(\/.*)?$/, roles: ['admin', 'cms_admin', 'employee', 'employer'] },
	{
		pattern: /^\/internal\/resumes\/consultant\//,
		roles: ['admin', 'cms_admin', 'employee', 'employer']
	},
	{ pattern: /^\/internal\/resumes(\/.*)?$/, roles: ['admin', 'cms_admin', 'employee', 'employer'] }
];

const normalizeRole = (role: string | null | undefined): Role | null => {
	if (!role) return null;
	const value = role.toLowerCase().replace(/\s+/g, '_');

	switch (value) {
		case 'admin':
			return 'admin';
		case 'cms_admin':
		case 'cms-admin':
		case 'cmsadmin':
			return 'cms_admin';
		case 'employee':
		case 'employees':
			return 'employee';
		case 'employer':
		case 'employers':
			return 'employer';
		default:
			return null;
	}
};

const guardRoute = (pathname: string, roles: Role[]): string | null => {
	const match = roleGuards.find((guard) => guard.pattern.test(pathname));
	if (!match) {
		// Allow routes that are not listed explicitly.
		return null;
	}

	const allowed = roles.some((role) => match.roles.includes(role));
	if (!allowed) {
		if (roles.includes('employee') || roles.includes('employer')) {
			return '/internal';
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
			return { user: null, profile: null, role: null, roles: [], meta: internalMeta(pathname) };
		}

		const redirectParam = encodeURIComponent(pathname);
		throw redirect(303, `/internal/login?redirect=${redirectParam}`);
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
		if (userData.user.app_metadata?.active === false) {
			clearAuthCookies(cookies);
			throw redirect(303, '/internal/login?inactive=1');
		}

		const adminClient = getSupabaseAdminClient();

		const [{ data: profileData }, rolesResult] = await Promise.all([
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

				return adminClient.from('user_roles').select('role, user_id').eq('user_id', userId);
			})()
		]);

		const roleRows = (rolesResult.data as { role: string }[] | null) ?? [];
		const roleError = rolesResult.error;

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

		const rolesFromTable = roleRows
			.map((row) => normalizeRole(row.role))
			.filter(Boolean) as Role[];

		let roles = rolesFromTable;

		if (roles.length === 0) {
			const appRolesNormalized = (
				Array.isArray(userData.user.app_metadata?.roles)
					? (userData.user.app_metadata?.roles as string[])
					: []
			)
				.map((r) => normalizeRole(r))
				.filter(Boolean) as Role[];

			if (appRolesNormalized.length > 0) {
				roles = appRolesNormalized;
			} else if (typeof userData.user.app_metadata?.role === 'string') {
				const normalizedRole = normalizeRole(userData.user.app_metadata.role);
				if (normalizedRole) {
					roles = [normalizedRole];
				}
			}
		}

		roles = Array.from(new Set(roles));

		console.info('[internal layout] role debug', {
			userId,
			pathname,
			rawRoleRows: roleRows,
			normalizedTableRoles: rolesFromTable,
			appMetadataRoles: userData.user.app_metadata?.roles ?? null,
			appMetadataRole: userData.user.app_metadata?.role ?? null,
			finalRoles: roles
		});

		if (roles.length === 0) {
			console.warn('[internal layout] no explicit role found, defaulting to employee', {
				userId,
				pathname
			});
		}

		const primaryRole = (roles[0] as Role | undefined) ?? 'employee';

		const redirectTo = guardRoute(pathname, roles.length ? roles : ['employee']);

		if (redirectTo) {
			console.warn('[internal layout] guard redirect', {
				pathname,
				role: primaryRole,
				roles,
				redirectTo
			});
			throw redirect(303, redirectTo);
		}

		return {
			user: { id: userId, email: userData.user.email ?? undefined },
			profile: (profileData as Profile | null) ?? null,
			role: primaryRole,
			roles: roles.length ? roles : ['employee'],
			meta: internalMeta(pathname)
		} satisfies LoadResult;
	} catch (error) {
		if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
			throw error;
		}

		console.error('[internal layout] load error', error);
		clearAuthCookies(cookies);
		throw redirect(303, '/internal/login');
	}
};
