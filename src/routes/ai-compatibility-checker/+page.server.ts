import { fail, type Actions, type PageServerLoad } from '@sveltejs/kit';
import { getModel } from '$lib/server/openai';
import { scoreWithLLM } from '$lib/server/llmScore';

export const load: PageServerLoad = async () => ({
        model: getModel()
});

export const actions: Actions = {
        evaluate: async ({ request }) => {
                const formData = await request.formData();
                const sampleValue = formData.get('sample');

                if (typeof sampleValue !== 'string') {
                        return fail(400, {
                                error: 'Please provide a marketing page sample to audit.',
                                result: undefined,
                                sample: ''
                        });
                }

                const trimmed = sampleValue.trim();

                if (trimmed.length === 0) {
                        return fail(400, {
                                error: 'Please provide a marketing page sample to audit.',
                                result: undefined,
                                sample: ''
                        });
                }

                const result = await scoreWithLLM(trimmed);

                if (!result) {
                        return fail(502, {
                                error: 'The readability service is temporarily unavailable.',
                                result: undefined,
                                sample: sampleValue
                        });
                }

                return {
                        result,
                        sample: sampleValue,
                        error: null
                };
        }
};
