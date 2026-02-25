<script lang="ts">
	import { Badge, Button, Mode } from '@pixelcode_/blocks/components';
	import { createEventDispatcher } from 'svelte';
	import { page } from '$app/stores';
	import pixelcodeLogo from '$lib/assets/pixelcodelogodark.svg';

	const dispatch = createEventDispatcher<{ logout: void }>();

	export type AdminRole = 'admin' | 'cms_admin' | 'employee' | 'employer';

	interface Profile {
		first_name: string | null;
		last_name: string | null;
	}

	export let profile: Profile | null = null;
	export let role: AdminRole | null = null;
	export let roles: AdminRole[] = [];
	export let userEmail: string | null = null;
	export let unauthorizedMessage: string | null = null;

	type NavItem = {
		label: string;
		href: string;
		allowed: AdminRole[];
		match: 'exact' | 'prefix';
	};

	type WorkspaceKey = 'admin' | 'resume';

	type NavSection = {
		key: WorkspaceKey;
		label: string;
		items: NavItem[];
	};

	// Phase 1 split: expose dedicated namespaces while reusing existing pages under wrapper routes.
	const navSections: NavSection[] = [
		{
			key: 'resume',
			label: 'Resume',
			items: [
				{
					label: 'Dashboard',
					href: '/internal/resume',
					allowed: ['admin', 'cms_admin', 'employee', 'employer'],
					match: 'exact'
				},
				{
					label: 'Users',
					href: '/internal/resume/users',
					allowed: ['admin', 'employer'],
					match: 'prefix'
				},
				{
					label: 'Employees',
					href: '/internal/resume/employees',
					allowed: ['admin', 'employer', 'employee'],
					match: 'prefix'
				},
				{
					label: 'Resumes',
					href: '/internal/resume/resumes',
					allowed: ['admin', 'cms_admin', 'employee'],
					match: 'prefix'
				}
			]
		},
		{
			key: 'admin',
			label: 'Admin',
			items: [
				{
					label: 'Dashboard',
					href: '/internal/admin',
					allowed: ['admin', 'cms_admin', 'employee', 'employer'],
					match: 'exact'
				},
				{
					label: 'Users',
					href: '/internal/admin/users',
					allowed: ['admin', 'employer'],
					match: 'prefix'
				},
				{
					label: 'News',
					href: '/internal/admin/news',
					allowed: ['admin', 'cms_admin'],
					match: 'prefix'
				},
				{
					label: 'Cases',
					href: '/internal/admin/cases',
					allowed: ['admin', 'cms_admin'],
					match: 'prefix'
				},
				{
					label: 'Feedback',
					href: '/internal/admin/feedback',
					allowed: ['admin', 'employer', 'cms_admin', 'employee'],
					match: 'prefix'
				}
			]
		}
	];

	$: activePath = $page.url.pathname;
	$: displayName = profile
		? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || userEmail || 'User'
		: userEmail || 'User';
	$: activeWorkspace = inferWorkspace(activePath);
	$: visibleNavSections = activeWorkspace
		? navSections.filter((section) => section.key === activeWorkspace)
		: [];

	const canView = (allowed: AdminRole[]) => {
		const effectiveRoles = roles.length ? roles : role ? [role] : [];
		return effectiveRoles.some((r) => allowed.includes(r));
	};

	const isActive = (item: NavItem) => {
		if (item.match === 'exact') return activePath === item.href;
		return activePath === item.href || activePath.startsWith(`${item.href}/`);
	};

	const inferWorkspace = (pathname: string): WorkspaceKey | null => {
		if (pathname === '/internal/admin' || pathname.startsWith('/internal/admin/')) return 'admin';
		if (pathname === '/internal/resume' || pathname.startsWith('/internal/resume/')) return 'resume';

		// Legacy routes while we migrate links and add redirects.
		if (
			pathname === '/internal/news' ||
			pathname.startsWith('/internal/news/') ||
			pathname === '/internal/cases' ||
			pathname.startsWith('/internal/cases/') ||
			pathname === '/internal/feedback' ||
			pathname.startsWith('/internal/feedback/')
		) {
			return 'admin';
		}

		if (
			pathname === '/internal/employees' ||
			pathname.startsWith('/internal/employees/') ||
			pathname === '/internal/resumes' ||
			pathname.startsWith('/internal/resumes/')
		) {
			return 'resume';
		}

		return null;
	};
</script>

<div class="flex min-h-screen bg-gray-100">
	<aside
		class="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white/80 backdrop-blur md:block"
	>
		<div class="flex items-center justify-between px-6 py-5">
			<img src={pixelcodeLogo} alt="Pixel&Code" class="h-6" />
		</div>
		<nav class="space-y-4 px-3 pb-6">
			{#if visibleNavSections.length === 0}
				<p class="px-3 text-sm text-gray-500">No workspace menu for this route.</p>
			{:else}
				{#each visibleNavSections as section}
					<div class="space-y-1">
						<p class="px-3 pt-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
							{section.label}
						</p>
						{#each section.items as item}
							{#if canView(item.allowed)}
								<Button
									href={item.href}
									variant={isActive(item) ? 'nav-active' : 'nav'}
									size="md"
									class={`w-full justify-start ${isActive(item) ? 'font-semibold' : 'text-gray-900'}`}
								>
									{item.label}
								</Button>
							{/if}
						{/each}
					</div>
				{/each}
			{/if}
		</nav>
	</aside>

	<div class="flex flex-1 flex-col">
		<header
			class="flex flex-col gap-3 border-b border-gray-200 bg-white/80 px-4 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-8"
		>
			<div>
				<h2 class="text-lg font-semibold text-gray-900">PixelCMS</h2>
				<p class="text-sm text-gray-700">Pixel&Code's internal CMS</p>
			</div>

			<div class="flex items-center gap-4">
				<div class="space-y-1 text-right">
					<p class="text-sm font-medium text-gray-900">{displayName}</p>
					{#if (roles?.length ?? 0) > 0}
						<div class="flex flex-wrap justify-end gap-1">
							{#each roles as r}
								<Badge variant="info" size="xs" class="tracking-wide uppercase">
									{r.replace('_', ' ')}
								</Badge>
							{/each}
						</div>
					{:else if role}
						<Badge variant="info" size="xs" class="tracking-wide uppercase">
							{role.replace('_', ' ')}
						</Badge>
					{/if}
				</div>
				<Mode.Switch
					class="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-800 shadow-sm transition hover:bg-gray-100 focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
				/>
				<form method="POST" action="/internal/logout" class="hidden md:block">
					<Button
						type="submit"
						variant="outline"
						size="sm"
						class="gap-1"
						onclick={() => dispatch('logout')}
					>
						Log out
					</Button>
				</form>
				<form method="POST" action="/internal/logout" class="md:hidden">
					<Button
						type="submit"
						variant="outline"
						size="sm"
						class="gap-1"
						onclick={() => dispatch('logout')}
					>
						Log out
					</Button>
				</form>
			</div>
		</header>

		{#if unauthorizedMessage}
			<div class="bg-amber-100 px-4 py-3 text-sm text-amber-900 md:px-8">
				{unauthorizedMessage}
			</div>
		{/if}

		<main class="flex-1 px-4 py-6 md:px-8">
			<slot />
		</main>
	</div>
</div>
