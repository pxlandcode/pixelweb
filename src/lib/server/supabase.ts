// This module is strictly server-only. Never import it from client-side code.
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from '$env/static/private';

type SupabaseClientType = ReturnType<typeof createClient>;

const supabaseUrl = SUPABASE_URL;
const serviceRoleKey = SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
        console.warn('[supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

export const sbAdmin: SupabaseClientType = createClient(supabaseUrl ?? '', serviceRoleKey ?? '', {
        auth: { persistSession: false }
});
