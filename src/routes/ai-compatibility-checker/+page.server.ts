import { fail, type Actions, type PageServerLoad } from '@sveltejs/kit';
import { ENABLE_RANKING } from '$env/static/private';
import { getModel } from '$lib/server/openai';
import {
        calculateReadability,
        checkIndexability,
        computeDivSoup,
        detectKeyPages,
        estimateJargon,
        extractMainContent,
        extractTitle,
        fetchSitemap,
        measureInternalLinks,
        normaliseWhitespace,
        parseRobots,
        sampleBrokenLinks,
        semanticDensity
} from '$lib/server/analyzers';
import { scoreWithLLM, type AnalyzerSnapshot, type PresenceReport } from '$lib/server/llmScore';

const RANKING_ENABLED = ENABLE_RANKING?.trim() === '1';

export const load: PageServerLoad = async () => ({
        model: getModel(),
        rankingEnabled: RANKING_ENABLED
});

type CompositeScores = {
        discoverabilityScore: number;
        comprehensibilityScore: number;
        authorityScore: number;
};

type AnalyzerBundle = {
        sitemap?: Awaited<ReturnType<typeof fetchSitemap>>;
        robots?: Awaited<ReturnType<typeof parseRobots>>;
        indexability?: ReturnType<typeof checkIndexability>;
        keyPages?: Awaited<ReturnType<typeof detectKeyPages>>;
        internalLinks?: ReturnType<typeof measureInternalLinks>;
        readability?: ReturnType<typeof calculateReadability>;
        jargon?: number;
        brokenLinks?: Awaited<ReturnType<typeof sampleBrokenLinks>>;
        divSoup?: ReturnType<typeof computeDivSoup>;
        semanticDensity?: ReturnType<typeof semanticDensity>;
        hasServiceSchema: boolean;
        jsOnlyContent: boolean;
};

type Insights = Array<{ label: string; action: string }>;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const safeRun = async <T>(label: string, fn: () => Promise<T> | T): Promise<T | undefined> => {
        try {
                return await fn();
        } catch (error) {
                console.warn(`[analyzers] ${label} failed`, error);
                return undefined;
        }
};

const computeScores = (bundle: AnalyzerBundle): CompositeScores => {
        const discoverabilitySignals: number[] = [];
        if (bundle.indexability) {
                discoverabilitySignals.push(bundle.indexability.indexable ? 25 : -25);
        }
        if (bundle.sitemap) {
                discoverabilitySignals.push(bundle.sitemap.urls.length > 0 ? 15 : -5);
        }
        if (bundle.robots) {
                if (bundle.robots.blocksAll) {
                        discoverabilitySignals.push(-30);
                }
                if (bundle.robots.blocksAIs.length > 0) {
                        discoverabilitySignals.push(-10);
                }
        }
        if (bundle.internalLinks) {
                discoverabilitySignals.push(clamp(bundle.internalLinks.total * 2, 0, 15));
        }
        const discoverabilityScore = clamp(
                50 + discoverabilitySignals.reduce((sum, value) => sum + value, 0),
                0,
                100
        );

        const readability = bundle.readability;
        const fleschScore = readability ? clamp((readability.flesch + 20) / 2, 0, 100) : 40;
        const jargonPenalty = bundle.jargon ? bundle.jargon * 30 : 0;
        const comprehensibilityScore = clamp(fleschScore - jargonPenalty, 0, 100);

        const authoritySignals = [
                bundle.internalLinks ? clamp(bundle.internalLinks.total * 1.5, 0, 25) : 0,
                bundle.keyPages && bundle.keyPages.discovered.length >= 3 ? 15 : 0,
                bundle.brokenLinks
                        ? -clamp(
                                  bundle.brokenLinks.checked.filter((entry) => !entry.ok).length * 10,
                                  0,
                                  30
                          )
                        : 0,
                bundle.divSoup ? (1 - bundle.divSoup.divShare) * 10 : 0
        ];
        const authorityScore = clamp(45 + authoritySignals.reduce((sum, value) => sum + value, 0), 0, 100);

        return {
                discoverabilityScore,
                comprehensibilityScore,
                authorityScore
        };
};

const deriveInsights = (bundle: AnalyzerBundle): Insights => {
        const insights: Insights = [];
        if (bundle.robots && bundle.robots.blocksAIs.length > 0) {
                insights.push({
                        label: 'Block for GPTBot found',
                        action: 'Remove from robots.txt to allow AI access'
                });
        }
        if (!bundle.hasServiceSchema) {
                insights.push({
                        label: 'No Service schema',
                        action: 'Add JSON-LD Service for primary offering'
                });
        }
        if (bundle.jsOnlyContent) {
                insights.push({
                        label: 'JS-only content detected',
                        action: 'Prerender critical copy'
                });
        }
        return insights;
};

const toJson = (value: unknown) => JSON.stringify(value, null, 2);

const getPresence = async (fetchFn: typeof fetch, url: string): Promise<PresenceReport | undefined> => {
        if (!RANKING_ENABLED) return undefined;
        try {
                const res = await fetchFn('/api/presence', {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ url })
                });
                if (!res.ok) {
                        console.warn('[presence] failed with status', res.status);
                        return undefined;
                }
                return (await res.json()) as PresenceReport;
        } catch (error) {
                console.warn('[presence] lookup failed', error);
                return undefined;
        }
};

const buildSnapshot = (
        url: string,
        title: string | undefined,
        oneLiner: string,
        bundle: AnalyzerBundle,
        presence?: PresenceReport
): AnalyzerSnapshot => ({
        url,
        title,
        oneLiner,
        readability: bundle.readability,
        jargon: bundle.jargon,
        sitemap: bundle.sitemap,
        robots: bundle.robots,
        indexability: bundle.indexability,
        keyPages: bundle.keyPages,
        internalLinks: bundle.internalLinks,
        brokenLinks: bundle.brokenLinks,
        divSoup: bundle.divSoup,
        semanticDensity: bundle.semanticDensity,
        hasServiceSchema: bundle.hasServiceSchema,
        jsOnlyContent: bundle.jsOnlyContent,
        presence
});

export const actions: Actions = {
        evaluate: async ({ request, fetch }) => {
                const formData = await request.formData();
                const urlValue = formData.get('url');

                if (typeof urlValue !== 'string' || urlValue.trim().length === 0) {
                        return fail(400, {
                                error: 'Provide a valid marketing page URL to audit.',
                                result: undefined,
                                url: ''
                        });
                }

                let target: URL;
                try {
                        target = new URL(urlValue.trim());
                } catch {
                        return fail(400, {
                                error: 'Provide a valid marketing page URL to audit.',
                                result: undefined,
                                url: urlValue
                        });
                }

                try {
                        const response = await fetch(target.href, {
                                headers: { 'user-agent': 'PixelReadabilityBot/1.0' }
                        });
                        if (!response.ok) {
                                return fail(502, {
                                        error: `Unable to load the requested page (status ${response.status}).`,
                                        result: undefined,
                                        url: urlValue
                                });
                        }
                        const html = await response.text();
                        const { text: mainText, html: mainHtml } = extractMainContent(html);
                        const title = extractTitle(html);
                        const sanitizedMain = normaliseWhitespace(mainText);
                        const fallbackText =
                                sanitizedMain.length > 0
                                        ? sanitizedMain
                                        : normaliseWhitespace(
                                                  html
                                                          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
                                                          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
                                                          .replace(/<[^>]+>/g, ' ')
                                          );
                        const oneLiner = fallbackText.slice(0, 350);
                        const hasServiceSchema = /"@type"\s*:\s*"Service"/i.test(html);
                        const jsOnlyContent = mainText.length < 120;

                        const bundle: AnalyzerBundle = {
                                hasServiceSchema,
                                jsOnlyContent
                        };

                        bundle.readability = await safeRun('calculateReadability', async () =>
                                calculateReadability(mainText)
                        );
                        bundle.jargon = await safeRun('estimateJargon', async () => estimateJargon(mainText));
                        bundle.sitemap = await safeRun('fetchSitemap', () => fetchSitemap(fetch, target));
                        bundle.robots = await safeRun('parseRobots', () => parseRobots(fetch, target));
                        bundle.indexability = await safeRun('checkIndexability', async () =>
                                checkIndexability(html, response.headers)
                        );
                        bundle.keyPages = await safeRun('detectKeyPages', () => detectKeyPages(fetch, target));
                        bundle.internalLinks = await safeRun('measureInternalLinks', async () =>
                                measureInternalLinks(html, target)
                        );
                        bundle.brokenLinks = await safeRun('sampleBrokenLinks', () =>
                                sampleBrokenLinks(fetch, html, target)
                        );
                        bundle.divSoup = await safeRun('computeDivSoup', async () => computeDivSoup(mainHtml));
                        bundle.semanticDensity = await safeRun('semanticDensity', async () => semanticDensity(mainHtml));
                        if (
                                bundle.semanticDensity &&
                                bundle.semanticDensity.wordsPerBlock < 8 &&
                                mainText.length < 200
                        ) {
                                bundle.jsOnlyContent = true;
                        }

                        const scores = computeScores(bundle);
                        const insights = deriveInsights(bundle);
                        const presence = await getPresence(fetch, target.href);

                        const snapshot = buildSnapshot(target.href, title, oneLiner, bundle, presence);
                        const report = await scoreWithLLM(snapshot);

                        if (!report) {
                                return fail(502, {
                                        error: 'The readability service is temporarily unavailable.',
                                        result: undefined,
                                        url: urlValue
                                });
                        }

                        report.presence = presence ?? report.presence;

                        const analyzers = {
                                ...bundle,
                                title,
                                oneLiner,
                                snapshotJson: toJson(snapshot)
                        };

                        return {
                                error: null,
                                url: urlValue,
                                result: {
                                        report,
                                        scores,
                                        insights,
                                        analyzers
                                }
                        };
                } catch (error) {
                        console.error('[readability] evaluation failed', error);
                        return fail(502, {
                                error: 'The readability service is temporarily unavailable.',
                                result: undefined,
                                url: urlValue
                        });
                }
        }
};
