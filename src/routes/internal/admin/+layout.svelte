<script lang="ts">
	import { AdminLayout } from '$lib/components';
	import { page } from '$app/stores';

	const { data, children } = $props();
	const unauthorizedMessage = $derived(
		$page.url.searchParams.get('unauthorized')
			? 'You do not have permission to view that section.'
			: null
	);
</script>

<div class="internal-root">
	<AdminLayout
		profile={data.profile}
		role={data.role}
		roles={data.roles}
		userEmail={data.user?.email ?? null}
		{unauthorizedMessage}
	>
		{@render children?.()}
	</AdminLayout>
</div>
