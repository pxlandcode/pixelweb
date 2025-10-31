<script lang="ts">
        import { createEventDispatcher } from 'svelte';
        import { page } from '$app/stores';

        const dispatch = createEventDispatcher<{ logout: void }>();

        export type AdminRole = 'admin' | 'cms_admin' | 'employee';

        interface Profile {
                first_name: string | null;
                last_name: string | null;
        }

        export let profile: Profile | null = null;
        export let role: AdminRole | null = null;
        export let userEmail: string | null = null;
        export let unauthorizedMessage: string | null = null;

        // Extend this list when new admin areas are added.
        const navItems = [
                { label: 'Dashboard', href: '/admin', allowed: ['admin', 'cms_admin'] satisfies AdminRole[] },
                { label: 'Users', href: '/admin/users', allowed: ['admin'] satisfies AdminRole[] },
                { label: 'News', href: '/admin/news', allowed: ['admin', 'cms_admin'] satisfies AdminRole[] }
        ];

        $: activePath = $page.url.pathname;
        $: displayName = profile
                ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || userEmail || 'User'
                : userEmail || 'User';

        const canView = (allowed: AdminRole[]) => {
                if (!role) return false;
                return allowed.includes(role);
        };
</script>

<div class="flex min-h-screen bg-gray-100">
        <aside class="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white/80 backdrop-blur md:block">
                <div class="flex items-center justify-between px-6 py-5">
                        <h1 class="text-lg font-semibold text-gray-900">PixelCMS Admin</h1>
                </div>
                <nav class="space-y-1 px-3 pb-6">
                        {#each navItems as item}
                                {#if canView(item.allowed)}
                                        <a
                                                href={item.href}
                                                class={`block rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-gray-100 ${
                                                        activePath === item.href
                                                                ? 'bg-gray-900 text-white'
                                                                : 'text-gray-700'
                                                }`}
                                        >
                                                {item.label}
                                        </a>
                                {/if}
                        {/each}
                </nav>
        </aside>

        <div class="flex flex-1 flex-col">
                <header class="flex flex-col gap-3 border-b border-gray-200 bg-white/80 px-4 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-8">
                        <div>
                                <h2 class="text-lg font-semibold text-gray-900">Admin dashboard</h2>
                                <p class="text-sm text-gray-500">Manage the content and users of PixelCMS.</p>
                        </div>

                        <div class="flex items-center gap-4">
                                <div class="text-right">
                                        <p class="text-sm font-medium text-gray-900">{displayName}</p>
                                        {#if role}
                                                <p class="text-xs uppercase tracking-wide text-gray-500">{role.replace('_', ' ')}</p>
                                        {/if}
                                </div>
                                <form method="POST" action="/admin/logout" class="hidden md:block">
                                        <button
                                                type="submit"
                                                class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
                                                on:click={() => dispatch('logout')}
                                        >
                                                Log out
                                        </button>
                                </form>
                                <form method="POST" action="/admin/logout" class="md:hidden">
                                        <button
                                                type="submit"
                                                class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
                                                on:click={() => dispatch('logout')}
                                        >
                                                Log out
                                        </button>
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
