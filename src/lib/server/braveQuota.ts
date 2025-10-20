import { BRAVE_DAILY_LIMIT } from '$env/static/private';
import { sbAdmin } from './supabase';

export const canRunBraveQuery = async (): Promise<{ allowed: boolean; remaining: number }> => {
        const today = new Date().toISOString().slice(0, 10);
        const limitEnv = BRAVE_DAILY_LIMIT ?? '';
        const parsedLimit = Number.parseInt(limitEnv, 10);
        const limit = Number.isFinite(parsedLimit) ? parsedLimit : 350;

        try {
                const { data, error } = await sbAdmin
                        .from('brave_usage')
                        .select('queries_used')
                        .eq('usage_date', today)
                        .maybeSingle();

                if (error) {
                        throw error;
                }

                const currentUsage = data?.queries_used ?? 0;
                if (currentUsage >= limit) {
                        return { allowed: false, remaining: 0 };
                }

                const nextUsage = currentUsage + 1;
                const { error: upsertError } = await sbAdmin
                        .from('brave_usage')
                        .upsert(
                                { usage_date: today, queries_used: nextUsage },
                                { onConflict: 'usage_date' }
                        );

                if (upsertError) {
                        throw upsertError;
                }

                return { allowed: true, remaining: Math.max(limit - nextUsage, 0) };
        } catch (error) {
                console.error('[braveQuota] Failed to update quota', error);
                return { allowed: false, remaining: 0 };
        }
};
