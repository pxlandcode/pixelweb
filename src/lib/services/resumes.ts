import { getSupabaseAdminClient, createSupabaseServerClient } from '$lib/server/supabase';

export type ResumeRole = 'admin' | 'cms_admin' | 'employee' | 'employer';

type BaseBlock = { id?: string; hidden?: boolean };

export type LocalizedText = string | { sv: string; en: string };

export type ResumeBlock =
	| (BaseBlock & {
			type: 'header';
			name: string;
			title: LocalizedText;
			contact_people: Array<{
				label: LocalizedText;
				people: Array<{ name: string; phone?: string | null; email?: string | null }>;
			}>;
			summary: LocalizedText;
	  })
	| (BaseBlock & {
			type: 'skills_grid';
			title: LocalizedText;
			skills: string[];
			columns?: number;
	  })
	| (BaseBlock & {
			type: 'highlighted_experience';
			company: string;
			role: LocalizedText;
			description: LocalizedText;
			testimonial?: LocalizedText | null;
			technologies: string[];
	  })
	| (BaseBlock & {
			type: 'experience_section';
			title: LocalizedText;
	  })
	| (BaseBlock & {
			type: 'experience_item';
			startDate: string;
			endDate?: string | null;
			company: string;
			location?: LocalizedText | null;
			role: LocalizedText | LocalizedText[];
			description: LocalizedText;
			technologies: string[];
	  })
	| (BaseBlock & {
			type: 'section_header';
			title: LocalizedText;
			divider?: boolean;
	  })
	| (BaseBlock & {
			type: 'skills_categorized';
			category: LocalizedText;
			items: Array<string | { label: LocalizedText; value?: LocalizedText | null }>;
	  })
	| (BaseBlock & {
			type: 'multi_column_info';
			items: Array<{ label: LocalizedText; description: LocalizedText; technologies?: string[] }>;
	  })
	| (BaseBlock & {
			type: 'testimonial';
			quote: LocalizedText;
			source: string;
	  })
	| (BaseBlock & {
			type: 'footer';
			note: LocalizedText;
			updated_at?: string | null;
	  });

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

const withIds = (blocks: ResumeBlock[]): ResumeBlock[] =>
	blocks.map((block) => ({
		...block,
		id: block.id ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
	}));

const mapResumeRow = (row: any): Resume => ({
	id: String(row.id),
	user_id: row.user_id,
	version_name: row.version_name ?? 'Main',
	is_main: Boolean(row.is_main),
	is_active: Boolean(row.is_active ?? true),
	allow_word_export: Boolean(row.allow_word_export ?? false),
	content: withIds((row.content as ResumeBlock[]) ?? []),
	preview_html: row.preview_html ?? null
});

export const loadInternalResumeList = async (accessToken: string) => {
	const supabase = createSupabaseServerClient(accessToken);
	const admin = getSupabaseAdminClient();
	if (!supabase || !admin) return { resumes: [] as Resume[] };

	const { data, error } = await admin
		.from('resumes')
		.select(
			'id, user_id, version_name, is_main, is_active, allow_word_export, content, preview_html, created_at, updated_at'
		)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('[resumes] list error', error);
		return { resumes: [] as Resume[] };
	}

	return { resumes: (data ?? []).map(mapResumeRow) as Resume[] };
};

export const loadInternalResumeDetail = async (accessToken: string, id: number | string) => {
	const supabase = createSupabaseServerClient(accessToken);
	const admin = getSupabaseAdminClient();
	if (!supabase || !admin) return null;

	const { data, error } = await admin
		.from('resumes')
		.select(
			'id, user_id, version_name, is_main, is_active, allow_word_export, content, preview_html, created_at, updated_at'
		)
		.eq('id', id)
		.maybeSingle();

	if (error || !data) {
		console.error('[resumes] detail error', error);
		return null;
	}

	return mapResumeRow(data) satisfies Resume;
};

export const loadConsultantResume = async (id: number | string) => {
	const admin = getSupabaseAdminClient();
	if (!admin) return null;

	const { data, error } = await admin
		.from('resumes')
		.select(
			'id, user_id, version_name, is_main, is_active, allow_word_export, content, preview_html, created_at, updated_at'
		)
		.eq('id', id)
		.eq('is_active', true)
		.maybeSingle();

	if (error || !data) {
		console.error('[resumes] consultant error', error);
		return null;
	}

	return mapResumeRow(data) satisfies Resume;
};

export const listPublicResumes = async () => {
	const admin = getSupabaseAdminClient();
	if (!admin) return [] as Resume[];

	const { data, error } = await admin
		.from('resumes')
		.select(
			'id, user_id, version_name, is_main, is_active, allow_word_export, content, preview_html, created_at, updated_at'
		)
		.eq('is_active', true)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('[resumes] public list error', error);
		return [] as Resume[];
	}

	return (data ?? []).map(mapResumeRow) as Resume[];
};
