import { json, error, type RequestHandler } from '@sveltejs/kit';
import {
        BING_SEARCH_KEY,
        BRAVE_AI_GROUNDING_KEY,
        BRAVE_SEARCH_KEY,
        ENABLE_GROUNDING,
        ENABLE_RANKING
} from '$env/static/private';
import { extractMainContent, extractTitle, normaliseWhitespace } from '$lib/server/analyzers';
import type { PresenceGroundingEntry } from '$lib/server/llmScore';

const rankingEnabled = ENABLE_RANKING?.trim() === '1';
const groundingEnabled = ENABLE_GROUNDING?.trim() === '1' && !!BRAVE_AI_GROUNDING_KEY;
const REQUEST_TIMEOUT = 10_000;

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

const buildDefaultQueries = async (
        fetcher: typeof fetch,
        target: URL,
        provided: string[] | undefined
): Promise<string[]> => {
        if (provided && provided.length > 0) {
                return provided;
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
                const brand = title.split(/[-|–]/)[0]?.trim() || target.hostname;
                const tokens = normalized
                        .split(' ')
                        .filter((token) => token.length > 5 && /^[A-Za-z]+$/.test(token))
                        .map((token) => token.toLowerCase());
                const stopwords = new Set([
                        'services',
                        'solutions',
                        'company',
                        'digital',
                        'marketing',
                        'agency',
                        'platform',
                        'software',
                        'experience',
                        'design',
                        'product'
                ]);
                const serviceTerm = tokens.find((token) => !stopwords.has(token));
                const cityMatch = normalized.match(/\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
                const city = cityMatch?.[1];
                const queries: string[] = [];
                queries.push(`what does ${brand} do`);
                if (serviceTerm) {
                        queries.push(`${brand} ${serviceTerm}`);
                        if (city) {
                                queries.push(`${serviceTerm} ${city}`);
                        } else {
                                queries.push(`${serviceTerm} pricing`);
                        }
                } else {
                        queries.push(`${brand} services`);
                        queries.push(`${brand} reviews`);
                }
                return queries;
        } catch (error) {
                console.warn('[presence] default query build failed', error);
                return [];
        }
};

const findRank = (host: string, url: string): boolean => {
        try {
                const target = new URL(url);
                return target.hostname.replace(/^www\./, '') === host;
        } catch {
                return false;
        }
};

const runBingSearch = async (
        fetcher: typeof fetch,
        query: string,
        host: string
): Promise<number | undefined> => {
        if (!BING_SEARCH_KEY) return undefined;
        try {
                const res = await fetchWithTimeout(
                        fetcher,
                        `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=50`,
                        {
                                headers: {
                                        'Ocp-Apim-Subscription-Key': BING_SEARCH_KEY,
                                        Accept: 'application/json'
                                }
                        }
                );
                if (!res.ok) {
                        console.warn('[presence] bing search failed', res.status);
                        return undefined;
                }
                const payload = (await res.json()) as { webPages?: { value?: Array<{ url: string }> } };
                const results = payload.webPages?.value ?? [];
                const index = results.findIndex((entry) => findRank(host, entry.url));
                return index === -1 ? undefined : index + 1;
        } catch (error) {
                console.warn('[presence] bing lookup failed', error);
                return undefined;
        }
};

const runBraveSearch = async (
        fetcher: typeof fetch,
        query: string,
        host: string
): Promise<number | undefined> => {
        if (!BRAVE_SEARCH_KEY) return undefined;
        try {
                const res = await fetchWithTimeout(
                        fetcher,
                        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=50`,
                        {
                                headers: {
                                        Authorization: `Bearer ${BRAVE_SEARCH_KEY}`,
                                        Accept: 'application/json'
                                }
                        }
                );
                if (!res.ok) {
                        console.warn('[presence] brave search failed', res.status);
                        return undefined;
                }
                const payload = (await res.json()) as { web?: { results?: Array<{ url: string }> } };
                const results = payload.web?.results ?? [];
                const index = results.findIndex((entry) => findRank(host, entry.url));
                return index === -1 ? undefined : index + 1;
        } catch (error) {
                console.warn('[presence] brave lookup failed', error);
                return undefined;
        }
};

const normaliseCitations = (input: unknown): PresenceGroundingEntry['citations'] => {
        if (!Array.isArray(input)) return [];
        const result: PresenceGroundingEntry['citations'] = [];

        for (const raw of input) {
                if (!raw || typeof raw !== 'object') continue;
                const record = raw as Record<string, unknown>;
                const urlCandidate = typeof record.url === 'string'
                        ? record.url
                        : typeof record.link === 'string'
                        ? record.link
                        : undefined;
                if (!urlCandidate) continue;

                const title = typeof record.title === 'string'
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
                const res = await fetchWithTimeout(
                        fetcher,
                        `https://api.search.brave.com/res/v1/grounding/search?q=${encodeURIComponent(query)}&count=20`,
                        {
                                headers: {
                                        Authorization: `Bearer ${BRAVE_AI_GROUNDING_KEY}`,
                                        Accept: 'application/json'
                                }
                        }
                );

                if (!res.ok) {
                        console.warn('[presence] brave grounding failed', res.status);
                        return undefined;
                }

                const payload = (await res.json()) as Record<string, unknown>;
                const groundingSection = payload?.grounding as Record<string, unknown> | undefined;
                const collected = [
                        ...normaliseCitations(groundingSection?.citations),
                        ...normaliseCitations(groundingSection?.results),
                        ...normaliseCitations(payload?.citations),
                        ...normaliseCitations(payload?.results)
                ];

                const deduped: PresenceGroundingEntry['citations'] = [];
                const seenUrls = new Set<string>();
                for (const entry of collected) {
                        if (!seenUrls.has(entry.url)) {
                                seenUrls.add(entry.url);
                                deduped.push(entry);
                        }
                }

                if (deduped.length === 0) {
                        return undefined;
                }

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
                ? body.queries.filter((entry: unknown): entry is string => typeof entry === 'string' && entry.trim().length > 0)
                : undefined;

        const queries = await buildDefaultQueries(fetch, target, providedQueries);
        const host = target.hostname.replace(/^www\./, '');

        const serp: Array<{ query: string; engine: string; rank?: number }> = [];
        const grounding: PresenceGroundingEntry[] = [];
        for (const query of queries) {
                const entry = { query, engine: 'bing', rank: await runBingSearch(fetch, query, host) };
                serp.push(entry);
                const braveRank = await runBraveSearch(fetch, query, host);
                serp.push({ query, engine: 'brave', rank: braveRank });

                const groundingEntry = await runBraveGrounding(fetch, query, host);
                if (groundingEntry) {
                        grounding.push(groundingEntry);
                }
        }

        // TODO: Hook LLM citation verification for rankings.

        if (grounding.length > 0) {
                return json({ serp, grounding });
        }

        return json({ serp });
};
