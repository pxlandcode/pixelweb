<script lang="ts">
        import AdminLayout from '$lib/components/AdminLayout.svelte';
        import { page } from '$app/stores';

        let { data, children } = $props();

        $: currentRouteId = $page.route.id;
        $: isLogin = currentRouteId === '/admin/login';
        $: unauthorizedMessage = $page.url.searchParams.get('unauthorized')
                ? 'You do not have permission to view that section.'
                : null;
</script>

{#if isLogin}
        {@render children?.()}
{:else}
        <AdminLayout
                profile={data.profile}
                role={data.role}
                userEmail={data.user?.email ?? null}
                unauthorizedMessage={unauthorizedMessage}
        >
                {@render children?.()}
        </AdminLayout>
{/if}
