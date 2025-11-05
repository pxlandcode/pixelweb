import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSupabaseAdminClient } from '$lib/server/supabase';

const TABLE_NAME = 'snake_highscores';

export const GET: RequestHandler = async () => {
        const supabase = getSupabaseAdminClient();

        if (!supabase) {
                return json(
                        { scores: [], error: 'Supabase configuration missing. Leaderboard is offline.' },
                        { status: 503 }
                );
        }

        const { data, error } = await supabase
                .from(TABLE_NAME)
                .select('id, player_name, score, created_at')
                .order('score', { ascending: false })
                .order('created_at', { ascending: true })
                .limit(10);

        if (error) {
                return json({ scores: [], error: error.message }, { status: 500 });
        }

        return json({ scores: data ?? [] }, { headers: { 'cache-control': 'no-store' } });
};

export const POST: RequestHandler = async ({ request }) => {
        const supabase = getSupabaseAdminClient();

        if (!supabase) {
                return json({ error: 'Supabase configuration missing.' }, { status: 503 });
        }

        let payload: unknown;
        try {
                payload = await request.json();
        } catch (error) {
                return json({ error: 'Invalid JSON payload.' }, { status: 400 });
        }

        if (typeof payload !== 'object' || payload === null) {
                return json({ error: 'Invalid request body.' }, { status: 400 });
        }

        const { name, score } = payload as { name?: unknown; score?: unknown };
        const trimmedName = typeof name === 'string' ? name.trim().slice(0, 64) : '';
        const numericScore = typeof score === 'number' ? Math.floor(score) : Number(score);

        if (!trimmedName) {
                return json({ error: 'Name is required to save a score.' }, { status: 400 });
        }

        if (!Number.isFinite(numericScore) || numericScore <= 0) {
                return json({ error: 'Score must be a positive number.' }, { status: 400 });
        }

        const { data, error } = await supabase
                .from(TABLE_NAME)
                .insert({ player_name: trimmedName, score: numericScore })
                .select('id, player_name, score, created_at')
                .single();

        if (error) {
                return json({ error: error.message }, { status: 500 });
        }

        return json({ score: data }, { status: 201 });
};
