import { sbAdmin } from './supabase';

// Default Brave API daily limit
const BRAVE_DAILY_LIMIT = 350;

export const canRunBraveQuery = async (): Promise<{ allowed: boolean; remaining: number }> => {
	const today = new Date().toISOString().slice(0, 10);
	const limit = BRAVE_DAILY_LIMIT;

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
			.upsert({ usage_date: today, queries_used: nextUsage }, { onConflict: 'usage_date' });

		if (upsertError) {
			throw upsertError;
		}

		return { allowed: true, remaining: Math.max(limit - nextUsage, 0) };
	} catch (error) {
		console.error('[braveQuota] Failed to update quota', error);
		return { allowed: false, remaining: 0 };
	}
};
