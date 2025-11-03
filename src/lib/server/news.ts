import type { NewsPreviewItem } from '$lib/types';
import { getSupabaseAdminClient } from './supabase';

const clampText = (value: string | null | undefined, length = 180): string | null => {
	if (!value) return null;
	const trimmed = value.replace(/\s+/g, ' ').trim();
	if (!trimmed) return null;
	return trimmed.length > length ? `${trimmed.slice(0, length - 1).trimEnd()}…` : trimmed;
};

type FetchNewsResult = {
	posts: NewsPreviewItem[];
	error?: string;
};

export const fetchNewsPosts = async (): Promise<FetchNewsResult> => {
	const admin = getSupabaseAdminClient();

	if (!admin) {
		return {
			posts: [],
			error: 'Supabase client is not configured for news retrieval.'
		};
	}

	try {
		const { data, error } = await admin
			.from('articles')
			.select(
				'id, title, content, slug, linkedin_url, cover_image, published_at, created_at, article_kinds(name)'
			)
			.eq('status', 'published')
			.order('published_at', { ascending: false, nullsFirst: false })
			.order('created_at', { ascending: false })
			.limit(8);

		if (error) {
			throw error;
		}

		const posts =
			data?.map((article) => {
				const {
					id,
					title,
					content,
					slug,
					linkedin_url: linkedinUrl,
					cover_image: coverImageUrl,
					published_at: publishedAt,
					created_at: createdAt,
					article_kinds: kind
				} = article as {
					id: string;
					title: string;
					content: string | null;
					slug: string | null;
					linkedin_url: string | null;
					cover_image: string | null;
					published_at: string | null;
					created_at: string | null;
					article_kinds: { name: string } | null;
				};

				const href = slug ? `/news/${slug}` : linkedinUrl ?? '#';
			const ctaLabel = slug ? 'Read article' : linkedinUrl ? 'View on LinkedIn' : 'Learn more';

			return {
				id: String(id),
				title,
				summary: clampText(content, 210),
				publishedAt: publishedAt ?? createdAt ?? null,
				href,
				ctaLabel,
				coverImageUrl,
				coverImageAlt: title,
				badge: kind?.name ?? null
			} satisfies NewsPreviewItem;
			}) ?? [];

		return { posts };
	} catch (error) {
		console.error('[news] Failed to fetch published articles', error);
		return {
			posts: [],
			error: 'Failed to load news articles.'
		};
	}
};
