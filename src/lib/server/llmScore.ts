import type { ChatCompletion } from 'openai/resources/chat/completions';
import { getModel, openai } from './openai';

export type ReadabilityScore = {
        clarity: number;
        summary: string;
        issues: string[];
};

const parsingFallback: ReadabilityScore = {
        clarity: 7,
        summary: 'The readability audit could not be parsed from the language model response.',
        issues: ['Failed to parse readability JSON from the language model response.']
};

const sanitiseIssues = (issues: unknown): string[] => {
        if (!Array.isArray(issues)) {
                return parsingFallback.issues;
        }

        const cleaned = issues.filter((issue): issue is string => typeof issue === 'string' && issue.trim().length > 0);

        return cleaned.length > 0 ? cleaned : parsingFallback.issues;
};

const extractJson = (content: string): string => {
        const start = content.indexOf('{');
        const end = content.lastIndexOf('}');

        if (start === -1 || end === -1 || end <= start) {
                return content;
        }

        return content.slice(start, end + 1);
};

export const scoreWithLLM = async (sample: string): Promise<ReadabilityScore | undefined> => {
        try {
                const model = getModel();
                console.info(`[readability] scoring with model: ${model}`);

                const completion: ChatCompletion = await openai.chat.completions.create({
                        model,
                        temperature: 0.2,
                        max_tokens: 400,
                        messages: [
                                {
                                        role: 'system',
                                        content:
                                                'You are a rigorous readability auditor assessing marketing web content for how well large language models can understand it. Provide balanced, actionable feedback.'
                                },
                                {
                                        role: 'user',
                                        content: `Analyse the following marketing page sample. Respond ONLY with valid JSON using the keys clarity (number 1-10), summary (string), and issues (array of up to three concrete readability issues).\n\nSample:\n"""${sample}\"\""`
                                }
                        ]
                });

                const rawContent = completion.choices[0]?.message?.content?.trim();

                if (!rawContent) {
                        return parsingFallback;
                }

                const extracted = extractJson(rawContent);

                try {
                        const parsed = JSON.parse(extracted) as Partial<ReadabilityScore>;
                        const clarityValue = Number(parsed.clarity);
                        const clarity = Number.isFinite(clarityValue) ? clarityValue : parsingFallback.clarity;
                        const summary = typeof parsed.summary === 'string' && parsed.summary.trim().length > 0 ? parsed.summary : parsingFallback.summary;
                        const issues = sanitiseIssues(parsed.issues);

                        return { clarity, summary, issues };
                } catch (parseError) {
                        console.warn('[readability] failed to parse LLM response', parseError);
                        return parsingFallback;
                }
        } catch (error) {
                console.error('[readability] scoring failed', error);
                return undefined;
        }
};
