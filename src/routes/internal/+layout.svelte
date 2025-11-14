<script lang="ts">
	import AdminLayout from '$lib/components/AdminLayout.svelte';
	import { page } from '$app/stores';
	import './internal.css';

	const { data, children } = $props();

	const plainRoutes = new Set(['/internal/login', '/internal/reset-password', '/internal/preboard']);
	const routeId = $derived($page.route.id ?? '');

</script>

{#if plainRoutes.has(routeId)}
	{@render children?.()}
{:else}
	{@const unauthorizedMessage =
		$page.url.searchParams.get('unauthorized')
			? 'You do not have permission to view that section.'
			: null}
	<div class="internal-root">
		<AdminLayout
			profile={data.profile}
			role={data.role}
			userEmail={data.user?.email ?? null}
			unauthorizedMessage={unauthorizedMessage}
		>
			{@render children?.()}
		</AdminLayout>
	</div>
{/if}
