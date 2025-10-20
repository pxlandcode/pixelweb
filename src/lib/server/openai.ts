import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
        throw new Error('OPENAI_API_KEY is required to use the readability checker.');
}

const resolvedModel = (process.env.LLM_MODEL ?? 'gpt-4o-mini').trim() || 'gpt-4o-mini';

export const openai = new OpenAI({
        apiKey
});

export const getModel = (): string => resolvedModel;
