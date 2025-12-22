import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import {
	AUTH_COOKIE_NAMES,
	createSupabaseServerClient,
	getSupabaseAdminClient
} from '$lib/server/supabase';

export const load: PageServerLoad = async ({ cookies }) => {
	const supabase = createSupabaseServerClient(cookies.get(AUTH_COOKIE_NAMES.access) ?? null);
	const adminClient = getSupabaseAdminClient();

	if (!supabase || !adminClient) {
		return {
			currentUserProfile: null,
			employeeInfo: null,
			emergencyContact: null
		};
	}

	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) {
		return {
			currentUserProfile: null,
			employeeInfo: null,
			emergencyContact: null
		};
	}

	const [profileResult, employeeInfoResult, emergencyContactResult] = await Promise.all([
		adminClient.from('profiles').select('*').eq('id', user.id).single(),
		adminClient.from('employee_info').select('*').eq('user_id', user.id).single(),
		adminClient.from('employee_emergency_contact').select('*').eq('user_id', user.id).single()
	]);

	return {
		currentUserProfile: profileResult.data
			? {
					id: user.id,
					first_name: profileResult.data.first_name ?? '',
					last_name: profileResult.data.last_name ?? '',
					email: user.email ?? null
				}
			: {
					id: user.id,
					first_name: '',
					last_name: '',
					email: user.email ?? null
				},
		employeeInfo: employeeInfoResult.data ?? null,
		emergencyContact: emergencyContactResult.data ?? null
	};
};

export const actions: Actions = {
	updateBasicInfo: async ({ request, cookies }) => {
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

		// Profile fields
		const firstName = formData.get('first_name')?.toString() ?? '';
		const lastName = formData.get('last_name')?.toString() ?? '';

		// Employee info fields
		const phone = formData.get('phone')?.toString() ?? '';
		const address = formData.get('address')?.toString() ?? '';
		const personalIdentityNumber = formData.get('personal_identity_number')?.toString() ?? '';
		const bankName = formData.get('bank_name')?.toString() ?? '';
		const bankAccount = formData.get('bank_account')?.toString() ?? '';

		// Emergency contact fields
		const emergencyName = formData.get('emergency_name')?.toString() ?? '';
		const emergencyRelationship = formData.get('emergency_relationship')?.toString() ?? '';
		const emergencyPhone = formData.get('emergency_phone')?.toString() ?? '';

		// Update profile
		const { error: profileError } = await adminClient
			.from('profiles')
			.update({
				first_name: firstName,
				last_name: lastName,
				updated_at: new Date().toISOString()
			})
			.eq('id', user.id);

		if (profileError) {
			return fail(500, { error: profileError.message });
		}

		// Upsert employee info (don't touch start_date or employment_status_id - those are admin-only)
		const { error: infoError } = await adminClient.from('employee_info').upsert(
			{
				user_id: user.id,
				phone,
				address,
				personal_identity_number: personalIdentityNumber,
				bank_name: bankName,
				bank_account: bankAccount,
				updated_at: new Date().toISOString()
			},
			{ onConflict: 'user_id' }
		);

		if (infoError) {
			return fail(500, { error: infoError.message });
		}

		// Upsert emergency contact
		const { error: emergencyError } = await adminClient.from('employee_emergency_contact').upsert(
			{
				user_id: user.id,
				name: emergencyName,
				relationship: emergencyRelationship,
				phone: emergencyPhone
			},
			{ onConflict: 'user_id' }
		);

		if (emergencyError) {
			return fail(500, { error: emergencyError.message });
		}

		return { success: true, message: 'Information updated' };
	},

	submitFeedback: async ({ request, cookies }) => {
		const adminClient = getSupabaseAdminClient();

		if (!adminClient) {
			return fail(500, { error: 'Server error' });
		}

		const formData = await request.formData();
		const message = formData.get('message')?.toString()?.trim() ?? '';

		if (!message) {
			return fail(400, { error: 'Message is required' });
		}

		const { error } = await adminClient.from('feedback').insert({
			message,
			source: 'preboard'
		});

		if (error) {
			console.error('Error inserting feedback:', error);
			return fail(500, { error: 'Failed to submit feedback' });
		}

		return { success: true };
	}
};
