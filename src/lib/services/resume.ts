/**
 * Simplified Resume Service
 *
 * Mocked API-style data for resumes and people.
 * IDs are numeric to mirror the upcoming database layer.
 */

import type { Resume, ResumeData, LocalizedText, Person, TechCategory } from '$lib/types/resume';

type Language = 'sv' | 'en';

const normalizeId = (value: number | string): number => Number(value);

export const getText = (text: LocalizedText, lang: Language): string => {
	if (typeof text === 'string') return text;
	return text[lang] ?? text.sv ?? '';
};

const cloneTechStack = (stack: TechCategory[]): TechCategory[] =>
	stack.map((category) => ({ ...category, skills: [...category.skills] }));

const BASE_TECH_STACK: TechCategory[] = [
	{ id: 'frontend', name: 'Frontend', skills: ['Svelte', 'React', 'Tailwind', 'TypeScript'] },
	{ id: 'backend', name: 'Backend', skills: ['Node.js', 'PostgreSQL', 'Supabase'] },
	{ id: 'tools', name: 'Tools', skills: ['Git', 'Docker', 'Figma'] }
];

const ML_TECH_STACK: TechCategory[] = [
	...BASE_TECH_STACK,
	{ id: 'ai-ml', name: 'AI / ML', skills: ['Python', 'FastAPI', 'PyTorch', 'Whisper', 'ONNX'] }
];

const DESIGN_TECH_STACK: TechCategory[] = [
	{ id: 'design', name: 'Design', skills: ['Figma', 'UI/UX', 'Design Systems', 'Prototyping'] },
	{
		id: 'research',
		name: 'Research',
		skills: ['User Interviews', 'Usability Testing', 'Workshops']
	},
	{ id: 'tools', name: 'Tools', skills: ['FigJam', 'Notion', 'Miro'] }
];

const PEOPLE: Person[] = [
	{
		id: 1,
		slug: 'pierre',
		name: 'Pierre Elmén',
		title: 'Tech Lead',
		portraitId: 'pierrePortrait',
		bio: 'Pierre leads the technical vision and mentors the team to achieve excellence.',
		techStack: cloneTechStack(BASE_TECH_STACK)
	},
	{
		id: 2,
		slug: 'jonas-holmer',
		name: 'Jonas Holmer',
		title: 'Senior AI / ML Consultant',
		bio: 'Jonas is a senior consultant specializing in AI, machine learning, and backend systems. He focuses on production-grade ML services, scalable systems, and pragmatic solutions for product teams.',
		techStack: cloneTechStack(ML_TECH_STACK)
	},
	{
		id: 3,
		slug: 'andreas',
		name: 'Andreas',
		title: 'Senior Developer',
		portraitId: 'andreasPortrait',
		bio: 'Andreas is a seasoned developer with a passion for clean code and scalable architecture.',
		techStack: cloneTechStack(BASE_TECH_STACK)
	},
	{
		id: 4,
		slug: 'emilia',
		name: 'Emilia',
		title: 'UX Designer',
		portraitId: 'emiliaPortrait',
		bio: 'Emilia creates intuitive and beautiful user experiences that delight customers.',
		techStack: cloneTechStack(DESIGN_TECH_STACK)
	},
	{
		id: 5,
		slug: 'linus',
		name: 'Linus',
		title: 'Frontend Developer',
		portraitId: 'linusPortrait',
		bio: 'Linus loves building interactive and responsive web applications with the latest tech.',
		techStack: cloneTechStack(BASE_TECH_STACK)
	},
	{
		id: 6,
		slug: 'martin',
		name: 'Martin',
		title: 'Backend Developer',
		portraitId: 'martinPortrait',
		bio: 'Martin ensures our systems are robust, secure, and performant under load.',
		techStack: cloneTechStack(BASE_TECH_STACK)
	},
	{
		id: 7,
		slug: 'nicklas',
		name: 'Nicklas',
		title: 'Project Manager',
		portraitId: 'nicklasPortrait',
		bio: 'Nicklas keeps projects on track and ensures clear communication between teams.',
		techStack: cloneTechStack([
			{
				id: 'leadership',
				name: 'Leadership',
				skills: ['Stakeholder mgmt', 'Workshops', 'Roadmaps']
			},
			{ id: 'methods', name: 'Methods', skills: ['Scrum', 'Kanban', 'Lean'] }
		])
	},
	{
		id: 8,
		slug: 'oliver',
		name: 'Oliver',
		title: 'Full Stack Developer',
		portraitId: 'oliverPortrait',
		bio: 'Oliver is a versatile developer who can handle everything from database to frontend.',
		techStack: cloneTechStack(BASE_TECH_STACK)
	},
	{
		id: 9,
		slug: 'anonymous-fullstack',
		name: '',
		title: 'Fullstack Developer',
		bio: 'Fullstack developer with 20 years of professional experience across a wide range of software projects. Expertise includes web development, cloud computing, gaming, animation, audio, agile practices, and test automation.',
		techStack: cloneTechStack(BASE_TECH_STACK)
	}
];

const DEFAULT_EXAMPLE_SKILLS = [
	'TypeScript',
	'Svelte',
	'React',
	'Node.js',
	'PostgreSQL',
	'Supabase',
	'Tailwind',
	'GraphQL',
	'Docker'
];

const DEFAULT_TECHNIQUES = [
	'TypeScript',
	'Svelte',
	'React',
	'Node.js',
	'PostgreSQL',
	'Supabase',
	'GraphQL',
	'AWS'
];

const DEFAULT_METHODS = ['Scrum', 'Agile', 'Kanban', 'CI/CD', 'Test automation'];

const DEFAULT_LANGUAGES: ResumeData['languages'] = [
	{
		label: { sv: 'Engelska', en: 'English' },
		value: { sv: 'Professionell arbetsnivå', en: 'Professional working proficiency' }
	},
	{
		label: { sv: 'Svenska', en: 'Swedish' },
		value: { sv: 'Modersmål', en: 'Native speaker' }
	}
];

const DEFAULT_EDUCATION: ResumeData['education'] = [
	{
		label: '2014 - 2016',
		value: {
			sv: 'Master of Science in Computer Science',
			en: 'Master of Science in Computer Science'
		}
	},
	{
		label: '2011 - 2014',
		value: { sv: 'Bachelor in Software Engineering', en: 'Bachelor in Software Engineering' }
	}
];

const DEFAULT_FOOTER: LocalizedText = {
	sv: 'https://pixelcode.se',
	en: 'https://pixelcode.se'
};

const defaultHighlightedExperiences = (
	role: LocalizedText
): ResumeData['highlightedExperiences'] => [
	{
		company: 'Pixel&Code',
		role,
		description: {
			sv: 'Ledande konsult för produktteam och komplexa leveranser inom webb och moln.',
			en: 'Lead consultant for product teams, delivering complex web and cloud projects.'
		},
		technologies: ['Svelte', 'TypeScript', 'Supabase', 'PostgreSQL']
	},
	{
		company: 'Client Partner',
		role,
		description: {
			sv: 'Stöttade kunder med arkitektur, utveckling och kunskapsöverföring.',
			en: 'Supported clients with architecture, implementation, and knowledge transfer.'
		},
		technologies: ['React', 'Node.js', 'AWS']
	}
];

const defaultExperiences = (role: LocalizedText): ResumeData['experiences'] => [
	{
		startDate: '2022-01',
		endDate: null,
		company: 'Pixel&Code',
		location: { sv: 'Stockholm', en: 'Stockholm' },
		role,
		description: {
			sv: 'Ansvarig för leverans av moderna webblösningar och ledde mindre team i kunduppdrag.',
			en: 'Responsible for delivering modern web solutions while leading small delivery teams.'
		},
		technologies: ['Svelte', 'TypeScript', 'Supabase', 'PostgreSQL']
	},
	{
		startDate: '2019-01',
		endDate: '2021-12',
		company: 'Consulting Partner',
		location: { sv: 'Remote', en: 'Remote' },
		role,
		description: {
			sv: 'Utvecklade produkter från prototyp till produktion och handledde team i agil leverans.',
			en: 'Delivered products from prototype to production and mentored teams in agile delivery.'
		},
		technologies: ['React', 'Node.js', 'AWS']
	}
];

const buildGenericResumeData = (
	person: Person,
	role: string,
	overrides: Partial<ResumeData> = {}
): ResumeData => {
	const localizedRole: LocalizedText = { sv: role, en: role };
	const name = person.name || 'Anonymous Consultant';

	return {
		name,
		title: overrides.title ?? localizedRole,
		summary: overrides.summary ?? {
			sv: `<p>${name} är en konsult som fokuserar på att leverera affärsnytta med modern teknik.</p>`,
			en: `<p>${name} is a consultant focused on shipping business value with modern technology.</p>`
		},
		contacts: overrides.contacts ?? [
			{
				name: name || 'Pixel&Code',
				email: `${person.slug}@pixelcode.se`,
				phone: '+46 70 123 45 67'
			}
		],
		exampleSkills: overrides.exampleSkills ?? DEFAULT_EXAMPLE_SKILLS,
		highlightedExperiences:
			overrides.highlightedExperiences ?? defaultHighlightedExperiences(localizedRole),
		experiences: overrides.experiences ?? defaultExperiences(localizedRole),
		techniques: overrides.techniques ?? DEFAULT_TECHNIQUES,
		methods: overrides.methods ?? DEFAULT_METHODS,
		languages: overrides.languages ?? DEFAULT_LANGUAGES,
		education: overrides.education ?? DEFAULT_EDUCATION,
		portfolio: overrides.portfolio ?? [`https://pixelcode.se/${person.slug}`],
		footerNote: overrides.footerNote ?? DEFAULT_FOOTER
	};
};

const requirePerson = (slug: string): Person => {
	const person = PEOPLE.find((p) => p.slug === slug);
	if (!person) {
		throw new Error(`Person not found for slug ${slug}`);
	}
	return person;
};

const pierreResumeData: ResumeData = {
	name: 'Pierre Elmén',
	title: {
		sv: 'Frontendutvecklare och ledare',
		en: 'Frontend developer and leader'
	},
	summary: {
		sv: 'Pierre är en nyfiken och driven fullstackutvecklare med gedigen erfarenhet av att utveckla och integrera produkter från koncept till lansering och vidareutveckling. Han trivs i agila team där han kan arbeta i högt tempo och i nära kontakt med både kunder och slutanvändare.',
		en: 'Pierre is a curious and driven full-stack developer with solid experience in developing and integrating products from concept to launch and further development. He thrives in agile teams where he can work at a high pace and in close contact with both clients and end-users.'
	},
	contacts: [{ name: 'Pierre Elmén', phone: '+46 (0)73 640 06 22', email: 'pierre@pixelcode.se' }],
	exampleSkills: [
		'ReactJS',
		'JavaScript',
		'TypeScript',
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
	],
	highlightedExperiences: [
		{
			company: 'Bokadirekt',
			role: { sv: 'Frontend Lead och UX/UI', en: 'Frontend Lead and UX/UI' },
			description: {
				sv: 'Ansvarig för att utveckla kundupplevelsen för Bokadirekts kunder och interna operatörer.',
				en: 'Responsible for evolving the client experience for Bokadirekt customers and internal operators.'
			},
			technologies: [
				'ReactJS',
				'Angular',
				'JavaScript',
				'TypeScript',
				'NodeJS',
				'CSS / SASS',
				'UI/UX',
				'REST API',
				'GraphQL'
			]
		},
		{
			company: 'Svenska Spel',
			role: { sv: 'Frontend Lead', en: 'Frontend Lead' },
			description: {
				sv: 'Ledde frontendutvecklingen för den nya sportspelsplattformen.',
				en: 'Led the frontend development for the new sports betting platform.'
			},
			technologies: ['React', 'Redux', 'WebSocket', 'TypeScript', 'Styled Components']
		}
	],
	experiences: [
		{
			startDate: '2022-01',
			endDate: null,
			company: 'Svenska Spel',
			location: { sv: 'Stockholm', en: 'Stockholm' },
			role: {
				sv: 'Frontend Lead, UI/UX och Scrum Coach',
				en: 'Frontend Lead, UI/UX and Scrum Coach'
			},
			description: {
				sv: 'Pierre ledde design och utveckling av Svenska Spels webbplats från grunden som fullstackutvecklare med frontendfokus.',
				en: 'Pierre led the design and development of Svenska Spel website from scratch as a full-stack developer with a frontend focus.'
			},
			technologies: [
				'ReactJS',
				'Angular',
				'JavaScript',
				'TypeScript',
				'NodeJS',
				'CSS / SASS',
				'UI/UX',
				'REST API',
				'GraphQL',
				'Figma'
			]
		},
		{
			startDate: '2021-01',
			endDate: '2023-12',
			company: 'Bokadirekt',
			location: { sv: 'Stockholm', en: 'Stockholm' },
			role: { sv: 'Fullstackutvecklare', en: 'Fullstack Developer' },
			description: {
				sv: 'Pierre byggde om Bokadirekts mobila webbapp till en app-liknande upplevelse med React och Vue.',
				en: 'Pierre rebuilt the Bokadirekt mobile web app to an app-like experience, using React and Vue.'
			},
			technologies: [
				'NodeJS',
				'Angular',
				'JavaScript',
				'TypeScript',
				'CSS',
				'SASS',
				'UI/UX',
				'SQL',
				'AWS',
				'GraphQL',
				'Adobe Illustrator'
			]
		}
	],
	techniques: [
		'ReactJS',
		'Angular',
		'Svelte',
		'JavaScript',
		'TypeScript',
		'NodeJS',
		'REST API',
		'CSS',
		'SASS',
		'HTML',
		'Supabase',
		'GraphQL',
		'Webpack',
		'NextJS'
	],
	methods: ['Scrum', 'Agile', 'Kanban', 'Responsive design'],
	languages: [
		{
			label: { sv: 'Engelska', en: 'English' },
			value: { sv: 'Professionell arbetsnivå', en: 'Professional working proficiency' }
		},
		{
			label: { sv: 'Svenska', en: 'Swedish' },
			value: { sv: 'Modersmål', en: 'Native speaker' }
		}
	],
	education: [
		{
			label: '2015 - 2018',
			value: { sv: 'Kandidatexamen i datavetenskap – KTH', en: 'BSc in Computer Science – KTH' }
		}
	],
	portfolio: ['https://elmen.dev']
};

const jonasResumeData: ResumeData = {
	name: 'Jonas Holmer',
	title: {
		sv: 'Fullstack-utvecklare',
		en: 'Fullstack Developer'
	},
	summary: {
		sv: `
<p>Erfaren fullstack-konsult med lång bakgrund inom systemutveckling, medtech och distribuerade tjänster.</p>
<p>Van att ta tekniskt ansvar för komplexa lösningar – från prototyp och analys till produktion, skalning och långsiktig förvaltning.</p>
`,
		en: `
<p>Experienced fullstack consultant with a strong background in system development, medtech, and distributed services.</p>
<p>Comfortable taking technical ownership from early analysis and prototyping through production, scaling, and long-term maintenance.</p>
`
	},
	contacts: [],
	exampleSkills: [
		'Python',
		'JavaScript',
		'TypeScript',
		'React',
		'Vue.js',
		'Flask',
		'Django',
		'Node.js',
		'AWS',
		'GCP',
		'Docker',
		'Kubernetes',
		'Postgres',
		'MySQL',
		'MongoDB',
		'Elixir',
		'Java',
		'C/C++',
		'HTML/CSS',
		'Cypress'
	],
	highlightedExperiences: [
		{
			company: 'Mindmore',
			role: { sv: 'Senior konsult', en: 'Senior Consultant' },
			description: {
				sv: `
<p>Arbetade med flera tekniskt avancerade initiativ inom medtech med fokus på talbehandling, skalning och beslutsstöd.</p>
<ul>
	<li>Utvecklade en tal-till-text-tjänst baserad på en destillerad version av OpenAI Whisper.</li>
	<li>Byggde ett tunt mikrotjänstgränssnitt med Python och FastAPI.</li>
	<li>Driftsatte tjänster som containeriserade lösningar.</li>
</ul>
`,
				en: `
<p>Worked on several technically advanced initiatives within medtech, focusing on speech processing, scalability, and decision support.</p>
<ul>
	<li>Developed a speech-to-text service based on a distilled version of OpenAI Whisper.</li>
	<li>Built a thin microservice interface using Python and FastAPI.</li>
	<li>Deployed services as containerized solutions.</li>
</ul>
`
			},
			technologies: ['Python', 'FastAPI', 'PyTorch', 'Docker', 'OpenAI Whisper']
		}
	],
	experiences: [
		{
			startDate: '2020-01',
			endDate: null,
			company: 'Mindmore',
			role: { sv: 'Senior konsult', en: 'Senior Consultant' },
			description: {
				sv: `
<ul>
	<li><strong>Taltranskribering:</strong> Byggde en AI-baserad tjänst för transkribering av tal till text, baserad på en destillerad variant av OpenAI Whisper.</li>
	<li><strong>Mikrotjänster:</strong> Implementerade ett tunt API-lager med Python och FastAPI.</li>
	<li><strong>Drift:</strong> Tjänsterna kördes som containeriserade lösningar.</li>
	<li><strong>Taldetektering i webbläsaren:</strong> Identifierade en skalningsflaskhals i stora mängder röstinspelningar där okänt talinnehåll var dyrt att processa server-side.</li>
	<li>Implementerade en lättvikts binär klassificerare (VAD) direkt i klienten med ONNX.</li>
	<li>Möjliggjorde filtrering av inspelningar utan mänskligt tal samt isolering av relevanta segment.</li>
	<li><strong>Automatisk journalföring (PoC):</strong> Byggde prototyp för generering av kliniska journalanteckningar baserat på kognitiva testresultat.</li>
	<li>Delade testdata mellan flera LLM:er och använde en tredje modell för att bedöma samstämmighet (0–100).</li>
	<li>Möjliggjorde filtrering av journalanteckningar med hög tillförlitlighet och konfidensvärde.</li>
</ul>
`,
				en: `
<ul>
	<li><strong>Speech transcription:</strong> Built an AI-based speech-to-text service using a distilled variant of OpenAI Whisper.</li>
	<li><strong>Microservices:</strong> Implemented a thin API layer using Python and FastAPI.</li>
	<li><strong>Operations:</strong> Services were deployed as containerized solutions.</li>
	<li><strong>Browser-based speech detection:</strong> Identified a scaling bottleneck caused by large volumes of recordings with unknown speech content.</li>
	<li>Implemented a lightweight binary classifier (VAD) running client-side using ONNX.</li>
	<li>Enabled filtering of recordings without human speech and isolation of relevant segments.</li>
	<li><strong>Automated clinical journaling (PoC):</strong> Built a prototype for generating clinical journal entries from cognitive test results.</li>
	<li>Split test data across multiple LLMs and used a third model to score agreement (0–100).</li>
	<li>Enabled filtering of high-confidence journal entries with confidence scores.</li>
</ul>
`
			},
			technologies: [
				'Python',
				'FastAPI',
				'PyTorch',
				'ONNX',
				'JavaScript',
				'TypeScript',
				'Docker',
				'LLMs'
			]
		},
		{
			startDate: '2021-01',
			endDate: '2022-01',
			company: 'Open Source',
			role: { sv: 'Fullstackutvecklare', en: 'Fullstackutvecklare' },
			description: {
				sv: `
<ul>
	<li>Skapade ett agentbaserat LLM-system för storskalig refaktorering av kodbaser.</li>
	<li>Designat för att hantera begränsningar i kontextfönster vid längre AI-arbetsflöden.</li>
	<li>Varje agent sammanfattar sitt arbete för vidare användning i efterföljande agenter.</li>
	<li>Stöd för utbytbara AI-modeller (ChatGPT, Claude, Grok m.fl.).</li>
	<li>Publikt tillgängligt projekt: https://github.com/hyrfilm/cutup</li>
</ul>
`,
				en: `
<ul>
	<li>Created an agent-based LLM system for large-scale refactoring of codebases.</li>
	<li>Designed to mitigate context-window limitations in long-running AI tasks.</li>
	<li>Each agent summarizes its work for downstream agents.</li>
	<li>Supports pluggable AI models (ChatGPT, Claude, Grok, etc).</li>
	<li>Public project: https://github.com/hyrfilm/cutup</li>
</ul>
`
			},
			technologies: ['Python', 'Pydantic', 'LLMs', 'Agents']
		},
		{
			startDate: '2016-01',
			endDate: '2018-12',
			company: 'Office Space Marketplace Platform',
			role: { sv: 'Backend-utvecklare', en: 'Backend Developer' },
			description: {
				sv: 'Omstrukturerade en legacy-backend och byggde nya backend-tjänster och API:er.',
				en: 'Refactored a legacy backend and built new backend services and APIs.'
			},
			technologies: ['Python', 'Flask', 'JavaScript', 'React', 'Docker', 'Postgres', 'GCP']
		}
	],
	techniques: [
		'Python',
		'JavaScript',
		'TypeScript',
		'Elixir',
		'Java',
		'C/C++',
		'HTML/CSS',
		'React',
		'Vue.js',
		'Flask',
		'Django',
		'Node.js',
		'AWS',
		'GCP',
		'Docker',
		'Kubernetes',
		'Postgres',
		'MySQL',
		'MongoDB',
		'Cypress',
		'Jest'
	],
	methods: ['Agile', 'TDD', 'CI/CD', 'Test Automation', 'Consulting'],
	education: [
		{
			label: '2014 - 2016',
			value: {
				sv: 'Master of Fine Arts – Konstfack',
				en: 'Master of Fine Arts – University of Arts, Crafts and Design'
			}
		},
		{
			label: '2011 - 2013',
			value: {
				sv: 'Bachelor of Fine Arts – Konstfack',
				en: 'Bachelor of Fine Arts – University of Arts, Crafts and Design'
			}
		}
	],
	languages: [
		{
			label: { sv: 'Svenska', en: 'Swedish' },
			value: { sv: 'Modersmål', en: 'Native speaker' }
		},
		{
			label: { sv: 'Engelska', en: 'English' },
			value: { sv: 'Professionell arbetsnivå', en: 'Professional working proficiency' }
		}
	],
	footerNote: {
		sv: 'Referenser lämnas på begäran.',
		en: 'References available upon request.'
	}
};

type ResumeSeed = {
	id: number;
	personSlug: Person['slug'];
	title: string;
	version: string;
	updatedAt: string;
	isMain: boolean;
	data?: ResumeData;
	overrides?: Partial<ResumeData>;
};

const createResume = (seed: ResumeSeed): Resume => {
	const person = requirePerson(seed.personSlug);
	return {
		id: seed.id,
		personId: person.id,
		title: seed.title,
		version: seed.version,
		updatedAt: seed.updatedAt,
		isMain: seed.isMain,
		data: seed.data ?? buildGenericResumeData(person, seed.title, seed.overrides)
	};
};

const RESUMES: Resume[] = [
	createResume({
		id: 1001,
		personSlug: 'pierre',
		title: 'Tech Lead',
		version: '4.5',
		updatedAt: '2024-01-15',
		isMain: true,
		data: pierreResumeData
	}),
	createResume({
		id: 1002,
		personSlug: 'pierre',
		title: 'Software Architect',
		version: '1.0',
		updatedAt: '2024-05-10',
		isMain: false,
		overrides: {
			summary: {
				sv: '<p>Teknisk arkitekt med fokus på plattformsarbete, komponentbibliotek och teamcoaching.</p>',
				en: '<p>Technical architect focused on platform work, design systems, and coaching teams.</p>'
			},
			portfolio: ['https://pixelcode.se', 'https://elmen.dev']
		}
	}),
	createResume({
		id: 1003,
		personSlug: 'jonas-holmer',
		title: 'Senior AI / ML Consultant',
		version: '1.0',
		updatedAt: '2024-11-28',
		isMain: true,
		data: jonasResumeData
	}),
	createResume({
		id: 1004,
		personSlug: 'andreas',
		title: 'Fullstack Developer',
		version: '1.0',
		updatedAt: '2024-10-10',
		isMain: true
	}),
	createResume({
		id: 1005,
		personSlug: 'andreas',
		title: 'Backend Specialist',
		version: '1.0',
		updatedAt: '2024-07-01',
		isMain: false,
		overrides: {
			exampleSkills: [
				'Node.js',
				'PostgreSQL',
				'Supabase',
				'Redis',
				'GraphQL',
				'Docker',
				'Kubernetes'
			]
		}
	}),
	createResume({
		id: 1006,
		personSlug: 'emilia',
		title: 'UX/UI Designer',
		version: '2.1',
		updatedAt: '2024-09-18',
		isMain: true,
		overrides: {
			exampleSkills: [
				'Figma',
				'UI/UX',
				'Prototyping',
				'Design Systems',
				'Accessibility',
				'User Research'
			],
			techniques: ['Figma', 'Design Systems', 'Prototyping', 'Accessibility'],
			methods: ['Design Sprints', 'Workshops', 'Usability testing'],
			summary: {
				sv: '<p>UX-designer som tar fram tydliga flöden och designbibliotek för produktteam.</p>',
				en: '<p>UX designer building clear flows and design libraries for product teams.</p>'
			}
		}
	}),
	createResume({
		id: 1007,
		personSlug: 'linus',
		title: 'Frontend Developer',
		version: '1.5',
		updatedAt: '2024-08-05',
		isMain: true
	}),
	createResume({
		id: 1008,
		personSlug: 'linus',
		title: 'React Developer',
		version: '1.0',
		updatedAt: '2023-12-12',
		isMain: false,
		overrides: { exampleSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind', 'Storybook'] }
	}),
	createResume({
		id: 1009,
		personSlug: 'martin',
		title: 'Backend Engineer',
		version: '3.0',
		updatedAt: '2024-06-20',
		isMain: true,
		overrides: {
			exampleSkills: ['Node.js', 'PostgreSQL', 'Supabase', 'Docker', 'Kubernetes', 'Redis'],
			techniques: ['Node.js', 'PostgreSQL', 'Supabase', 'Redis', 'Go']
		}
	}),
	createResume({
		id: 1010,
		personSlug: 'nicklas',
		title: 'Project Manager',
		version: '1.2',
		updatedAt: '2024-05-15',
		isMain: true,
		overrides: {
			exampleSkills: ['Scrum', 'Kanban', 'Stakeholder management', 'Roadmapping', 'Workshops'],
			techniques: ['Scrum', 'Kanban', 'Agile Coaching'],
			methods: ['Workshops', 'Prioritization', 'Risk management']
		}
	}),
	createResume({
		id: 1011,
		personSlug: 'nicklas',
		title: 'Scrum Master',
		version: '1.0',
		updatedAt: '2023-11-01',
		isMain: false
	}),
	createResume({
		id: 1012,
		personSlug: 'nicklas',
		title: 'Product Owner',
		version: '1.0',
		updatedAt: '2023-09-01',
		isMain: false,
		overrides: {
			summary: {
				sv: '<p>Produktägare med fokus på värde, prioritering och hypotesdriven utveckling.</p>',
				en: '<p>Product owner focused on value, prioritisation, and hypothesis-driven delivery.</p>'
			}
		}
	}),
	createResume({
		id: 1013,
		personSlug: 'oliver',
		title: 'Full Stack Dev',
		version: '2.0',
		updatedAt: '2024-04-10',
		isMain: true
	}),
	createResume({
		id: 1014,
		personSlug: 'anonymous-fullstack',
		title: 'Fullstack Developer',
		version: '1.0',
		updatedAt: '2024-02-02',
		isMain: true,
		overrides: {
			contacts: [{ name: 'Anonymous Consultant', email: 'anonymous@pixelcode.se' }],
			summary: {
				sv: '<p>Erfaren konsult som gärna hoppar in i pågående projekt och löser tuffa problem.</p>',
				en: '<p>Seasoned consultant who joins projects mid-flight and resolves hard problems.</p>'
			}
		}
	})
];

export const ResumeService = {
	getPeople(): Person[] {
		return PEOPLE;
	},

	getPerson(id: number | string): Person | undefined {
		const numericId = normalizeId(id);
		if (Number.isNaN(numericId)) return undefined;
		return PEOPLE.find((p) => p.id === numericId);
	},

	getResumesForPerson(personId: number | string): Resume[] {
		const numericId = normalizeId(personId);
		if (Number.isNaN(numericId)) return [];
		return RESUMES.filter((r) => r.personId === numericId);
	},

	getResume(id: number | string): Resume | undefined {
		const numericId = normalizeId(id);
		if (Number.isNaN(numericId)) return undefined;
		return RESUMES.find((r) => r.id === numericId);
	},

	getMainResume(personId: number | string): Resume | undefined {
		const numericId = normalizeId(personId);
		if (Number.isNaN(numericId)) return undefined;
		return RESUMES.find((r) => r.personId === numericId && r.isMain);
	},

	getAllResumes(): Resume[] {
		return RESUMES;
	}
};
