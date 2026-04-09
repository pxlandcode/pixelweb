<script lang="ts">
	import { Card, Button } from '@pixelcode_/blocks/components';
	import { Pencil } from 'lucide-svelte';

	const { data } = $props();
</script>

<section class="space-y-6">
	<header>
		<h1 class="text-2xl font-semibold text-gray-900">Welcome back</h1>
		<p class="mt-1 text-sm text-gray-700">
			This is Pixel&Code's internal workspace. Use the sidebar to navigate.
		</p>
	</header>

	<!-- Replace the quick start cards with dashboard metrics once analytics are ready. -->
	<div class="grid gap-4 md:grid-cols-2">
		<Card class="relative gap-3 p-6">
			<div class="absolute top-4 right-4">
				<Button
					variant="ghost"
					size="sm"
					href={`/internal/employees/${data.user?.id}`}
					class="text-gray-500 hover:text-gray-700"
				>
					<Pencil size={16} />
				</Button>
			</div>
			<h2 class="text-lg font-semibold text-gray-900">Your profile</h2>
			<p class="text-sm text-gray-700">
				<strong>Name:</strong>
				{[data.profile?.first_name, data.profile?.last_name].filter(Boolean).join(' ') || 'Missing'}
			</p>
			<p class="text-sm text-gray-700"><strong>Email:</strong> {data.user?.email}</p>
			<p class="text-sm text-gray-700">
				<strong>Role{(data.roles?.length ?? 0) > 1 ? 's' : ''}:</strong>
				{(data.roles ?? [data.role]).filter(Boolean).join(', ')}
			</p>
		</Card>

		<Card class="gap-3 p-6">
			<h2 class="text-lg font-semibold text-gray-900">About this workspace</h2>
			<p class="text-sm text-gray-700">
				PixelCMS is our internal tool for managing employee information, company news, resumes, and
				more.
			</p>

			<p class="mt-3 text-xs text-gray-500 italic">
				This workspace is a work in progress. And the codebase is available for all of our
				employees. If you want to contribute or suggest improvements, please reach out to your
				manager to get access to our GitHub repository.
			</p>
		</Card>
	</div>
</section>
