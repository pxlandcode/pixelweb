import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	AUTH_COOKIE_NAMES,
	createSupabaseServerClient,
	getSupabaseAdminClient
} from '$lib/server/supabase';
import type { CaseRecord } from '$lib/types';

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

// Map database records to CaseRecord type
const mapDatabaseRecord = (source: Record<string, unknown>): CaseRecord => {
	const isStringArray = (value: unknown): string[] | null => {
		if (!Array.isArray(value)) {
			return null;
		}
		const normalized = value
			.map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
			.filter((entry) => Boolean(entry));
		return normalized.length ? normalized : null;
	};

	const sanitizeImagePosition = (value: unknown): 'left' | 'right' | null => {
		if (value === 'left' || value === 'right') {
			return value;
		}
		return null;
	};

	const rawBullets = source['bullets'];
	const bullets = isStringArray(rawBullets);
	const imagePosition = source['image_position'];

	return {
		id: String(source['id'] ?? ''),
		eyebrow: (source['eyebrow'] as string | null | undefined) ?? null,
		title: (source['title'] as string | undefined) ?? '',
		description: (source['description'] as string | null | undefined) ?? null,
		bullets,
		img: (source['img'] as string | null | undefined) ?? null,
		imgAlt: (source['img_alt'] as string | null | undefined) ?? null,
		imagePosition: sanitizeImagePosition(imagePosition),
		bodyHtml: (source['body_html'] as string | null | undefined) ?? null,
		showOnMainPage: (source['show_on_main_page'] as boolean | undefined) ?? false,
		status: (source['status'] as string | undefined) === 'published' ? 'published' : 'draft',
		displayOrder: (source['display_order'] as number | undefined) ?? 1,
		created_at: (source['created_at'] as string | null | undefined) ?? null,
		updated_at: (source['updated_at'] as string | null | undefined) ?? null
	} satisfies CaseRecord;
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

	// Map database records to CaseRecord type with proper field name conversion
	const mappedCases = (cases ?? []).map((caseData) =>
		mapDatabaseRecord(caseData as Record<string, unknown>)
	);

	return {
		cases: mappedCases
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

		// Get the highest display_order and add 1 for new cases
		const { data: maxOrderCase } = await adminSupabase
			.from('cases')
			.select('display_order')
			.order('display_order', { ascending: false })
			.limit(1)
			.single();

		const nextDisplayOrder = (maxOrderCase?.display_order ?? 0) + 1;

		const { error } = await adminSupabase.from('cases').insert({
			title,
			eyebrow: eyebrow || null,
			description: description || null,
			bullets: bullets || null,
			img: img || null,
			img_alt: img ? title : null,
			image_position: imagePosition === 'left' ? 'left' : 'right',
			body_html: bodyHtml || null,
			status: 'draft', // Default to draft
			show_on_main_page: false, // Default to hidden
			display_order: nextDisplayOrder
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

		// Only update content fields, not status/visibility/order
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
	},
	reorder: async ({ request, cookies }) => {
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
		const updatesStr = parseString(formData.get('updates'));

		if (!updatesStr) {
			return fail(400, { type: 'update', ok: false, message: 'Missing update data.' });
		}

		let updates: Array<{ id: string; displayOrder: number }> = [];
		try {
			updates = JSON.parse(updatesStr);
		} catch {
			return fail(400, { type: 'update', ok: false, message: 'Invalid update data.' });
		}

		// Update each case's display order
		for (const { id, displayOrder } of updates) {
			const { error } = await adminSupabase
				.from('cases')
				.update({ display_order: displayOrder })
				.eq('id', id);

			if (error) {
				return fail(500, { type: 'update', ok: false, message: error.message });
			}
		}

		return {
			type: 'update',
			ok: true,
			message: 'Cases reordered successfully.'
		} satisfies CaseActionResult;
	},
	toggleMainPage: async ({ request, cookies }) => {
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
		const showOnMainPage = formData.get('showOnMainPage') === 'true';

		if (!id) {
			return fail(400, { type: 'update', ok: false, message: 'Missing case identifier.' });
		}

		const { error } = await adminSupabase
			.from('cases')
			.update({ show_on_main_page: showOnMainPage })
			.eq('id', id);

		if (error) {
			return fail(500, { type: 'update', ok: false, message: error.message });
		}

		return {
			type: 'update',
			ok: true,
			message: 'Case visibility updated successfully.'
		} satisfies CaseActionResult;
	},
	toggleStatus: async ({ request, cookies }) => {
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
		const status = parseString(formData.get('status'));

		if (!id) {
			return fail(400, { type: 'update', ok: false, message: 'Missing case identifier.' });
		}

		if (status !== 'draft' && status !== 'published') {
			return fail(400, { type: 'update', ok: false, message: 'Invalid status.' });
		}

		const { error } = await adminSupabase.from('cases').update({ status }).eq('id', id);

		if (error) {
			return fail(500, { type: 'update', ok: false, message: error.message });
		}

		return {
			type: 'update',
			ok: true,
			message: `Case ${status === 'published' ? 'published' : 'saved as draft'} successfully.`
		} satisfies CaseActionResult;
	}
};
