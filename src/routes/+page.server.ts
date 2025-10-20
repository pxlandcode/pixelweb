import { fail, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import type { PostgrestError } from '@supabase/supabase-js';
import { sbAdmin } from '$lib/server/supabase';
import { canRunBraveQuery } from '$lib/server/braveQuota';
import type { LeadInput } from '$lib/types';

const LeadSchema = z.object({
        website_url: z
                .string()
                .url()
                .refine((value) => /^https?:\/\//.test(value), 'URL måste börja med http eller https'),
        email: z.string().email(),
        consent: z.literal('true')
});

const mapZodError = (issues: z.ZodIssue[]): string =>
        issues[0]?.message ?? 'Kontrollera att alla fält är korrekt ifyllda.';

export const actions: Actions = {
        default: async (event) => {
                const fetchFn = event.fetch;
                const { request, getClientAddress } = event;

                const formData = await request.formData();
                const websiteValue = formData.get('website_url');
                const emailValue = formData.get('email');
                const consentValue = formData.get('consent');

                const submission = {
                        website_url: typeof websiteValue === 'string' ? websiteValue.trim() : '',
                        email: typeof emailValue === 'string' ? emailValue.trim() : '',
                        consent: typeof consentValue === 'string' ? consentValue : ''
                } satisfies Record<keyof LeadInput, string>;

                const parsed = LeadSchema.safeParse(submission);
                if (!parsed.success) {
                        return fail(400, {
                                error: mapZodError(parsed.error.issues),
                                values: { website_url: submission.website_url, email: submission.email }
                        });
                }

                const clientIp = getClientAddress();
                const userAgent = request.headers.get('user-agent') ?? undefined;
                const referer = request.headers.get('referer') ?? request.headers.get('referrer') ?? undefined;

                let leadId: string | undefined;
                try {
                        const { data, error } = await sbAdmin
                                .from('leads')
                                .insert({
                                        website_url: parsed.data.website_url,
                                        email: parsed.data.email,
                                        consent: true,
                                        metadata: {
                                                ip: clientIp,
                                                userAgent,
                                                referer
                                        }
                                })
                                .select('id')
                                .single();

                        if (error) {
                                const pgError = error as PostgrestError | null;
                                if (pgError?.code === '23505') {
                                        const { data: existing, error: lookupError } = await sbAdmin
                                                .from('leads')
                                                .select('id')
                                                .eq('website_url', parsed.data.website_url)
                                                .eq('email', parsed.data.email)
                                                .maybeSingle();
                                        if (lookupError) {
                                                console.error('[leads] Failed to retrieve existing lead', lookupError);
                                                return fail(500, { error: 'Kunde inte spara ditt svar. Försök igen senare.' });
                                        }
                                        leadId = existing?.id;
                                } else {
                                        throw error;
                                }
                        } else {
                                leadId = data?.id;
                        }
                } catch (error) {
                        console.error('[leads] Failed to create lead', error);
                        return fail(500, { error: 'Kunde inte spara ditt svar. Försök igen senare.' });
                }

                if (!leadId) {
                        console.error('[leads] Lead ID missing after insert/lookup');
                        return fail(500, { error: 'Kunde inte spara ditt svar. Försök igen senare.' });
                }

                const quota = await canRunBraveQuery();
                if (!quota.allowed) {
                        return { success: true, quota: { remaining: 0 } };
                }

                // TODO: Integrate runAudit(parsed.data.website_url, fetchFn) to generate reports for new leads.
                void fetchFn;

                return { success: true, quota: { remaining: quota.remaining } };
        }
};
