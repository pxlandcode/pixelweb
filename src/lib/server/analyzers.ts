// Utility analyzers for marketing site diagnostics.
import { setTimeout as sleep } from 'node:timers/promises';

export type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const REQUEST_TIMEOUT = 10_000;

const AI_USER_AGENTS = ['GPTBot', 'CCBot', 'anthropic-ai'] as const;

export type SitemapResult = {
        urls: string[];
        error?: string;
};

export type RobotsResult = {
        blocksAll: boolean;
        blocksAIs: string[];
        disallow: string[];
        raw?: string;
};

export type IndexabilityResult = {
        metaRobots: string[];
        xRobots: string[];
        canonical?: string;
        indexable: boolean;
};

export type KeyPagesResult = {
        discovered: string[];
};

export type InternalLinksResult = {
        total: number;
        avgAnchorLen: number;
        avgUrlDepth: number;
};

export type ReadabilityResult = {
        flesch: number;
        avgSentenceLen: number;
};

export type BrokenLinkSample = {
        url: string;
        status?: number;
        ok: boolean;
};

export type BrokenLinksResult = {
        checked: BrokenLinkSample[];
};

export type DivSoupResult = {
        divShare: number;
        semanticRatio: number;
};

export type SemanticDensityResult = {
        wordsPerBlock: number;
};

export const normaliseWhitespace = (value: string): string =>
        value.replace(/\s+/g, ' ').replace(/\u00a0/g, ' ').trim();

const stripTags = (html: string): string =>
        html
                .replace(/<script[\s\S]*?<\/script>/gi, ' ')
                .replace(/<style[\s\S]*?<\/style>/gi, ' ')
                .replace(/<[^>]*>/g, ' ');

const fetchWithTimeout = async (
        fetcher: Fetcher,
        input: RequestInfo | URL,
        init: RequestInit = {}
): Promise<Response> => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
        try {
                return await fetcher(input, { ...init, signal: controller.signal });
        } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                        const target =
                                typeof input === 'string'
                                        ? input
                                        : input instanceof URL
                                        ? input.href
                                        : 'unknown';
                        console.warn('[analyzers] fetchWithTimeout aborted', target, init.method ?? 'GET');
                }
                throw error;
        } finally {
                clearTimeout(timeout);
        }
};

export const fetchSitemap = async (fetcher: Fetcher, url: URL): Promise<SitemapResult> => {
        const sitemapUrl = new URL('/sitemap.xml', url.origin);
        try {
                const res = await fetchWithTimeout(fetcher, sitemapUrl, { headers: { Accept: 'application/xml' } });
                if (!res.ok) {
                        return { urls: [], error: `sitemap returned ${res.status}` };
                }
                const xml = await res.text();
                const matches = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/gi));
                const urls = matches.map((match) => match[1]?.trim()).filter((value): value is string => Boolean(value));
                return { urls };
        } catch (error) {
                console.warn('[analyzers] fetchSitemap failed', error);
                return { urls: [], error: error instanceof Error ? error.message : 'unknown error' };
        }
};

export const parseRobots = async (fetcher: Fetcher, url: URL): Promise<RobotsResult> => {
        const robotsUrl = new URL('/robots.txt', url.origin);
        try {
                const res = await fetchWithTimeout(fetcher, robotsUrl, { headers: { Accept: 'text/plain' } });
                if (!res.ok) {
                        return { blocksAll: false, blocksAIs: [], disallow: [], raw: undefined };
                }
                const text = await res.text();
                const lines = text.split(/\r?\n/).map((line) => line.trim());
                const disallow: string[] = [];
                const blocksAIs = new Set<string>();
                let currentAgent: string | null = null;
                const globalDisallow: string[] = [];
                for (const raw of lines) {
                        if (!raw || raw.startsWith('#')) continue;
                        const [label, value = ''] = raw.split(':', 2).map((part) => part.trim());
                        if (!label) continue;
                        if (/^user-agent$/i.test(label)) {
                                currentAgent = value.toLowerCase();
                        } else if (/^disallow$/i.test(label)) {
                                const path = value || '/';
                                if (currentAgent === '*' || currentAgent === null) {
                                        globalDisallow.push(path);
                                }
                                if (currentAgent) {
                                        if (AI_USER_AGENTS.some((agent) => agent.toLowerCase() === currentAgent)) {
                                                blocksAIs.add(currentAgent);
                                        }
                                }
                                if (currentAgent === '*' || currentAgent === null) {
                                        disallow.push(path);
                                }
                        }
                }
                const blocksAll = globalDisallow.includes('/') || globalDisallow.includes('/*');
                return { blocksAll, blocksAIs: Array.from(blocksAIs), disallow, raw: text };
        } catch (error) {
                console.warn('[analyzers] parseRobots failed', error);
                return { blocksAll: false, blocksAIs: [], disallow: [], raw: undefined };
        }
};

const extractMetaContent = (html: string, attribute: string, value: string): string[] => {
        const regex = new RegExp(
                `<meta[^>]*${attribute}=["']${value}["'][^>]*content=["']([^"']+)["'][^>]*>`,
                'gi'
        );
        return Array.from(html.matchAll(regex))
                .map((match) => match[1])
                .filter((content): content is string => Boolean(content))
                .map((content) => content.toLowerCase());
};

export const checkIndexability = (html: string, headers: Headers | undefined): IndexabilityResult => {
        const metaRobots = extractMetaContent(html, 'name', 'robots');
        const metaHttpEquiv = extractMetaContent(html, 'http-equiv', 'x-robots-tag');
        const xRobotsHeader = headers?.get('x-robots-tag');
        const xRobots = [
                ...metaHttpEquiv,
                ...(xRobotsHeader ? xRobotsHeader.split(',').map((entry) => entry.trim().toLowerCase()) : [])
        ];
        const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
        const canonical = canonicalMatch?.[1];
        const combined = [...metaRobots, ...xRobots];
        const hasNoindex = combined.some((value) => value.includes('noindex'));
        return {
                metaRobots,
                xRobots,
                canonical,
                indexable: !hasNoindex
        };
};

const COMMON_KEY_PAGES = ['/', '/pricing', '/blog', '/solutions', '/services', '/platform', '/docs', '/about'];

export const detectKeyPages = async (fetcher: Fetcher, url: URL): Promise<KeyPagesResult> => {
        const discovered: string[] = [];
        for (const path of COMMON_KEY_PAGES) {
                try {
                        const target = new URL(path, url.origin);
                        const res = await fetchWithTimeout(fetcher, target, { method: 'HEAD' });
                        if (res.ok) {
                                discovered.push(target.href);
                        }
                        await sleep(30);
                } catch (error) {
                        console.warn('[analyzers] detectKeyPages failed for', path, error);
                }
        }
        return { discovered };
};

const extractAnchors = (html: string): Array<{ href: string; text: string }> => {
        const matches = html.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi);
        return Array.from(matches)
                .map((match) => ({
                        href: match[1] ?? '',
                        text: normaliseWhitespace(stripTags(match[2] ?? ''))
                }))
                .filter((anchor) => anchor.href.length > 0);
};

export const measureInternalLinks = (html: string, baseUrl: URL): InternalLinksResult => {
        const anchors = extractAnchors(html);
        const baseHost = baseUrl.hostname.replace(/^www\./, '');
        const internal = anchors.filter((anchor) => {
                try {
                        const linkUrl = new URL(anchor.href, baseUrl);
                        return linkUrl.hostname.replace(/^www\./, '') === baseHost;
                } catch {
                        return false;
                }
        });
        if (internal.length === 0) {
                return { total: 0, avgAnchorLen: 0, avgUrlDepth: 0 };
        }
        const totalAnchorChars = internal.reduce((sum, anchor) => sum + anchor.text.length, 0);
        const avgAnchorLen = totalAnchorChars / internal.length;
        const avgUrlDepth =
                internal.reduce((sum, anchor) => {
                        try {
                                const linkUrl = new URL(anchor.href, baseUrl);
                                const depth = linkUrl.pathname.split('/').filter(Boolean).length;
                                return sum + depth;
                        } catch {
                                return sum;
                        }
                }, 0) / internal.length;
        return {
                total: internal.length,
                avgAnchorLen,
                avgUrlDepth
        };
};

const sentenceSplitter = (text: string): string[] =>
        text
                .replace(/[!?]/g, '.')
                .split('.')
                .map((sentence) => normaliseWhitespace(sentence))
                .filter((sentence) => sentence.length > 0);

const countSyllables = (word: string): number => {
        const sanitized = word.toLowerCase().replace(/[^a-z]/g, '');
        if (!sanitized) return 0;
        if (sanitized.length <= 3) return 1;
        const vowels = sanitized.match(/[aeiouy]+/g);
        if (!vowels) return 1;
        let syllables = vowels.length;
        if (sanitized.endsWith('e')) syllables -= 1;
        return Math.max(1, syllables);
};

export const calculateReadability = (text: string): ReadabilityResult => {
        const clean = normaliseWhitespace(text);
        if (!clean) {
                return { flesch: 0, avgSentenceLen: 0 };
        }
        const sentences = sentenceSplitter(clean);
        const words = clean.split(' ').filter(Boolean);
        const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
        const sentenceCount = Math.max(1, sentences.length);
        const wordCount = Math.max(1, words.length);
        const avgSentenceLen = wordCount / sentenceCount;
        const flesch = 206.835 - 1.015 * avgSentenceLen - 84.6 * (totalSyllables / wordCount);
        return { flesch: Number.isFinite(flesch) ? flesch : 0, avgSentenceLen };
};

export const estimateJargon = (text: string): number => {
        const words = normaliseWhitespace(text)
                .split(' ')
                .map((word) => word.toLowerCase().replace(/[^a-z]/g, ''))
                .filter(Boolean);
        if (words.length === 0) return 0;
        const complexWords = words.filter((word) => word.length >= 12 || /ity$|ness$|tion$|ment$/i.test(word));
        return Math.min(1, complexWords.length / words.length);
};

export const sampleBrokenLinks = async (
        fetcher: Fetcher,
        html: string,
        baseUrl: URL
): Promise<BrokenLinksResult> => {
        const anchors = extractAnchors(html);
        const unique = new Map<string, string>();
        for (const anchor of anchors) {
            try {
                const href = new URL(anchor.href, baseUrl).href;
                if (!unique.has(href)) {
                        unique.set(href, anchor.text);
                }
            } catch {
                continue;
            }
            if (unique.size >= 12) break;
        }
        const checked: BrokenLinkSample[] = [];
        for (const href of unique.keys()) {
                try {
                        const res = await fetchWithTimeout(fetcher, href, { method: 'HEAD' });
                        checked.push({ url: href, status: res.status, ok: res.ok });
                        await sleep(30);
                } catch (error) {
                        console.warn('[analyzers] sampleBrokenLinks failed for', href, error);
                        checked.push({ url: href, ok: false });
                }
        }
        return { checked };
};

export const computeDivSoup = (html: string): DivSoupResult => {
        const divCount = (html.match(/<div\b/gi) || []).length;
        const semanticCount =
                (html.match(/<(section|article|main|header|footer|nav|aside)\b/gi) || []).length +
                (html.match(/<h[1-6]\b/gi) || []).length;
        const total = divCount + semanticCount;
        if (total === 0) {
                return { divShare: 0, semanticRatio: 0 };
        }
        return { divShare: divCount / total, semanticRatio: semanticCount / total };
};

export const semanticDensity = (html: string): SemanticDensityResult => {
        const blocks = (html.match(/<(section|article|div|main|p)\b/gi) || []).length || 1;
        const text = normaliseWhitespace(stripTags(html));
        const words = text.split(' ').filter(Boolean);
        return { wordsPerBlock: words.length / blocks };
};

export const extractMainContent = (html: string): { html: string; text: string } => {
        const mainMatch = html.match(/<main[\s\S]*?<\/main>/i);
        const rawMain = mainMatch ? mainMatch[0] : html;
        const withoutNav = rawMain
                .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
                .replace(/<aside[\s\S]*?<\/aside>/gi, ' ');
        const text = normaliseWhitespace(stripTags(withoutNav));
        return { html: withoutNav, text };
};

export const extractTitle = (html: string): string | undefined => {
        const match = html.match(/<title>([\s\S]*?)<\/title>/i);
        return match ? normaliseWhitespace(match[1]) : undefined;
};
