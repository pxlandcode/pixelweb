import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

let browserClient: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client for browser usage.
 * The client keeps the session in local storage so subsequent requests remain authenticated.
 */
export const getSupabaseClient = () => {
        if (!browserClient) {
                browserClient = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
                        auth: {
                                persistSession: true,
                                autoRefreshToken: true
                        }
                });
        }

        return browserClient;
};
