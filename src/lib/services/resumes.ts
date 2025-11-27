import { createSupabaseServerClient, getSupabaseAdminClient } from '$lib/server/supabase';

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

const demoBlocks: ResumeBlock[] = [
	{
		type: 'header',
		name: 'Pierre Elmén',
		title: {
			sv: 'Frontendutvecklare och ledare',
			en: 'Frontend developer and leader'
		},
		summary: {
			sv: `Pierre är en nyfiken och driven fullstackutvecklare med gedigen erfarenhet
                av att utveckla och integrera produkter från koncept till lansering och
                vidareutveckling. Han trivs i agila team där han kan arbeta i högt
                tempo och i nära kontakt med både kunder och slutanvändare. Pierre
                värdesätter kunskapsdelning inom teamet, vilket han ser som
                grundläggande för att skapa en framgångsrik slutprodukt.  \n
                I tidigare roller har Pierre inte bara fokuserat på programmering utan har
                också tagit ansvar genom hela utvecklingsprocessen –
                från kravställning till design, skapande och implementering av nya
                funktioner. Denna erfarenhet har gett honom möjligheten att ta ett övergripande
                ansvar i projekt från start till mål. \n
                Med en unik bakgrund som HR-generalist utmärker sig Pierre som
                utvecklare genom sin djupa förståelse för olika personlighetstyper
                och roller, samt sin kommunikationsförmåga. Pierre är den naturliga
                motparten och bollplanket i utvecklingsteamet för
                verksamheten.`,
			en: `Pierre is a curious and driven full-stack developer with solid experience
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
                business.`
		},
		contact_people: [
			{
				label: { sv: 'Kontakt', en: 'Contact' },
				people: [
					{ name: 'Pierre Elmén', phone: '+46 (0)73 640 06 22', email: 'pierre@pixelcode.se' },
					{ name: 'Robin Östberg', email: 'robin@pixelcode.se' }
				]
			}
		]
	},
	{
		type: 'skills_grid',
		title: { sv: 'Exempel på färdigheter', en: 'Examples of skills' },
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
		role: { sv: 'Frontend Lead och UX/UI', en: 'Frontend Lead and UX/UI' },
		description: {
			sv: 'Ansvarig för att utveckla kundupplevelsen för Bokadirekts kunder och interna operatörer. Pierre stöttade team som levererade bokningsflöden, komponentbibliotek och adminverktyg över webb och mobil.',
			en: 'Responsible for evolving the client experience for Bokadirekt customers and internal operators. Pierre supported teams delivering booking flows, component libraries and admin tooling across web and mobile.'
		},
		testimonial: {
			sv: 'Vi känner oss stöttade i ert team, utvecklarna har utmärkta färdigheter. De kräver lite förklaring av uppgifterna och löser direkt kritiska problem, även de vi trodde var omöjliga.',
			en: 'We feel supported within your team, the developers have excellent skills. They require little explanation of the tasks and directly solve critical issues, even those we thought impossible.'
		},
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
		role: { sv: 'Frontend Lead', en: 'Frontend Lead' },
		description: {
			sv: 'Ledde frontendutvecklingen för den nya sportspelsplattformen. Fokuserade på prestanda, tillgänglighet och realtidsdatauppdateringar.',
			en: 'Led the frontend development for the new sports betting platform. Focused on performance, accessibility, and real-time data updates.'
		},
		technologies: ['React', 'Redux', 'WebSocket', 'TypeScript', 'Styled Components'],
		hidden: false
	},
	{
		type: 'highlighted_experience',
		company: 'Hidden Startup',
		role: 'CTO',
		description: {
			sv: 'Medgrundare av en fintech-startup. Byggde MVP från grunden och anställde det initiala ingenjörsteamet.',
			en: 'Co-founded a fintech startup. Built the MVP from scratch and hired the initial engineering team.'
		},
		technologies: ['Node.js', 'PostgreSQL', 'AWS', 'React Native'],
		hidden: true
	},
	{
		type: 'highlighted_experience',
		company: 'Another Hidden Project',
		role: { sv: 'Senior Utvecklare', en: 'Senior Developer' },
		description: {
			sv: 'Konsultade för en stor bank för att modernisera deras äldre system.',
			en: 'Consulted for a major bank to modernize their legacy systems.'
		},
		technologies: ['Java', 'Spring Boot', 'Angular', 'Oracle'],
		hidden: true
	},
	{ type: 'experience_section', title: { sv: 'Tidigare Erfarenhet', en: 'Previous Experience' } },
	{
		type: 'experience_item',
		startDate: '2022-01-01',
		endDate: null,
		company: 'Svenska Spel',
		location: { sv: 'Stockholm', en: 'Stockholm' },
		role: {
			sv: 'Frontend Lead, UI/UX och Scrum Coach',
			en: 'Frontend Lead, UI/UX and Scrum Coach'
		},
		description: {
			sv: 'Pierre ledde design och utveckling av Svenska Spels webbplats från grunden som fullstackutvecklare med frontendfokus. Han moderniserade kärnkomponenter, förbättrade designbiblioteket och levererade en konsekvent upplevelse över webb och mobil.',
			en: 'Pierre led the design and development of Svenska Spel’s website from scratch as a full-stack developer with a frontend focus. He modernized core components, improved the design library and delivered a consistent experience across web and mobile.'
		},
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
		location: { sv: 'Stockholm', en: 'Stockholm' },
		role: { sv: 'Fullstackutvecklare', en: 'Fullstack-developer' },
		description: {
			sv: 'Pierre byggde om Bokadirekts mobila webbapp till en app-liknande upplevelse med React och Vue. Han levererade nya backendtjänster med NodeJS och AWS, förbättrade UI-konsistens och stöttade designteamet med återanvändbara komponenter.',
			en: 'Pierre rebuilt Bokadirekt’s mobile web app to an app-like experience, using React and Vue. He delivered new backend services with NodeJS and AWS, improved UI consistency and supported the design team with reusable components.'
		},
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
		location: { sv: 'Stockholm', en: 'Stockholm' },
		role: {
			sv: 'Fullstackutvecklare, UI/UX och design',
			en: 'Fullstack developer, UI/UX and design'
		},
		description: {
			sv: 'Ensamutvecklade ett webbaserat telefonoperativsystem med TypeScript och React, med Neo4j för grafdata och GitHub Actions för releaseautomatisering. Byggde ett komponentkit och säkerställde förstklassiga mobil- och skrivbordsupplevelser.',
			en: 'Solo-developed a web-based phone operating system with TypeScript and React, using Neo4j for graph data and GitHub Actions for release automation. Built a component kit and ensured first-class mobile and desktop experiences.'
		},
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
		location: { sv: 'Stockholm', en: 'Stockholm' },
		role: { sv: 'Fullstackutvecklare', en: 'Fullstack-developer' },
		description: {
			sv: 'Utvecklade interna verktyg för att hantera användarbeteende och webbplatsmätvärden på Svenska Spel. Levererade server-side API:er och adminpaneler samtidigt som han samarbetade med designteamet kring visuella förbättringar.',
			en: 'Developed internal tools to manage user behavior and site metrics at Svenska Spel. Delivered server-side APIs and admin dashboards while collaborating with the design team on visual refinements.'
		},
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
		location: { sv: 'Örebro', en: 'Örebro' },
		role: { sv: 'Fullstackutvecklare', en: 'Full stack developer' },
		description: {
			sv: 'Byggde ett system för att hantera internationella resenärsregistreringar och kurstilldelningar, hanterade e-post och dataflöden. Levererade backendtjänster och studentinriktat UI.',
			en: 'Built a system to manage international traveler registrations and course assignments, handling email and data workflows. Delivered backend services and student-facing UI.'
		},
		technologies: ['Java', 'SQL']
	},
	{
		type: 'experience_item',
		startDate: '2019-01-01',
		endDate: '2019-12-31',
		company: 'Uppsala University',
		location: { sv: 'Uppsala', en: 'Uppsala' },
		role: { sv: 'Frontendutvecklare', en: 'Frontend developer' },
		description: {
			sv: 'Skapade en historietema-webbplats med en interaktiv tidslinje. Ansvarig för frontenddesign, tillgänglighet och visuellt berättande inspirerat av eran som visades i projektet.',
			en: 'Created a history-themed website with an interactive timeline. Responsible for frontend design, accessibility and visual storytelling inspired by the era showcased in the project.'
		},
		technologies: ['ReactJS', 'HTML', 'JavaScript', 'CSS', 'API', 'Figma', 'Illustrator']
	},
	{
		type: 'section_header',
		title: { sv: 'Färdigheter', en: 'Skills' }
	},
	{
		type: 'skills_categorized',
		category: { sv: 'Tekniker', en: 'Techniques' },
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
		category: { sv: 'Metoder', en: 'Methods' },
		items: ['Scrum', 'Agile', 'Kanban', 'Responsive design']
	},
	{
		type: 'section_header',
		title: { sv: 'Övrigt', en: 'Other' }
	},
	{
		type: 'skills_categorized',
		category: { sv: 'Språk', en: 'Languages' },
		items: [
			{
				label: { sv: 'Engelska', en: 'English' },
				value: { sv: 'Professionell arbetsnivå', en: 'Professional working proficiency' }
			},
			{ label: { sv: 'Svenska', en: 'Swedish' }, value: { sv: 'Modersmål', en: 'Native speaker' } }
		]
	},
	{
		type: 'skills_categorized',
		category: { sv: 'Portfölj', en: 'Portfolio' },
		items: ['https://elmen.dev']
	},
	{
		type: 'footer',
		note: {
			sv: 'Världsklass teknik av världsklass människor',
			en: 'Worldclass tech by worldclass people'
		},
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
