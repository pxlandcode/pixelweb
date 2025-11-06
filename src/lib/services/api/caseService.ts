import { getSupabaseClient } from '$lib/supabaseClient';
import type { CaseRecord } from '$lib/types';

type CaseInput = {
        eyebrow?: string | null;
        title?: string;
        description?: string | null;
        bullets?: string[] | null;
        img?: string | null;
        imagePosition?: 'left' | 'right' | null;
        bodyHtml?: string | null;
};

const logError = (context: string, error: unknown) => {
        console.error(`[caseService] ${context}`, error);
};

const getClient = () => {
        try {
                return getSupabaseClient();
        } catch (error) {
                logError('Failed to create Supabase client', error);
                return null;
        }
};

const isStringArray = (value: unknown): string[] | null => {
        if (!Array.isArray(value)) {
                return null;
        }

        const normalized = value
                .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
                .filter((entry) => Boolean(entry));

        return normalized.length ? normalized : null;
};

const sanitizeImagePosition = (value: CaseInput['imagePosition']): CaseRecord['imagePosition'] => {
        if (value === 'left' || value === 'right') {
                return value;
        }

        return null;
};

const sanitizePayload = (payload: CaseInput) => {
        const bullets = payload.bullets ?? null;
        const cleanedBullets = Array.isArray(bullets)
                ? bullets
                          .map((bullet) => (typeof bullet === 'string' ? bullet.trim() : ''))
                          .filter((bullet) => Boolean(bullet))
                : null;

        return {
                eyebrow: payload.eyebrow?.trim() || null,
                title: payload.title?.trim() ?? '',
                description: payload.description?.trim() || null,
                bullets: cleanedBullets && cleanedBullets.length ? cleanedBullets : null,
                img: payload.img?.trim() || null,
                imagePosition: sanitizeImagePosition(payload.imagePosition ?? null),
                bodyHtml: payload.bodyHtml?.trim() || null
        } satisfies Record<string, unknown>;
};

const mapRecord = (record: Record<string, unknown>): CaseRecord => {
        const source = record as Record<string, unknown>;

        const rawBullets = source['bullets'];
        const bullets = isStringArray(rawBullets);
        const imagePosition = source['imagePosition'] ?? source['image_position'];

        return {
                id: String(source['id'] ?? ''),
                eyebrow: (source['eyebrow'] as string | null | undefined) ?? null,
                title: (source['title'] as string | undefined) ?? '',
                description: (source['description'] as string | null | undefined) ?? null,
                bullets,
                img: (source['img'] as string | null | undefined) ?? null,
                imgAlt:
                        (source['imgAlt'] as string | null | undefined) ??
                        (source['img_alt'] as string | null | undefined) ??
                        null,
                imagePosition: sanitizeImagePosition((imagePosition as string | null | undefined) ?? null),
                bodyHtml:
                        (source['bodyHtml'] as string | null | undefined) ??
                        (source['body_html'] as string | null | undefined) ??
                        null,
                created_at: (source['created_at'] as string | null | undefined) ?? null,
                updated_at: (source['updated_at'] as string | null | undefined) ?? null
        } satisfies CaseRecord;
};

export const fetchCases = async (): Promise<CaseRecord[]> => {
        const client = getClient();

        if (!client) {
                return [];
        }

        try {
                const { data, error } = await client
                        .from('cases')
                        .select('*')
                        .order('created_at', { ascending: false });

                if (error) {
                        throw error;
                }

                return (data ?? []).map((entry) => mapRecord(entry as Record<string, unknown>));
        } catch (error) {
                logError('Failed to fetch cases', error);
                return [];
        }
};

export const fetchCaseById = async (id: string | number): Promise<CaseRecord | null> => {
        const client = getClient();

        if (!client) {
                return null;
        }

        try {
                const { data, error } = await client.from('cases').select('*').eq('id', id).single();

                if (error) {
                        throw error;
                }

                return data ? mapRecord(data as Record<string, unknown>) : null;
        } catch (error) {
                logError(`Failed to fetch case with id ${id}`, error);
                return null;
        }
};

export const createCase = async (payload: CaseInput): Promise<CaseRecord | null> => {
        const client = getClient();

        if (!client) {
                return null;
        }

        const sanitized = sanitizePayload(payload);

        if (!sanitized.title) {
                console.warn('[caseService] createCase called without a title.');
                return null;
        }

        try {
                const { data, error } = await client
                        .from('cases')
                        .insert(sanitized)
                        .select('*')
                        .single();

                if (error) {
                        throw error;
                }

                return data ? mapRecord(data as Record<string, unknown>) : null;
        } catch (error) {
                logError('Failed to create case', error);
                throw error;
        }
};

export const updateCase = async (
        id: string | number,
        payload: CaseInput
): Promise<CaseRecord | null> => {
        const client = getClient();

        if (!client) {
                return null;
        }

        const sanitized = sanitizePayload(payload);

        try {
                const { data, error } = await client
                        .from('cases')
                        .update(sanitized)
                        .eq('id', id)
                        .select('*')
                        .single();

                if (error) {
                        throw error;
                }

                return data ? mapRecord(data as Record<string, unknown>) : null;
        } catch (error) {
                logError(`Failed to update case with id ${id}`, error);
                throw error;
        }
};

export const deleteCase = async (id: string | number): Promise<boolean> => {
        const client = getClient();

        if (!client) {
                return false;
        }

        try {
                const { error } = await client.from('cases').delete().eq('id', id);

                if (error) {
                        throw error;
                }

                return true;
        } catch (error) {
                logError(`Failed to delete case with id ${id}`, error);
                return false;
        }
};

