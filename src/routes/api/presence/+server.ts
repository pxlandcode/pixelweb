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
const REQUEST_TIMEOUT = 25_000;
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

const getRegistrableDomain = (url: URL): string => {
	const hostname = url.hostname.replace(/^www\./i, '');
	const parts = hostname.split('.');
	if (parts.length <= 2) {
		return hostname || url.hostname;
	}
	return parts.slice(-2).join('.');
};

const extractOpenGraph = (html: string, prop: string): string | undefined => {
	const pattern = new RegExp(
		`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`,
		'i'
	);
	const match = html.match(pattern);
	return decodeHtmlEntities(match?.[1]?.trim() ?? '') || undefined;
};

const deriveBrand = (html: string, target: URL): string => {
	const ogSite = extractOpenGraph(html, 'og:site_name');
	const ogTitle = extractOpenGraph(html, 'og:title');
	const domain = getRegistrableDomain(target);
	const fallbackDomain = domain || target.hostname.replace(/^www\./i, '');
	const candidate =
		ogSite ||
		(ogTitle && ogTitle.split(/[–|-]/)[0]?.trim()) ||
		fallbackDomain;
	const badStarts = ['prisvärda', 'affordable', 'welcome to', 'home of'];
	const cleaned = candidate.replace(/[“”"']/g, '').trim();
	const head = cleaned.split(/\s+/)[0]?.toLowerCase();
	if (head && badStarts.includes(head)) {
		const shortDomain = fallbackDomain.split('.')[0] ?? fallbackDomain;
		return shortDomain.toUpperCase();
	}
	return cleaned || fallbackDomain;
};

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
						'You write tight marketing bullets. Respond ONLY with JSON {"highlights": string[]} (up to three items, <=12 words each) describing what the company offers. No extra text.'
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

const genCustomerQuestions = async (
	brand: string,
	sample: string,
	locale: 'sv' | 'en'
): Promise<string[]> => {
	const prompt =
		locale === 'sv'
			? `Du är en kund som funderar på ${brand}. Skriv 4–6 naturliga frågor en kund skulle söka på, baserat på texten. Variera frågetyper (vad, hur, pris, support, leverans, tjänster). Svara som JSON {"questions": string[]}.`
			: `You are a prospective customer of ${brand}. Write 4–6 natural search questions a customer would ask, based on the text. Vary topics (what, how, pricing, support, delivery, services). Return JSON {"questions": string[]}.`;

	try {
		const response = await openai.responses.create({
			model: 'gpt-4.1-mini',
			temperature: 0.2,
			max_output_tokens: 200,
			text: {
				format: {
					type: 'json_schema',
					name: 'CustomerQuestions',
					schema: {
						type: 'object',
						properties: {
							questions: {
								type: 'array',
								items: { type: 'string' },
								minItems: 4,
								maxItems: 6
							}
						},
						required: ['questions'],
						additionalProperties: false
					}
				}
			},
			input: [
				{ role: 'system', content: 'Return only the specified JSON.' },
				{ role: 'user', content: `Brand: ${brand}\nCopy:\n${sample.slice(0, 2000)}` },
				{ role: 'user', content: prompt }
			]
		});
		const raw = response.output_text ?? '{"questions": []}';
		let payload: { questions?: unknown };
		try {
			payload = JSON.parse(raw);
		} catch {
			payload = { questions: [] };
		}
		if (!Array.isArray(payload.questions)) return [];
		return payload.questions
			.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
			.map((entry) => entry.trim());
	} catch (error) {
		console.warn('[presence] customer question generation failed', error);
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
		const brand =
			decodeHtmlEntities(deriveBrand(html, target) || title).trim() ||
			target.hostname;

		const keyPhrases = extractKeyPhrases(normalized.slice(0, 1_200));
		const descriptions = extractMeta(html);
		const headings = extractHeadings(html);
		const fallbackHighlights = [...headings, ...descriptions, ...keyPhrases].slice(0, 3);
		const aiHighlights = await summariseHighlights(brand, normalized);
		const highlights = aiHighlights.length > 0 ? aiHighlights : fallbackHighlights;

		const cityMatch = normalized.match(/\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
		const city = cityMatch?.[1];

		const isSwedish = /[åäöÅÄÖ]/.test(normalized) || /Sverige|svenska|kr/.test(normalized);
		const locale: 'sv' | 'en' = isSwedish ? 'sv' : 'en';
		const aiQs = await genCustomerQuestions(brand, normalized, locale);
		const baseQs =
			locale === 'sv'
				? [`vad gör ${brand}`.trim(), `${brand} priser`.trim()]
				: [`what does ${brand} do`.trim(), `${brand} pricing`.trim()];

		const queryList = new Set<string>();
		for (const query of [...baseQs, ...aiQs]) {
			if (query && query.trim().length > 0) {
				queryList.add(query.trim());
			}
		}

		if (queryList.size < 4) {
			for (const phrase of keyPhrases.slice(0, 3)) {
				const trimmedPhrase = phrase.trim();
				if (!trimmedPhrase) continue;
				const base = `${brand} ${trimmedPhrase}`.trim();
				if (base) queryList.add(base);
				if (city) {
					const localised = `${trimmedPhrase} ${city}`.trim();
					if (localised) queryList.add(localised);
				} else {
					const priced =
						locale === 'sv'
							? `${trimmedPhrase} priser`.trim()
							: `${trimmedPhrase} pricing`.trim();
					if (priced) queryList.add(priced);
				}
			}
		}

		const ordered = Array.from(queryList).slice(0, 6);
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
		const safeQuery = query.replace(/&/g, ' and ');
		let previousPageFull = true;
		for (const offset of offsets) {
			if (offset > 0 && !previousPageFull) break;
			let attempt = 0;
			let res: Response | undefined;

			while (attempt < 2) {
				const candidate = await fetchWithTimeout(
					fetcher,
					`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(safeQuery)}&count=20&offset=${offset}`,
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
				if (res.status === 422) {
					console.warn('[presence] brave search validation failed', {
						query,
						host,
						offset,
						status: res.status
					});
					break;
				}
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
			const domain = normaliseHost(host);
			let matchedUrl: string | undefined;
			let index = -1;
			for (let i = 0; i < results.length; i += 1) {
				const entry = results[i];
				if (!entry?.url) continue;
				try {
					const candidateHost = normaliseHost(new URL(entry.url).hostname);
					if (candidateHost === domain || candidateHost.endsWith(`.${domain}`)) {
						matchedUrl = entry.url;
						index = i;
						break;
					}
				} catch {
					continue;
				}
			}
			if (index !== -1) {
				return { rank: offset + index + 1, matchedUrl };
			}
			previousPageFull = results.length >= 20;
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
			text: {
				format: {
					type: 'json_schema',
					name: 'SearchJudgement',
					schema: {
						type: 'object',
						properties: {
							rank: { type: ['integer', 'null'] },
							matchedUrl: { type: ['string', 'null'] }
						},
						required: ['rank', 'matchedUrl'],
						additionalProperties: false
					}
				}
			},
			max_output_tokens: 120,
			input: [
				{
					role: 'system',
					content:
						'You judge web search results. Use the web_search tool and respond ONLY with JSON of the form {"rank": number|null, "matchedUrl": string|null}. Use null when unsure. Do not include any extra text.'
				},
				{
					role: 'user',
					content: `Query: ${query}\nTarget domain: ${host}`
				}
			]
		});
		const rawContent = response.output_text ?? '';
		console.log('[presence] openai search raw response', rawContent.slice(0, 400));
		let payload: { rank: unknown; matchedUrl: unknown };
		try {
			payload = JSON.parse(rawContent || '{"rank":null,"matchedUrl":null}');
		} catch {
			payload = { rank: null, matchedUrl: null };
		}
		if (!payload || typeof payload !== 'object') {
			payload = { rank: null, matchedUrl: null };
		}
		const rawRank = Number(payload.rank);
		const rank = Number.isFinite(rawRank) && rawRank >= 1 ? rawRank : undefined;
		const matchedUrl =
			typeof payload.matchedUrl === 'string' && payload.matchedUrl.trim().length > 0
				? payload.matchedUrl.trim()
				: undefined;
		return { rank, matchedUrl };
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

		console.log('[presence] brave grounding raw', JSON.stringify(payload, null, 2).slice(0, 800));

		const citations =
			payload?.choices?.[0]?.message?.grounding?.citations ??
			payload?.choices?.[0]?.grounding?.citations ??
			payload?.grounding?.citations ??
			payload?.citations ??
			[];

		const deduped: PresenceGroundingEntry['citations'] = normaliseCitations(citations);
		const cited = deduped.some((entry) => findRank(host, entry.url));
		if (!cited || deduped.length === 0) {
			console.warn(
				'[presence] grounding had no citations matching host; discarding text',
				{ query, host, cited, citationCount: deduped.length }
			);
			return undefined;
		}

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
