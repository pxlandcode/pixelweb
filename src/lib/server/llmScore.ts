import type { ChatCompletion } from 'openai/resources/chat/completions';
import { getModel, openai } from './openai';
import type {
        BrokenLinksResult,
        DivSoupResult,
        IndexabilityResult,
        InternalLinksResult,
        KeyPagesResult,
        ReadabilityResult,
        RobotsResult,
        SemanticDensityResult,
        SitemapResult
} from './analyzers';

export type PresenceGroundingCitation = {
        url: string;
        title?: string;
        score?: number;
};

export type PresenceGroundingEntry = {
        query: string;
        engine: 'brave-ai';
        cited: boolean;
        citations: PresenceGroundingCitation[];
};

export type PresenceQuery = {
        query: string;
        highlight?: string;
};

export type PresenceSerpEntry = {
        query: string;
        engine: string;
        rank?: number;
        matchedUrl?: string;
};

export type PresenceReport = {
        queries: PresenceQuery[];
        serp: PresenceSerpEntry[];
        grounding?: PresenceGroundingEntry[];
};

export type DiagnosticSection = {
        summary: string;
        highlights: string[];
        actions: string[];
};

export type LLMOverview = {
        clarity: number;
        summary: string;
        issues: string[];
};

export type LLMReport = {
        overview: LLMOverview;
        discoverability: DiagnosticSection;
        understanding: DiagnosticSection;
        clarity: DiagnosticSection;
        evidence: DiagnosticSection;
        tech: DiagnosticSection;
        aiPolicy: DiagnosticSection;
        presence?: PresenceReport;
};

export type AnalyzerSnapshot = {
        url: string;
        title?: string;
        oneLiner: string;
        readability?: ReadabilityResult;
        jargon?: number;
        sitemap?: SitemapResult;
        robots?: RobotsResult;
        indexability?: IndexabilityResult;
        keyPages?: KeyPagesResult;
        internalLinks?: InternalLinksResult;
        brokenLinks?: BrokenLinksResult;
        divSoup?: DivSoupResult;
        semanticDensity?: SemanticDensityResult;
        hasServiceSchema?: boolean;
        jsOnlyContent?: boolean;
        presence?: PresenceReport;
};

const emptySection: DiagnosticSection = {
        summary: 'No insights available.',
        highlights: [],
        actions: []
};

const parsingFallback: LLMReport = {
        overview: {
                clarity: 5,
                summary: 'The readability audit could not be parsed from the language model response.',
                issues: ['Failed to parse structured readability report from the language model response.']
        },
        discoverability: emptySection,
        understanding: emptySection,
        clarity: emptySection,
        evidence: emptySection,
        tech: emptySection,
        aiPolicy: emptySection
};

const sanitiseStringArray = (value: unknown): string[] => {
        if (!Array.isArray(value)) return [];
        return value
                .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
                .map((entry) => entry.trim());
};

const safeNumber = (value: unknown, fallback: number): number => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
};

const buildPrompt = (snapshot: AnalyzerSnapshot): string => {
        const { url, title, oneLiner, presence, ...rest } = snapshot;
        const payload = {
                url,
                title,
                oneLiner,
                analyzers: rest,
                presence
        };
        return `You are a meticulous marketing analytics assistant. Analyse the provided diagnostics and respond with actionable feedback for improving how language models and search engines consume the page.\n\nDiagnostics JSON:\n${JSON.stringify(payload, null, 2)}\n\nRespond ONLY with valid JSON using this exact structure:\n{\n  "overview": {"clarity": number (0-10), "summary": string, "issues": string[]},\n  "discoverability": {"summary": string, "highlights": string[], "actions": string[]},\n  "understanding": {"summary": string, "highlights": string[], "actions": string[]},\n  "clarity": {"summary": string, "highlights": string[], "actions": string[]},\n  "evidence": {"summary": string, "highlights": string[], "actions": string[]},\n  "tech": {"summary": string, "highlights": string[], "actions": string[]},\n  "aiPolicy": {"summary": string, "highlights": string[], "actions": string[]}\n}`;
};

export const scoreWithLLM = async (snapshot: AnalyzerSnapshot): Promise<LLMReport | undefined> => {
        try {
                const model = getModel();
                const prompt = buildPrompt(snapshot);
                const completion: ChatCompletion = await openai.chat.completions.create({
                        model,
                        temperature: 0.1,
                        max_tokens: 900,
                        messages: [
                                {
                                        role: 'system',
                                        content:
                                                'You are a rigorous readability and SEO co-pilot. Provide concise, high-signal diagnostics based on structured data.'
                                },
                                { role: 'user', content: prompt }
                        ]
                });

                const rawContent = completion.choices[0]?.message?.content?.trim();
                if (!rawContent) {
                        return { ...parsingFallback, presence: snapshot.presence };
                }

                const start = rawContent.indexOf('{');
                const end = rawContent.lastIndexOf('}');
                if (start === -1 || end === -1 || end <= start) {
                        return { ...parsingFallback, presence: snapshot.presence };
                }

                const extracted = rawContent.slice(start, end + 1);
                try {
                        const parsed = JSON.parse(extracted) as Partial<LLMReport>;
                        const overview = parsed.overview ?? parsingFallback.overview;
                        const report: LLMReport = {
                                overview: {
                                        clarity: safeNumber(overview?.clarity, parsingFallback.overview.clarity),
                                        summary:
                                                typeof overview?.summary === 'string' && overview.summary.trim().length > 0
                                                        ? overview.summary
                                                        : parsingFallback.overview.summary,
                                        issues:
                                                sanitiseStringArray(overview?.issues).length > 0
                                                        ? sanitiseStringArray(overview?.issues)
                                                        : parsingFallback.overview.issues
                                },
                                discoverability: {
                                        summary:
                                                typeof parsed.discoverability?.summary === 'string'
                                                        ? parsed.discoverability.summary
                                                        : emptySection.summary,
                                        highlights: sanitiseStringArray(parsed.discoverability?.highlights),
                                        actions: sanitiseStringArray(parsed.discoverability?.actions)
                                },
                                understanding: {
                                        summary:
                                                typeof parsed.understanding?.summary === 'string'
                                                        ? parsed.understanding.summary
                                                        : emptySection.summary,
                                        highlights: sanitiseStringArray(parsed.understanding?.highlights),
                                        actions: sanitiseStringArray(parsed.understanding?.actions)
                                },
                                clarity: {
                                        summary:
                                                typeof parsed.clarity?.summary === 'string'
                                                        ? parsed.clarity.summary
                                                        : emptySection.summary,
                                        highlights: sanitiseStringArray(parsed.clarity?.highlights),
                                        actions: sanitiseStringArray(parsed.clarity?.actions)
                                },
                                evidence: {
                                        summary:
                                                typeof parsed.evidence?.summary === 'string'
                                                        ? parsed.evidence.summary
                                                        : emptySection.summary,
                                        highlights: sanitiseStringArray(parsed.evidence?.highlights),
                                        actions: sanitiseStringArray(parsed.evidence?.actions)
                                },
                                tech: {
                                        summary:
                                                typeof parsed.tech?.summary === 'string'
                                                        ? parsed.tech.summary
                                                        : emptySection.summary,
                                        highlights: sanitiseStringArray(parsed.tech?.highlights),
                                        actions: sanitiseStringArray(parsed.tech?.actions)
                                },
                                aiPolicy: {
                                        summary:
                                                typeof parsed.aiPolicy?.summary === 'string'
                                                        ? parsed.aiPolicy.summary
                                                        : emptySection.summary,
                                        highlights: sanitiseStringArray(parsed.aiPolicy?.highlights),
                                        actions: sanitiseStringArray(parsed.aiPolicy?.actions)
                                },
                                presence: snapshot.presence ?? parsed.presence
                        };

                        return report;
                } catch (parseError) {
                        console.warn('[readability] failed to parse LLM response', parseError);
                        return { ...parsingFallback, presence: snapshot.presence };
                }
        } catch (error) {
                console.error('[readability] scoring failed', error);
                return undefined;
        }
};
