<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Toaster, toast } from '@pixelcode_/blocks/components';
	import { Trash2, MessageSquare } from 'lucide-svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: feedback = data.feedback;

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('sv-SE', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	let deletingId: string | null = null;
</script>

<Toaster />

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Feedback</h1>
			<p class="mt-1 text-sm text-gray-600">Anonymous feedback from employees.</p>
		</div>
		<div class="text-sm text-gray-500">
			{feedback.length}
			{feedback.length === 1 ? 'entry' : 'entries'}
		</div>
	</div>

	{#if feedback.length === 0}
		<Card class="p-12 text-center">
			<div class="flex flex-col items-center gap-4">
				<div class="rounded-full bg-gray-100 p-4">
					<MessageSquare class="h-8 w-8 text-gray-400" />
				</div>
				<div>
					<h3 class="text-lg font-medium text-gray-900">No feedback yet</h3>
					<p class="mt-1 text-sm text-gray-500">
						When employees submit feedback on the preboarding page, it will appear here.
					</p>
				</div>
			</div>
		</Card>
	{:else}
		<div class="space-y-4">
			{#each feedback as item (item.id)}
				<Card class="relative overflow-hidden border border-gray-200 p-6">
					<div class="flex items-start justify-between gap-4">
						<div class="flex-1 space-y-2">
							<p class="whitespace-pre-wrap text-gray-700">{item.message}</p>
							<div class="flex items-center gap-3 text-xs text-gray-400">
								<span class="rounded bg-gray-100 px-2 py-0.5 text-gray-500">{item.source}</span>
								<span>{formatDate(item.created_at)}</span>
							</div>
						</div>
						<form
							method="POST"
							action="?/deleteFeedback"
							use:enhance={() => {
								deletingId = item.id;
								return async ({ result, update }) => {
									deletingId = null;
									if (result.type === 'success') {
										toast.success('Feedback deleted');
									} else {
										toast.error('Failed to delete feedback');
									}
									await update();
								};
							}}
						>
							<input type="hidden" name="id" value={item.id} />
							<Button
								type="submit"
								variant="ghost"
								size="sm"
								disabled={deletingId === item.id}
								class="text-gray-400 hover:text-red-500"
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						</form>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
