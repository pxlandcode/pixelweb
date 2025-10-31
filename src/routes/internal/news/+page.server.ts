import { fail, type Actions, type PageServerLoad, revalidatePath } from '@sveltejs/kit';
import { AUTH_COOKIE_NAMES, createSupabaseServerClient } from '$lib/server/supabase';

type NewsActionResult = { type: 'create' | 'update' | 'delete'; ok: boolean; message: string };

const parseString = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value.trim() : '');

const ensureAuthenticated = (cookies: import('@sveltejs/kit').Cookies) => {
        return createSupabaseServerClient(cookies.get(AUTH_COOKIE_NAMES.access) ?? null);
};

export const load: PageServerLoad = async ({ cookies }) => {
        const supabase = ensureAuthenticated(cookies);

        if (!supabase) {
                return { articles: [], kinds: [] };
        }

        const [{ data: articles }, { data: kinds }] = await Promise.all([
                supabase
                        .from('articles')
                        .select('id, title, slug, linkedin_url, kind_id, status, content, created_at')
                        .order('created_at', { ascending: false }),
                supabase.from('article_kinds').select('id, name').order('name')
        ]);

        const kindMap = new Map<string, string>();
        for (const kind of kinds ?? []) {
                kindMap.set(String(kind.id), kind.name);
        }

        const articlesWithKind = (articles ?? []).map((article) => ({
                ...article,
                kind_name: kindMap.get(String(article.kind_id)) ?? null
        }));

        return {
                articles: articlesWithKind,
                kinds: kinds ?? []
        };
};

// Keep slug/LinkedIn validation here so future publishing workflows can reuse it.
const validateLink = (slug: string, linkedinUrl: string) => {
        if (slug && linkedinUrl) {
                return 'Provide either a slug or a LinkedIn URL, not both.';
        }

        if (!slug && !linkedinUrl) {
                return 'Please provide a slug for internal posts or a LinkedIn URL for external ones.';
        }

        return null;
};

export const actions: Actions = {
        create: async ({ request, cookies }) => {
                const supabase = ensureAuthenticated(cookies);

                if (!supabase) {
                        return fail(401, {
                                type: 'create',
                                ok: false,
                                message: 'You are not authenticated.'
                        } satisfies NewsActionResult);
                }

                const formData = await request.formData();
                const title = parseString(formData.get('title'));
                const kindId = parseString(formData.get('kind_id'));
                const content = parseString(formData.get('content'));
                const slug = parseString(formData.get('slug'));
                const linkedinUrl = parseString(formData.get('linkedin_url'));
                const status = parseString(formData.get('status')) || 'draft';

                const validation = validateLink(slug, linkedinUrl);

                if (!title || !kindId) {
                        return fail(400, { type: 'create', ok: false, message: 'Title and kind are required.' });
                }

                if (validation) {
                        return fail(400, { type: 'create', ok: false, message: validation });
                }

                const { error } = await supabase.from('articles').insert({
                        title,
                        kind_id: kindId,
                        content: content || null,
                        slug: slug || null,
                        linkedin_url: linkedinUrl || null,
                        status
                });

                if (error) {
                        return fail(500, { type: 'create', ok: false, message: error.message });
                }

                revalidatePath('/internal/news');
                return { type: 'create', ok: true, message: 'Article created successfully.' } satisfies NewsActionResult;
        },
        update: async ({ request, cookies }) => {
                const supabase = ensureAuthenticated(cookies);

                if (!supabase) {
                        return fail(401, { type: 'update', ok: false, message: 'You are not authenticated.' });
                }

                const formData = await request.formData();
                const id = parseString(formData.get('id'));
                const title = parseString(formData.get('title'));
                const kindId = parseString(formData.get('kind_id'));
                const content = parseString(formData.get('content'));
                const slug = parseString(formData.get('slug'));
                const linkedinUrl = parseString(formData.get('linkedin_url'));
                const status = parseString(formData.get('status')) || 'draft';

                if (!id) {
                        return fail(400, { type: 'update', ok: false, message: 'Missing article identifier.' });
                }

                if (!title || !kindId) {
                        return fail(400, { type: 'update', ok: false, message: 'Title and kind are required.' });
                }

                const validation = validateLink(slug, linkedinUrl);

                if (validation) {
                        return fail(400, { type: 'update', ok: false, message: validation });
                }

                const { error } = await supabase
                        .from('articles')
                        .update({
                                title,
                                kind_id: kindId,
                                content: content || null,
                                slug: slug || null,
                                linkedin_url: linkedinUrl || null,
                                status
                        })
                        .eq('id', id);

                if (error) {
                        return fail(500, { type: 'update', ok: false, message: error.message });
                }

                revalidatePath('/internal/news');
                return { type: 'update', ok: true, message: 'Article updated successfully.' } satisfies NewsActionResult;
        },
        delete: async ({ request, cookies }) => {
                const supabase = ensureAuthenticated(cookies);

                if (!supabase) {
                        return fail(401, { type: 'delete', ok: false, message: 'You are not authenticated.' });
                }

                const formData = await request.formData();
                const id = parseString(formData.get('id'));

                if (!id) {
                        return fail(400, { type: 'delete', ok: false, message: 'Missing article identifier.' });
                }

                const { error } = await supabase.from('articles').delete().eq('id', id);

                if (error) {
                        return fail(500, { type: 'delete', ok: false, message: error.message });
                }

                revalidatePath('/internal/news');
                return { type: 'delete', ok: true, message: 'Article deleted successfully.' } satisfies NewsActionResult;
        }
};
