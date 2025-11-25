import { createSupabaseServerClient, getSupabaseAdminClient } from '$lib/server/supabase';

export type ResumeRole = 'admin' | 'cms_admin' | 'employee' | 'employer';

export type ResumeBlock =
        | { type: 'title'; heading: string; subheading?: string | null }
        | { type: 'body'; text: string }
        | { type: 'bullets'; items: string[] }
        | { type: 'image'; url: string; alt: string }
        | {
                      type: 'role_history';
                      entries: Array<{
                              organization: string;
                              title: string;
                              start: string;
                              end?: string | null;
                              summary?: string | null;
                      }>;
              }
        | { type: 'skills'; skills: Array<{ name: string; level?: 'beginner' | 'intermediate' | 'advanced' }> }
        | {
                      type: 'contact';
                      email: string;
                      phone?: string | null;
                      location?: string | null;
                      links?: Array<{ label: string; url: string }>;
              };

export type ResumeVersion = {
        id: string;
        version_name: string;
        is_main: boolean;
        is_active: boolean;
        content: ResumeBlock[];
        preview_html?: string | null;
        created_at?: string;
};

export type Resume = {
        id: string;
        user_id: string;
        version_name: string;
        is_main: boolean;
        is_active: boolean;
        allow_word_export: boolean;
        content: ResumeBlock[];
        preview_html?: string | null;
        versions?: ResumeVersion[];
};

const demoBlocks: ResumeBlock[] = [
        { type: 'title', heading: 'Taylor Green', subheading: 'Product Engineer' },
        {
                type: 'contact',
                email: 'taylor.green@example.com',
                phone: '+1 555 234 5678',
                location: 'Remote (UTC-5)',
                links: [
                        { label: 'LinkedIn', url: 'https://www.linkedin.com/in/taylorgreen' },
                        { label: 'Portfolio', url: 'https://taylor.builds' }
                ]
        },
        {
                type: 'skills',
                skills: [
                        { name: 'SvelteKit', level: 'advanced' },
                        { name: 'TypeScript', level: 'advanced' },
                        { name: 'Supabase', level: 'intermediate' }
                ]
        },
        {
                type: 'role_history',
                entries: [
                        {
                                organization: 'Pixel & Code',
                                title: 'Product Engineer',
                                start: '2022-03-01',
                                summary: 'Builds client experiences with SvelteKit and Supabase.'
                        },
                        {
                                organization: 'Northwind Studio',
                                title: 'Frontend Engineer',
                                start: '2019-06-01',
                                end: '2022-02-01',
                                summary: 'Led UI delivery across web and mobile products.'
                        }
                ]
        },
        { type: 'bullets', items: ['Prefers accessible design systems', 'Delivers production-ready features quickly'] },
        { type: 'body', text: 'Available for product engineering engagements with fast iteration cycles.' }
];

export const loadInternalResumeList = async (accessToken: string) => {
        const supabase = createSupabaseServerClient(accessToken);
        if (!supabase) return { resumes: [] as Resume[] };

        const admin = getSupabaseAdminClient();
        if (!admin) return { resumes: [] as Resume[] };

        // Placeholder query wiring; replace with real selects once tables exist.
        return {
                resumes: [
                        {
                                id: 'demo-resume-1',
                                user_id: 'demo-user',
                                version_name: 'Main',
                                is_main: true,
                                is_active: true,
                                allow_word_export: true,
                                content: demoBlocks,
                                versions: [
                                        {
                                                id: 'demo-version-1',
                                                version_name: 'Main',
                                                is_main: true,
                                                is_active: true,
                                                content: demoBlocks,
                                                preview_html: null,
                                                created_at: new Date().toISOString()
                                        }
                                ]
                        }
                ] satisfies Resume[]
        };
};

export const loadInternalResumeDetail = async (accessToken: string, id: string) => {
        const supabase = createSupabaseServerClient(accessToken);
        if (!supabase) return null;

        return {
                id,
                user_id: 'demo-user',
                version_name: 'Main',
                is_main: true,
                is_active: true,
                allow_word_export: true,
                content: demoBlocks,
                preview_html: null,
                versions: [
                        {
                                id: 'demo-version-1',
                                version_name: 'Main',
                                is_main: true,
                                is_active: true,
                                content: demoBlocks,
                                preview_html: null,
                                created_at: new Date().toISOString()
                        }
                ]
        } satisfies Resume;
};

export const loadConsultantResume = async (id: string) => {
        return {
                id,
                user_id: 'consultant',
                version_name: 'Client view',
                is_main: true,
                is_active: true,
                allow_word_export: false,
                content: demoBlocks,
                preview_html: null
        } satisfies Resume;
};

export const listPublicResumes = async () => {
        return [
                {
                        id: 'public-resume-1',
                        user_id: 'consultant',
                        version_name: 'Main',
                        is_main: true,
                        is_active: true,
                        allow_word_export: false,
                        content: demoBlocks,
                        preview_html: null
                }
        ] satisfies Resume[];
};
