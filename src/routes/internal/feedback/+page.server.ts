import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import {
	AUTH_COOKIE_NAMES,
	createSupabaseServerClient,
	getSupabaseAdminClient
} from '$lib/server/supabase';

type Role = 'admin' | 'cms_admin' | 'employee' | 'employer';

interface Feedback {
	id: string;
	message: string;
	source: string;
	created_at: string;
}

const canModerateFeedback = (roles: Role[]) => roles.includes('admin') || roles.includes('employer');

export const load: PageServerLoad = async ({ parent }) => {
	const { roles = [] } = await parent();
	const canModerate = canModerateFeedback(roles);

	if (!canModerate) {
		return { feedback: [], canModerate };
	}

	const adminClient = getSupabaseAdminClient();

	if (!adminClient) {
		return { feedback: [], canModerate };
	}

	const { data, error } = await adminClient
		.from('feedback')
		.select('*')
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error loading feedback:', error);
		return { feedback: [], canModerate };
	}

	return {
		feedback: (data ?? []) as Feedback[],
		canModerate
	};
};

export const actions: Actions = {
	submitFeedback: async ({ request, cookies }) => {
		const supabase = createSupabaseServerClient(cookies.get(AUTH_COOKIE_NAMES.access) ?? null);
		const adminClient = getSupabaseAdminClient();

		if (!supabase || !adminClient) {
			return fail(500, { error: 'Server error' });
		}

		const {
			data: { user }
		} = await supabase.auth.getUser();

		if (!user) {
			return fail(401, { error: 'Not authenticated' });
		}

		const formData = await request.formData();
		const message = formData.get('message')?.toString()?.trim() ?? '';

		if (!message) {
			return fail(400, { error: 'Message is required' });
		}

		const { error } = await adminClient.from('feedback').insert({
			message,
			source: 'feedback'
		});

		if (error) {
			console.error('Error submitting feedback:', error);
			return fail(500, { error: 'Failed to submit feedback' });
		}

		return { success: true };
	},
	deleteFeedback: async ({ request, cookies }) => {
		const supabase = createSupabaseServerClient(cookies.get(AUTH_COOKIE_NAMES.access) ?? null);
		const adminClient = getSupabaseAdminClient();

		if (!supabase || !adminClient) {
			return fail(500, { error: 'Server error' });
		}

		const {
			data: { user }
		} = await supabase.auth.getUser();

		if (!user) {
			return fail(401, { error: 'Not authenticated' });
		}

		const { data: userRoles } = await adminClient
			.from('user_roles')
			.select('role')
			.eq('user_id', user.id);

		const roles = (userRoles ?? []).map((r) => r.role as Role);
		const canModerate = canModerateFeedback(roles);

		if (!canModerate) {
			return fail(403, { error: 'Not authorized' });
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
