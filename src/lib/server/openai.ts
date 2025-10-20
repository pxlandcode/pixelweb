import OpenAI from 'openai';
import { OPENAI_API_KEY, LLM_MODEL } from '$env/static/private';

const apiKey = OPENAI_API_KEY?.trim();

if (!apiKey) {
        throw new Error('OPENAI_API_KEY is required to use the readability checker.');
}

const resolvedModel = (LLM_MODEL?.trim() || 'gpt-4o-mini') as string;

export const openai = new OpenAI({
        apiKey
});

export const getModel = (): string => resolvedModel;
