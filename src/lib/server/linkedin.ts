import { LINKEDIN_ACCESS_TOKEN, LINKEDIN_ORGANIZATION_ID } from '$env/static/private';
import type { LinkedInPost } from '$lib/types';

type FetchLinkedInOptions = {
	count?: number;
	orgId?: string;
	fetch?: typeof fetch;
};

type FetchLinkedInResult = {
	posts: LinkedInPost[];
	error?: string;
};

const DEFAULT_ORG_ID = '90364210';
const DEFAULT_COUNT = 4;
const FALLBACK_PERMALINK_PREFIX = 'https://www.linkedin.com/feed/update/';

type UGCShareContent = {
	'shareMediaCategory'?: string;
	shareCommentary?: { text?: string };
	media?: Array<{
		status?: string;
		originalUrl?: string;
		landingPage?: string;
		landingPageUrl?: string;
		landingPageTitle?: string;
		title?: { text?: string };
		description?: { text?: string };
		thumbnails?: Array<{ url?: string }>;
		callToActionLabel?: string;
		mediaType?: string;
	}>;
};

type RawUGCPost = {
	id?: string;
	permalink?: string;
	created?: { time?: number };
	lastModified?: { time?: number };
	specificContent?: { 'com.linkedin.ugc.ShareContent'?: UGCShareContent };
};

const formatBadgeLabel = (label?: string): string | undefined => {
	if (!label) return undefined;
	return label
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, (match) => match.toUpperCase());
};

const firstNonEmpty = (...values: Array<string | undefined>): string | undefined =>
	values.find((value) => Boolean(value?.trim()));

const normalizePost = (raw: RawUGCPost): LinkedInPost | null => {
	const id = raw.id;
	if (!id) return null;

	const shareContent = raw.specificContent?.['com.linkedin.ugc.ShareContent'];
	const mediaItems = shareContent?.media ?? [];
	const readyMedia =
		mediaItems.find((media) => media.status === 'READY') ??
		mediaItems.find((media) => Boolean(media.thumbnails?.length)) ??
		mediaItems[0];

	const mediaUrl =
		readyMedia?.thumbnails?.find((thumb) => Boolean(thumb.url))?.url ??
		readyMedia?.originalUrl;

	const summary =
		shareContent?.shareCommentary?.text?.trim() ??
		readyMedia?.description?.text?.trim() ??
		'';

	const title =
		firstNonEmpty(
			readyMedia?.title?.text,
			summary.split('\n').filter(Boolean)[0],
			shareContent?.shareMediaCategory
		) ?? 'LinkedIn Update';

	const publishedTimestamp =
		raw.created?.time ?? raw.lastModified?.time ?? Date.now();

	const permalink =
		firstNonEmpty(
			readyMedia?.landingPageUrl,
			readyMedia?.landingPage,
			readyMedia?.originalUrl,
			raw.permalink,
			id.startsWith('urn:li:') ? `${FALLBACK_PERMALINK_PREFIX}${id.split(':').pop()}` : undefined
		) ?? '#';

	return {
		id,
		title,
		summary,
		publishedAt: new Date(publishedTimestamp).toISOString(),
		link: permalink,
		mediaUrl: mediaUrl ?? undefined,
		mediaAlt:
			readyMedia?.description?.text ??
			readyMedia?.title?.text ??
			summary.split('\n').filter(Boolean)[0],
		badge: formatBadgeLabel(shareContent?.shareMediaCategory),
		ctaLabel: readyMedia?.callToActionLabel ?? 'View on LinkedIn'
	};
};

export const fetchLinkedInPosts = async (
	options: FetchLinkedInOptions = {}
): Promise<FetchLinkedInResult> => {
	const token = LINKEDIN_ACCESS_TOKEN;
	if (!token) {
		return {
			posts: [],
			error:
				'LinkedIn access token is not configured. Set LINKEDIN_ACCESS_TOKEN in your environment.'
		};
	}

	const organizationId = options.orgId ?? LINKEDIN_ORGANIZATION_ID ?? DEFAULT_ORG_ID;
	const count = Math.max(1, options.count ?? DEFAULT_COUNT);
	const fetchFn = options.fetch ?? fetch;

	const url = new URL('https://api.linkedin.com/v2/ugcPosts');
	url.search = new URLSearchParams({
		q: 'authors',
		authors: `List(urn:li:organization:${organizationId})`,
		sortBy: 'LAST_MODIFIED',
		count: String(count),
		projection:
			'(elements*(id,created,lastModified,permalink,specificContent(com.linkedin.ugc.ShareContent*(shareMediaCategory,shareCommentary,media))))'
	}).toString();

	try {
		const response = await fetchFn(url.toString(), {
			headers: {
				Authorization: `Bearer ${token}`,
				'X-Restli-Protocol-Version': '2.0.0',
				'Linkedin-Version': '202401',
				Accept: 'application/json'
			}
		});

		if (!response.ok) {
			const message = await response
				.text()
				.catch(() => `LinkedIn API responded with status ${response.status}`);
			console.error('[linkedin] Failed to fetch posts', response.status, message);
			return {
				posts: [],
				error: `Failed to load LinkedIn posts (status ${response.status}).`
			};
		}

		const data = await response.json();
		const rawPosts: RawUGCPost[] = Array.isArray(data?.elements) ? data.elements : [];
		const posts = rawPosts
			.map((post) => normalizePost(post))
			.filter((post): post is LinkedInPost => Boolean(post));

		return { posts };
	} catch (error) {
		console.error('[linkedin] Unexpected error when retrieving posts', error);
		return {
			posts: [],
			error: 'Unexpected error when retrieving LinkedIn posts.'
		};
	}
};
