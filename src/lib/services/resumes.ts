import { createSupabaseServerClient, getSupabaseAdminClient } from '$lib/server/supabase';

export type ResumeRole = 'admin' | 'cms_admin' | 'employee' | 'employer';

type BaseBlock = { id?: string; hidden?: boolean };

export type ResumeBlock =
	| (BaseBlock & {
			type: 'header';
			name: string;
			title: string;
			contact_people: Array<{
				label: string;
				people: Array<{ name: string; phone?: string | null; email?: string | null }>;
			}>;
			summary: string;
	  })
	| (BaseBlock & {
			type: 'skills_grid';
			title: string;
			skills: string[];
			columns?: number;
	  })
	| (BaseBlock & {
			type: 'highlighted_experience';
			company: string;
			role: string;
			description: string;
			testimonial?: string | null;
			technologies: string[];
	  })
	| (BaseBlock & {
			type: 'experience_section';
			title: string;
	  })
	| (BaseBlock & {
			type: 'experience_item';
			startDate: string;
			endDate?: string | null;
			company: string;
			location?: string | null;
			role: string | string[];
			description: string;
			technologies: string[];
	  })
	| (BaseBlock & {
			type: 'section_header';
			title: string;
			divider?: boolean;
	  })
	| (BaseBlock & {
			type: 'skills_categorized';
			category: string;
			items: Array<string | { label: string; value?: string | null }>;
	  })
	| (BaseBlock & {
			type: 'multi_column_info';
			items: Array<{ label: string; description: string; technologies?: string[] }>;
	  })
	| (BaseBlock & {
			type: 'testimonial';
			quote: string;
			source: string;
	  })
	| (BaseBlock & {
			type: 'footer';
			note: string;
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

const demoBlocks: ResumeBlock[] = [
	{
		type: 'header',
		name: 'Pierre Elmén',
		title: 'Frontend developer and leader',
		summary: `Pierre is a curious and driven full-stack developer with solid experience
                in developing and integrating products from concept to launch and
                further development. He thrives in agile teams where he can work at a
                high pace and in close contact with both clients and end-users. Pierre
                values knowledge sharing within the team, which he sees as
                fundamental for creating a successful final product.  \n
                In previous roles, Pierre has not only focused on programming but has
                also taken responsibility throughout the entire development process –
                from requirements to design, creation, and implementation of new
                features. This experience has given him the opportunity to take overall
                responsibility in projects from start to finish. \n
                With a unique background as an HR generalist, Pierre stands out as a
                developer through his deep understanding of different personality
                types and roles, as well as his communication skills. Pierre is the natural
                counterpart and sounding board in the development team for the
                business.`,
		contact_people: [
			{
				label: 'Contact',
				people: [
					{ name: 'Pierre Elmén', phone: '+46 (0)73 640 06 22', email: 'pierre@pixelcode.se' },
					{ name: 'Robin Östberg', email: 'robin@pixelcode.se' }
				]
			}
		]
	},
	{
		type: 'skills_grid',
		title: 'Examples of skills',
		columns: 2,
		skills: [
			'ReactJS',
			'JavaScript',
			'Typescript',
			'Svelte',
			'NodeJS',
			'CSS / SASS',
			'Angular',
			'Figma',
			'UI/UX',
			'Adobe Illustrator',
			'Photoshop',
			'REST API',
			'GraphQL',
			'Supabase',
			'Firebase',
			'Material UI',
			'Fluent UI',
			'Tailwind',
			'GIT',
			'AWS'
		]
	},
	{
		type: 'highlighted_experience',
		company: 'Bokadirekt',
		role: 'Frontend Lead and UX/UI',
		description:
			'Responsible for evolving the client experience for Bokadirekt customers and internal operators. Pierre supported teams delivering booking flows, component libraries and admin tooling across web and mobile.',
		testimonial:
			'We feel supported within your team, the developers have excellent skills. They require little explanation of the tasks and directly solve critical issues, even those we thought impossible.',
		technologies: [
			'ReactJS',
			'Angular',
			'JavaScript',
			'Typescript',
			'NodeJS',
			'CSS / SASS',
			'UI/UX',
			'REST API',
			'GraphQL'
		],
		hidden: false
	},
	{
		type: 'highlighted_experience',
		company: 'Svenska Spel',
		role: 'Frontend Lead',
		description:
			'Led the frontend development for the new sports betting platform. Focused on performance, accessibility, and real-time data updates.',
		technologies: ['React', 'Redux', 'WebSocket', 'TypeScript', 'Styled Components'],
		hidden: false
	},
	{
		type: 'highlighted_experience',
		company: 'Hidden Startup',
		role: 'CTO',
		description:
			'Co-founded a fintech startup. Built the MVP from scratch and hired the initial engineering team.',
		technologies: ['Node.js', 'PostgreSQL', 'AWS', 'React Native'],
		hidden: true
	},
	{
		type: 'highlighted_experience',
		company: 'Another Hidden Project',
		role: 'Senior Developer',
		description: 'Consulted for a major bank to modernize their legacy systems.',
		technologies: ['Java', 'Spring Boot', 'Angular', 'Oracle'],
		hidden: true
	},
	{ type: 'experience_section', title: 'Previous Experience' },
	{
		type: 'experience_item',
		startDate: '2022-01-01',
		endDate: null,
		company: 'Svenska Spel',
		location: 'Stockholm',
		role: 'Frontend Lead, UI/UX and Scrum Coach',
		description:
			'Pierre led the design and development of Svenska Spel’s website from scratch as a full-stack developer with a frontend focus. He modernized core components, improved the design library and delivered a consistent experience across web and mobile.',
		technologies: [
			'ReactJS',
			'Angular',
			'JavaScript',
			'Typescript',
			'NodeJS',
			'CSS / SASS',
			'UI/UX',
			'REST API',
			'GraphQL',
			'Figma'
		]
	},
	{
		type: 'experience_item',
		startDate: '2021-01-01',
		endDate: '2023-12-31',
		company: 'Bokadirekt',
		location: 'Stockholm',
		role: 'Fullstack-developer',
		description:
			'Pierre rebuilt Bokadirekt’s mobile web app to an app-like experience, using React and Vue. He delivered new backend services with NodeJS and AWS, improved UI consistency and supported the design team with reusable components.',
		technologies: [
			'NodeJS',
			'Angular',
			'JavaScript',
			'Typescript',
			'CSS 3.0',
			'SASS',
			'UI/UX',
			'SQL',
			'AWS',
			'GraphQL',
			'Adobe Illustrator'
		]
	},
	{
		type: 'experience_item',
		startDate: '2023-08-01',
		endDate: '2023-11-30',
		company: 'elmdev',
		location: 'Stockholm',
		role: 'Fullstack developer, UI/UX and design',
		description:
			'Solo-developed a web-based phone operating system with TypeScript and React, using Neo4j for graph data and GitHub Actions for release automation. Built a component kit and ensured first-class mobile and desktop experiences.',
		technologies: [
			'ReactJS',
			'Angular',
			'JavaScript',
			'Typescript',
			'NodeJS',
			'Neo4j',
			'UI/UX',
			'Adobe Illustrator'
		]
	},
	{
		type: 'experience_item',
		startDate: '2019-01-01',
		endDate: '2019-12-31',
		company: 'Svenska Spel & Coegi AB',
		location: 'Stockholm',
		role: 'Fullstack-developer',
		description:
			'Developed internal tools to manage user behavior and site metrics at Svenska Spel. Delivered server-side APIs and admin dashboards while collaborating with the design team on visual refinements.',
		technologies: [
			'ReactJS',
			'Angular',
			'JavaScript',
			'Typescript',
			'NodeJS',
			'Neo4j',
			'UI/UX',
			'Adobe Illustrator'
		]
	},
	{
		type: 'experience_item',
		startDate: '2019-01-01',
		endDate: '2019-12-31',
		company: 'Örebro University',
		location: 'Örebro',
		role: 'Full stack developer',
		description:
			'Built a system to manage international traveler registrations and course assignments, handling email and data workflows. Delivered backend services and student-facing UI.',
		technologies: ['Java', 'SQL']
	},
	{
		type: 'experience_item',
		startDate: '2019-01-01',
		endDate: '2019-12-31',
		company: 'Uppsala University',
		location: 'Uppsala',
		role: 'Frontend developer',
		description:
			'Created a history-themed website with an interactive timeline. Responsible for frontend design, accessibility and visual storytelling inspired by the era showcased in the project.',
		technologies: ['ReactJS', 'HTML', 'JavaScript', 'CSS', 'API', 'Figma', 'Illustrator']
	},
	{
		type: 'section_header',
		title: 'Skills'
	},
	{
		type: 'skills_categorized',
		category: 'Techniques',
		items: [
			'ReactJS',
			'Angular',
			'Svelte',
			'JavaScript',
			'Typescript',
			'NodeJS',
			'REST API',
			'CSS 3.0',
			'SASS',
			'HTML 5',
			'Supabase',
			'GraphQL',
			'Webpack',
			'NextJS'
		]
	},
	{
		type: 'skills_categorized',
		category: 'Methods',
		items: ['Scrum', 'Agile', 'Kanban', 'Responsive design']
	},
	{
		type: 'section_header',
		title: 'Other'
	},
	{
		type: 'skills_categorized',
		category: 'Languages',
		items: [
			{ label: 'English', value: 'Professional working proficiency' },
			{ label: 'Swedish', value: 'Native speaker' }
		]
	},
	{
		type: 'skills_categorized',
		category: 'Portfolio',
		items: ['https://elmen.dev']
	},
	{
		type: 'footer',
		note: 'Worldclass tech by worldclass people',
		updated_at: 'Updated Jan 2024'
	}
];

const assignBlockIds = (blocks: ResumeBlock[]): ResumeBlock[] =>
	blocks.map((block) => ({
		...block,
		id: block.id ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
	}));

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
				content: assignBlockIds(demoBlocks),
				versions: [
					{
						id: 'demo-version-1',
						version_name: 'Main',
						is_main: true,
						is_active: true,
						content: assignBlockIds(demoBlocks),
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
		content: assignBlockIds(demoBlocks),
		preview_html: null,
		versions: [
			{
				id: 'demo-version-1',
				version_name: 'Main',
				is_main: true,
				is_active: true,
				content: assignBlockIds(demoBlocks),
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
		content: assignBlockIds(demoBlocks),
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
			content: assignBlockIds(demoBlocks),
			preview_html: null
		}
	] satisfies Resume[];
};
