import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	AUTH_COOKIE_NAMES,
	createSupabaseServerClient,
	getSupabaseAdminClient
} from '$lib/server/supabase';

type CaseActionResult = { type: 'create' | 'update' | 'delete'; ok: boolean; message: string };

const parseString = (value: FormDataEntryValue | null) =>
	typeof value === 'string' ? value.trim() : '';

const parseStringArray = (value: FormDataEntryValue | null): string[] | null => {
	if (typeof value !== 'string') {
		return null;
	}

	const items = value
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);

	return items.length > 0 ? items : null;
};

const ensureAuthenticated = (cookies: import('@sveltejs/kit').Cookies) => {
	return createSupabaseServerClient(cookies.get(AUTH_COOKIE_NAMES.access) ?? null);
};

export const load: PageServerLoad = async ({ cookies }) => {
	const supabase = ensureAuthenticated(cookies);

	if (!supabase) {
		return { cases: [] };
	}

	const adminSupabase = getSupabaseAdminClient();

	if (!adminSupabase) {
		console.error('[admin/cases] Service role client is not configured.');
		return { cases: [] };
	}

	const { data: cases } = await adminSupabase
		.from('cases')
		.select('*')
		.order('created_at', { ascending: false });

	return {
		cases: cases ?? []
	};
};

export const actions: Actions = {
	create: async ({ request, cookies }) => {
		const supabase = ensureAuthenticated(cookies);

		if (!supabase) {
			return fail(401, {
				type: 'create',
				ok: false,
				message: 'You are not authenticated.'
			} satisfies CaseActionResult);
		}

		const adminSupabase = getSupabaseAdminClient();

		if (!adminSupabase) {
			console.error('[admin/cases] Service role client is not configured.');
			return fail(500, {
				type: 'create',
				ok: false,
				message: 'Service is temporarily unavailable. Please contact an administrator.'
			});
		}

		const formData = await request.formData();
		const title = parseString(formData.get('title'));
		const eyebrow = parseString(formData.get('eyebrow'));
		const description = parseString(formData.get('description'));
		const bullets = parseStringArray(formData.get('bullets'));
		const img = parseString(formData.get('img'));
		const imagePosition = parseString(formData.get('imagePosition')) || 'right';
		const bodyHtml = parseString(formData.get('bodyHtml'));

		if (!title) {
			return fail(400, { type: 'create', ok: false, message: 'Title is required.' });
		}

		const { error } = await adminSupabase.from('cases').insert({
			title,
			eyebrow: eyebrow || null,
			description: description || null,
			bullets: bullets || null,
			img: img || null,
			img_alt: img ? title : null,
			image_position: imagePosition === 'left' ? 'left' : 'right',
			body_html: bodyHtml || null
		});

		if (error) {
			return fail(500, { type: 'create', ok: false, message: error.message });
		}

		return {
			type: 'create',
			ok: true,
			message: 'Case created successfully.'
		} satisfies CaseActionResult;
	},
	update: async ({ request, cookies }) => {
		const supabase = ensureAuthenticated(cookies);

		if (!supabase) {
			return fail(401, { type: 'update', ok: false, message: 'You are not authenticated.' });
		}

		const adminSupabase = getSupabaseAdminClient();

		if (!adminSupabase) {
			console.error('[admin/cases] Service role client is not configured.');
			return fail(500, {
				type: 'update',
				ok: false,
				message: 'Service is temporarily unavailable. Please contact an administrator.'
			});
		}

		const formData = await request.formData();
		const id = parseString(formData.get('id'));
		const title = parseString(formData.get('title'));
		const eyebrow = parseString(formData.get('eyebrow'));
		const description = parseString(formData.get('description'));
		const bullets = parseStringArray(formData.get('bullets'));
		const img = parseString(formData.get('img'));
		const imagePosition = parseString(formData.get('imagePosition')) || 'right';
		const bodyHtml = parseString(formData.get('bodyHtml'));

		if (!id) {
			return fail(400, { type: 'update', ok: false, message: 'Missing case identifier.' });
		}

		if (!title) {
			return fail(400, { type: 'update', ok: false, message: 'Title is required.' });
		}

		const { error } = await adminSupabase
			.from('cases')
			.update({
				title,
				eyebrow: eyebrow || null,
				description: description || null,
				bullets: bullets || null,
				img: img || null,
				img_alt: img ? title : null,
				image_position: imagePosition === 'left' ? 'left' : 'right',
				body_html: bodyHtml || null
			})
			.eq('id', id);

		if (error) {
			return fail(500, { type: 'update', ok: false, message: error.message });
		}

		return {
			type: 'update',
			ok: true,
			message: 'Case updated successfully.'
		} satisfies CaseActionResult;
	},
	delete: async ({ request, cookies }) => {
		const supabase = ensureAuthenticated(cookies);

		if (!supabase) {
			return fail(401, { type: 'delete', ok: false, message: 'You are not authenticated.' });
		}

		const adminSupabase = getSupabaseAdminClient();

		if (!adminSupabase) {
			console.error('[admin/cases] Service role client is not configured.');
			return fail(500, {
				type: 'delete',
				ok: false,
				message: 'Service is temporarily unavailable. Please contact an administrator.'
			});
		}

		const formData = await request.formData();
		const id = parseString(formData.get('id'));

		if (!id) {
			return fail(400, { type: 'delete', ok: false, message: 'Missing case identifier.' });
		}

		const { error } = await adminSupabase.from('cases').delete().eq('id', id);

		if (error) {
			return fail(500, { type: 'delete', ok: false, message: error.message });
		}

		return {
			type: 'delete',
			ok: true,
			message: 'Case deleted successfully.'
		} satisfies CaseActionResult;
	}
};
