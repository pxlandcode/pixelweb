import { redirect, type LayoutServerLoad } from '@sveltejs/kit';
import { AUTH_COOKIE_NAMES, clearAuthCookies, createSupabaseServerClient } from '$lib/server/supabase';

type Role = 'admin' | 'cms_admin' | 'employee';

type Profile = {
        first_name: string | null;
        last_name: string | null;
};

type LoadResult = {
        user: { id: string; email?: string } | null;
        profile: Profile | null;
        role: Role | null;
};

const normalizePath = (pathname: string) => pathname.replace(/\/$/, '') || '/';

// Role guard configuration centralizes who can visit each admin path.
const roleGuards: Array<{ pattern: RegExp; roles: Role[] }> = [
        { pattern: /^\/admin$/, roles: ['admin', 'cms_admin'] },
        { pattern: /^\/admin\/users/, roles: ['admin'] },
        { pattern: /^\/admin\/news/, roles: ['admin', 'cms_admin'] }
];

const guardRoute = (pathname: string, role: Role | null): string | null => {
        if (!role) return '/admin/login';

        const match = roleGuards.find((guard) => guard.pattern.test(pathname));
        if (!match) {
                // Allow routes that are not listed explicitly.
                return null;
        }

        if (!match.roles.includes(role)) {
                if (role === 'employee') {
                        return '/admin/login?unauthorized=1';
                }

                return '/admin?unauthorized=1';
        }

        return null;
};

export const load: LayoutServerLoad = async ({ cookies, url }) => {
        const pathname = normalizePath(url.pathname);
        const accessToken = cookies.get(AUTH_COOKIE_NAMES.access) ?? null;

        if (!accessToken) {
                if (pathname === '/admin/login') {
                        return { user: null, profile: null, role: null } satisfies LoadResult;
                }

                throw redirect(303, '/admin/login');
        }

        if (pathname === '/admin/login') {
                throw redirect(303, '/admin');
        }

        const supabase = createSupabaseServerClient(accessToken);

        if (!supabase) {
                clearAuthCookies(cookies);
                throw redirect(303, '/admin/login');
        }

        try {
                const { data: userData, error: userError } = await supabase.auth.getUser();

                if (userError || !userData.user) {
                        clearAuthCookies(cookies);
                        throw redirect(303, '/admin/login');
                }

                const userId = userData.user.id;

                const [{ data: profileData }, { data: roleRows }] = await Promise.all([
                        supabase.from('profiles').select('first_name, last_name').eq('id', userId).maybeSingle(),
                        supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle()
                ]);

                const role = (roleRows?.role as Role | undefined) ?? 'employee';

                const redirectTo = guardRoute(pathname, role);

                if (redirectTo) {
                        throw redirect(303, redirectTo);
                }

                return {
                        user: { id: userId, email: userData.user.email ?? undefined },
                        profile: (profileData as Profile | null) ?? null,
                        role
                } satisfies LoadResult;
        } catch (error) {
                clearAuthCookies(cookies);
                throw redirect(303, '/admin/login');
        }
};
