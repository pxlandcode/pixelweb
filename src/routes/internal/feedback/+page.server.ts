import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { getSupabaseAdminClient } from '$lib/server/supabase';

interface Feedback {
	id: string;
	message: string;
	source: string;
	created_at: string;
}

export const load: PageServerLoad = async () => {
	const adminClient = getSupabaseAdminClient();

	if (!adminClient) {
		return { feedback: [] };
	}

	const { data, error } = await adminClient
		.from('feedback')
		.select('*')
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error loading feedback:', error);
		return { feedback: [] };
	}

	return {
		feedback: (data ?? []) as Feedback[]
	};
};

export const actions: Actions = {
	deleteFeedback: async ({ request }) => {
		const adminClient = getSupabaseAdminClient();

		if (!adminClient) {
			return fail(500, { error: 'Server error' });
		}

		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Feedback ID is required' });
		}

		const { error } = await adminClient.from('feedback').delete().eq('id', id);

		if (error) {
			console.error('Error deleting feedback:', error);
			return fail(500, { error: 'Failed to delete feedback' });
		}

		return { success: true };
	}
};
