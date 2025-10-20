import { json, error, type RequestHandler } from '@sveltejs/kit';
import {
	BRAVE_AI_GROUNDING_KEY,
	BRAVE_SEARCH_KEY,
	ENABLE_GROUNDING,
	ENABLE_RANKING
} from '$env/static/private';
import { extractMainContent, extractTitle, normaliseWhitespace } from '$lib/server/analyzers';
import type { PresenceGroundingEntry } from '$lib/server/llmScore';
import { openai } from '$lib/server/openai';

const rankingEnabled = ENABLE_RANKING?.trim() === '1';
const groundingEnabled = ENABLE_GROUNDING?.trim() === '1' && !!BRAVE_AI_GROUNDING_KEY;
const REQUEST_TIMEOUT = 10_000;
const PRESENCE_USER_AGENT =
	'Mozilla/5.0 (compatible; PixelPresenceBot/1.0; +https://pixelcode.se/ai-compatibility-checker)';

const fetchWithTimeout = async (
	fetcher: typeof fetch,
	input: RequestInfo | URL,
	init: RequestInit = {}
): Promise<Response> => {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
	try {
		return await fetcher(input, { ...init, signal: controller.signal });
	} finally {
		clearTimeout(timeout);
	}
};

const parseJsonResponse = async <T>(res: Response, label: string): Promise<T | undefined> => {
	const contentType = res.headers.get('content-type') ?? '';
	const body = await res.text().catch(() => '');
	if (!contentType.toLowerCase().includes('application/json')) {
		console.warn(
			`[presence] ${label} unexpected content type`,
			res.status,
			res.url,
			contentType || 'unknown',
			body.slice(0, 160)
		);
		return undefined;
	}
	try {
		return JSON.parse(body) as T;
	} catch (error) {
		console.warn(`[presence] ${label} JSON parse failed`, error, body.slice(0, 160));
		return undefined;
	}
};

const STOPWORDS = new Set(
	[
		'about',
		'agency',
		'and',
		'are',
		'company',
		'digital',
		'experience',
		'for',
		'from',
		'global',
		'innovative',
		'leading',
		'platform',
		'services',
		'solutions',
		'software',
		'that',
		'the',
		'their',
		'this',
		'with'
	].map((token) => token.toLowerCase())
);

const stripTags = (input: string): string => input.replace(/<[^>]*>/g, ' ');

const decodeHtmlEntities = (input: string): string =>
	input
		.replace(/&amp;/gi, '&')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/&nbsp;/gi, ' ');

const extractJsonPayload = (raw: string): any => {
	const trimmed = raw.trim();
	if (!trimmed) return {};

	const parseAttempt = (value: string) => {
		try {
			return JSON.parse(value);
		} catch {
			return undefined;
		}
	};

	const direct = parseAttempt(trimmed);
	if (direct !== undefined) return direct;

	const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
	if (fencedMatch) {
		const fencedParsed = parseAttempt(fencedMatch[1] ?? '');
		if (fencedParsed !== undefined) return fencedParsed;
	}

	const start = trimmed.indexOf('{');
	if (start === -1) return {};
	let depth = 0;
	for (let i = start; i < trimmed.length; i += 1) {
		const char = trimmed[i];
		if (char === '{') depth += 1;
		else if (char === '}') {
			depth -= 1;
			if (depth === 0) {
				const candidate = trimmed.slice(start, i + 1);
				const parsed = parseAttempt(candidate);
				if (parsed !== undefined) return parsed;
				break;
			}
		}
	}

	return {};
};

const extractMeta = (html: string): string[] => {
	const matches = html.matchAll(
		/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)["'][^>]*>/gi
	);
	return Array.from(matches, (match) => normaliseWhitespace(match[1] ?? ''));
};

const extractHeadings = (html: string, limit = 4): string[] => {
	const matches = html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi);
	return Array.from(matches)
		.slice(0, limit)
		.map((match) => normaliseWhitespace(stripTags(match[1] ?? '')))
		.filter((value) => value.length > 0);
};

const extractKeyPhrases = (text: string, limit = 6): string[] => {
	const tokens = text
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.split(/\s+/)
		.filter((token) => token.length >= 3 && token.length <= 20);
	const frequency = new Map<string, number>();
	for (let i = 0; i < tokens.length - 1; i += 1) {
		const first = tokens[i]!;
		const second = tokens[i + 1]!;
		if (STOPWORDS.has(first) || STOPWORDS.has(second)) {
			continue;
		}
		const phrase = `${first} ${second}`;
		frequency.set(phrase, (frequency.get(phrase) ?? 0) + 1);
	}
	return Array.from(frequency.entries())
		.sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
		.map(([phrase]) => phrase)
		.slice(0, limit);
};

const summariseHighlights = async (brand: string, text: string): Promise<string[]> => {
	const sample = text.split(/\s+/).slice(0, 600).join(' ').trim();
	if (!sample) return [];
	try {
		const response = await openai.responses.create({
			model: 'gpt-4.1-mini',
			temperature: 0.1,
			max_output_tokens: 180,
			input: [
				{
					role: 'system',
					content:
						'You write tight marketing bullets. Return JSON {"highlights": string[]} with up to three points (<=12 words) describing what the company offers.'
				},
				{
					role: 'user',
					content: `Brand: ${brand}\nCopy:\n${sample}`
				}
			]
		});
		const rawContent = response.output_text ?? '';
		console.log('[presence] highlight raw response', rawContent.slice(0, 400));
		const payload = extractJsonPayload(rawContent);
		const items = Array.isArray(payload.highlights) ? payload.highlights : [];
		return items
			.filter(
				(entry: unknown): entry is string => typeof entry === 'string' && entry.trim().length > 0
			)
			.map((entry: string) => entry.trim())
			.slice(0, 3);
	} catch (error) {
		console.warn('[presence] highlight summary failed', error);
		return [];
	}
};

type QuerySuggestion = { query: string; highlight?: string };

type RankResult = { rank?: number; matchedUrl?: string };

const buildDefaultQueries = async (
	fetcher: typeof fetch,
	target: URL,
	provided: string[] | undefined
): Promise<QuerySuggestion[]> => {
	if (provided && provided.length > 0) {
		return provided.map((query) => ({ query }));
	}

	try {
		const res = await fetchWithTimeout(fetcher, target.href, {
			headers: { 'user-agent': 'PixelPresenceBot/1.0' }
		});
		if (!res.ok) {
			return [];
		}
		const html = await res.text();
		const title = extractTitle(html) ?? target.hostname;
		const { text } = extractMainContent(html);
		const normalized = normaliseWhitespace(text);
		const brand = decodeHtmlEntities(title.split(/[-|–]/)[0]?.trim() || target.hostname);

		const keyPhrases = extractKeyPhrases(normalized.slice(0, 1_200));
		const descriptions = extractMeta(html);
		const headings = extractHeadings(html);
		const fallbackHighlights = [...headings, ...descriptions, ...keyPhrases].slice(0, 3);
		const aiHighlights = await summariseHighlights(brand, normalized);
		const highlights = aiHighlights.length > 0 ? aiHighlights : fallbackHighlights;

		const cityMatch = normalized.match(/\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
		const city = cityMatch?.[1];

		const queries = new Set<string>();
		queries.add(`what does ${brand} do`);
		queries.add(`${brand} reviews`);

		for (const phrase of keyPhrases.slice(0, 3)) {
			queries.add(`${brand} ${phrase}`);
			if (city) {
				queries.add(`${phrase} ${city}`);
			} else {
				const [firstWord] = phrase.split(' ');
				queries.add(`${phrase} pricing`);
				if (firstWord) {
					queries.add(`${firstWord} for ${brand.split(' ')[0] ?? 'businesses'}`);
				}
			}
		}

		const ordered = Array.from(queries).slice(0, 6);
		return ordered.map((query, index) => ({
			query,
			highlight:
				highlights.length > 0
					? highlights[index % highlights.length]
					: fallbackHighlights.length > 0
						? fallbackHighlights[index % fallbackHighlights.length]
						: undefined
		}));
	} catch (error) {
		console.warn('[presence] default query build failed', error);
		return [];
	}
};

const normaliseHost = (host: string): string => host.replace(/^www\./, '').toLowerCase();

const findRank = (host: string, url: string): boolean => {
	try {
		const target = new URL(url);
		const candidate = normaliseHost(target.hostname);
		const expected = normaliseHost(host);
		return candidate === expected || candidate.endsWith(`.${expected}`);
	} catch {
		return false;
	}
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runBraveSearch = async (
	fetcher: typeof fetch,
	query: string,
	host: string
): Promise<RankResult> => {
	if (!BRAVE_SEARCH_KEY) return {};
	try {
		console.log('[presence] brave search request', { query, host });
		const offsets = [0, 20, 40];
		for (const offset of offsets) {
			let attempt = 0;
			let res: Response | undefined;

			while (attempt < 2) {
				const candidate = await fetchWithTimeout(
					fetcher,
					`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=20&offset=${offset}`,
					{
						headers: {
							'X-Subscription-Token': BRAVE_SEARCH_KEY,
							Accept: 'application/json',
							'User-Agent': PRESENCE_USER_AGENT
						}
					}
				);

				console.log('[presence] brave search response', {
					status: candidate.status,
					redirected: candidate.redirected,
					finalUrl: candidate.url,
					contentType: candidate.headers.get('content-type'),
					offset,
					attempt
				});

				if (candidate.status === 429) {
					attempt += 1;
					const waitMs = 500 * attempt;
					console.warn('[presence] brave search rate limited', {
						query,
						offset,
						attempt,
						waitMs
					});
					await sleep(waitMs);
					continue;
				}

				res = candidate;
				break;
			}

			if (!res) {
				continue;
			}

			if (!res.ok) {
				console.warn('[presence] brave search failed', res.status);
				return {};
			}
			const payload = await parseJsonResponse<{ web?: { results?: Array<{ url: string }> } }>(
				res,
				'brave search'
			);
			if (!payload) {
				return {};
			}
			const results = payload.web?.results ?? [];
			const index = results.findIndex((entry) => findRank(host, entry.url));
			if (index !== -1) {
				return { rank: offset + index + 1, matchedUrl: results[index]?.url };
			}
			if (results.length < 20) {
				break;
			}
		}
		return {};
	} catch (error) {
		console.warn('[presence] brave lookup failed', error);
		return {};
	}
};

const runOpenAISearch = async (query: string, host: string): Promise<RankResult> => {
	try {
		const response = await openai.responses.create({
			model: 'gpt-4.1-mini',
			temperature: 0,
			tools: [{ type: 'web_search' }],
			max_output_tokens: 120,
			input: [
				{
					role: 'system',
					content:
						'You judge web search results. Use the web_search tool and return JSON {"rank": number|null, "matchedUrl": string|null} for the provided domain.'
				},
				{
					role: 'user',
					content: `Query: ${query}\nTarget domain: ${host}`
				}
			]
		});
		const rawContent = response.output_text ?? '';
		console.log('[presence] openai search raw response', rawContent.slice(0, 400));
		const payload = extractJsonPayload(rawContent);
		const rankValue = Number(payload.rank);
		const rank = Number.isFinite(rankValue) ? rankValue : undefined;
		const matchedUrl =
			typeof payload.matchedUrl === 'string' && payload.matchedUrl.trim().length > 0
				? payload.matchedUrl.trim()
				: undefined;
		return { rank: rank ?? undefined, matchedUrl };
	} catch (error) {
		console.warn('[presence] openai search failed', error);
		return {};
	}
};

const normaliseCitations = (input: unknown): PresenceGroundingEntry['citations'] => {
	if (!Array.isArray(input)) return [];
	const result: PresenceGroundingEntry['citations'] = [];

	for (const raw of input) {
		if (!raw || typeof raw !== 'object') continue;
		const record = raw as Record<string, unknown>;
		const urlCandidate =
			typeof record.url === 'string'
				? record.url
				: typeof record.link === 'string'
					? record.link
					: undefined;
		if (!urlCandidate) continue;

		const title =
			typeof record.title === 'string'
				? record.title
				: typeof record.name === 'string'
					? record.name
					: undefined;
		const scoreValue = Number(record.score ?? record.relevance ?? record.confidence);
		const score = Number.isFinite(scoreValue) ? scoreValue : undefined;

		result.push({ url: urlCandidate, title, score });
	}

	return result;
};

const runBraveGrounding = async (
	fetcher: typeof fetch,
	query: string,
	host: string
): Promise<PresenceGroundingEntry | undefined> => {
	if (!groundingEnabled || !BRAVE_AI_GROUNDING_KEY) return undefined;

	try {
		console.log('[presence] brave grounding request', { query, host });

		const res = await fetchWithTimeout(
			fetcher,
			'https://api.search.brave.com/res/v1/chat/completions',
			{
				method: 'POST',
				headers: {
					'X-Subscription-Token': BRAVE_AI_GROUNDING_KEY,
					Accept: 'application/json',
					'Content-Type': 'application/json',
					'User-Agent': PRESENCE_USER_AGENT
				},
				body: JSON.stringify({
					model: 'brave',
					messages: [{ role: 'user', content: query }],
					grounding: { enabled: true },
					stream: false,
					temperature: 0.3,
					max_output_tokens: 400
				})
			}
		);

		console.log('[presence] brave grounding response', {
			status: res.status,
			redirected: res.redirected,
			finalUrl: res.url,
			contentType: res.headers.get('content-type')
		});

		if (!res.ok) {
			const body = await res.text();
			console.warn('[presence] brave grounding failed', res.status, body.slice(0, 300));
			return undefined;
		}

		const payload = await parseJsonResponse<Record<string, any>>(res, 'brave grounding');
		if (!payload) return undefined;

		const citations =
			payload?.choices?.[0]?.grounding?.citations ??
			payload?.grounding?.citations ??
			payload?.citations ??
			[];

		const deduped: PresenceGroundingEntry['citations'] = normaliseCitations(citations);
		const cited = deduped.some((entry) => findRank(host, entry.url));

		return {
			query,
			engine: 'brave-ai',
			cited,
			citations: deduped.slice(0, 20)
		};
	} catch (error) {
		console.warn('[presence] brave grounding lookup failed', error);
		return undefined;
	}
};

export const POST: RequestHandler = async ({ request, fetch }) => {
	if (!rankingEnabled) {
		throw error(404, 'Ranking module disabled');
	}

	const body = await request.json().catch(() => {
		throw error(400, 'Invalid JSON payload.');
	});

	const url = typeof body.url === 'string' ? body.url.trim() : '';
	if (!url) {
		throw error(400, 'URL is required.');
	}

	let target: URL;
	try {
		target = new URL(url);
	} catch {
		throw error(400, 'URL is invalid.');
	}

	const providedQueries = Array.isArray(body.queries)
		? body.queries.filter(
				(entry: unknown): entry is string => typeof entry === 'string' && entry.trim().length > 0
			)
		: undefined;

	const queries = await buildDefaultQueries(fetch, target, providedQueries);
	const host = normaliseHost(target.hostname);

	const serp: Array<{ query: string; engine: string; rank?: number; matchedUrl?: string }> = [];
	const grounding: PresenceGroundingEntry[] = [];
	for (const suggestion of queries) {
		const braveRank = await runBraveSearch(fetch, suggestion.query, host);
		serp.push({
			query: suggestion.query,
			engine: 'brave',
			rank: braveRank.rank,
			matchedUrl: braveRank.matchedUrl
		});

		const openaiRank = await runOpenAISearch(suggestion.query, host);
		serp.push({
			query: suggestion.query,
			engine: 'openai',
			rank: openaiRank.rank,
			matchedUrl: openaiRank.matchedUrl
		});

		const groundingEntry = await runBraveGrounding(fetch, suggestion.query, host);
		if (groundingEntry) {
			grounding.push(groundingEntry);
		}
	}

	// TODO: Hook LLM citation verification for rankings.

	return json({ queries, serp, grounding: grounding.length > 0 ? grounding : undefined });
};
