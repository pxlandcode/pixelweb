import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchNewsPosts } from '$lib/server/news';

export const GET: RequestHandler = async ({ url }) => {
	const offset = parseInt(url.searchParams.get('offset') || '0', 10);
	const limit = parseInt(url.searchParams.get('limit') || '8', 10);

	// Validate parameters
	if (offset < 0 || limit < 1 || limit > 50) {
		return json({ error: 'Invalid pagination parameters' }, { status: 400 });
	}

	const result = await fetchNewsPosts(limit, offset);

	return json(result);
};
