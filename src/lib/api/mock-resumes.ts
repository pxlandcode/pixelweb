import type { Person, InternalResume } from '$lib/types/internal-resumes';
import type { LocalizedText, ResumeBlock } from '$lib/services/resumes';

type Language = 'sv' | 'en';

const ROLE_TRANSLATIONS: Record<string, string> = {
	'Senior Developer': 'Seniorutvecklare',
	'UX Designer': 'UX-designer',
	'Frontend Developer': 'Frontendutvecklare',
	'Backend Developer': 'Backendutvecklare',
	'Project Manager': 'Projektledare',
	'Full Stack Developer': 'Fullstackutvecklare',
	'Full Stack Dev': 'Fullstackutvecklare',
	'Tech Lead': 'Teknisk ledare',
	'Lead Engineer': 'Teknisk ledare'
};

const textFor = (value: LocalizedText, language: Language): string =>
	typeof value === 'string' ? value : value[language] ?? '';

const localizedTitle = (title: string): LocalizedText => ({
	en: title,
	sv: ROLE_TRANSLATIONS[title] ?? title
});

const assignBlockIds = (blocks: ResumeBlock[]) =>
	blocks.map((block) => ({
		...block,
		id: block.id ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
	}));

const generateHtmlSummary = (name: string): LocalizedText => ({
	en: `
<p><strong>${name}</strong> is a highly skilled professional with over 10 years of experience in the tech industry. They have a proven track record of delivering successful projects for major clients.</p>
<p>Key strengths include:</p>
<ul>
    <li>Strategic planning and execution</li>
    <li>Team leadership and mentoring</li>
    <li>Technical architecture and design</li>
</ul>
<p>They are passionate about staying up-to-date with the latest technologies and best practices.</p>
`,
	sv: `
<p><strong>${name}</strong> är en erfaren konsult med över 10 års erfarenhet från techbranschen. Hen har en dokumenterad förmåga att leverera lyckade projekt för stora kunder.</p>
<p>Styrkor:</p>
<ul>
    <li>Strategisk planering och genomförande</li>
    <li>Teamledning och mentorskap</li>
    <li>Teknisk arkitektur och design</li>
</ul>
<p>${name} håller sig gärna uppdaterad kring nya tekniker och bästa praxis.</p>
`
});

const generateHtmlDescription = (role: LocalizedText, company: string): LocalizedText => {
	const roleText = (language: Language) => textFor(role, language);
	return {
		en: `
<p>As a <strong>${roleText('en')}</strong> at <strong>${company}</strong>, I was responsible for:</p>
<ul>
    <li>Leading a team of 5 developers to build a new customer-facing portal.</li>
    <li>Architecting a scalable microservices backend using Node.js and Kubernetes.</li>
    <li>Improving site performance by 40% through code optimization and caching strategies.</li>
    <li>Collaborating with product owners to define requirements and roadmap.</li>
</ul>
<p><em>Key achievement:</em> Successfully launched the platform ahead of schedule and under budget.</p>
`,
		sv: `
<p>Som <strong>${roleText('sv')}</strong> på <strong>${company}</strong> ansvarade jag för:</p>
<ul>
    <li>Att leda ett team om fem utvecklare som byggde en ny kundportal.</li>
    <li>Att designa en skalbar mikrotjänstarkitektur med Node.js och Kubernetes.</li>
    <li>Att förbättra prestandan med 40% genom kodoptimering och caching.</li>
    <li>Att samarbeta med produktägare kring krav och roadmap.</li>
</ul>
<p><em>Största resultat:</em> Lanserade plattformen före tidplan och under budget.</p>
`
	};
};

const MOCK_PEOPLE: Person[] = [
	{
		id: 'andreas',
		name: 'Andreas',
		title: 'Senior Developer',
		portraitId: 'andreasPortrait',
		bio: 'Andreas is a seasoned developer with a passion for clean code and scalable architecture. He loves solving complex problems and mentoring junior developers.'
	},
	{
		id: 'emilia',
		name: 'Emilia',
		title: 'UX Designer',
		portraitId: 'emiliaPortrait',
		bio: 'Emilia creates intuitive and beautiful user experiences that delight customers. She bridges the gap between design and technology.'
	},
	{
		id: 'linus',
		name: 'Linus',
		title: 'Frontend Developer',
		portraitId: 'linusPortrait',
		bio: 'Linus loves building interactive and responsive web applications with the latest tech. He is an expert in Svelte and Tailwind.'
	},
	{
		id: 'martin',
		name: 'Martin',
		title: 'Backend Developer',
		portraitId: 'martinPortrait',
		bio: 'Martin ensures our systems are robust, secure, and performant under load. He specializes in distributed systems and database optimization.'
	},
	{
		id: 'nicklas',
		name: 'Nicklas',
		title: 'Project Manager',
		portraitId: 'nicklasPortrait',
		bio: 'Nicklas keeps projects on track and ensures clear communication between teams. He is certified in Scrum and Agile methodologies.'
	},
	{
		id: 'oliver',
		name: 'Oliver',
		title: 'Full Stack Developer',
		portraitId: 'oliverPortrait',
		bio: 'Oliver is a versatile developer who can handle everything from database to frontend. He enjoys working on the full product lifecycle.'
	},
	{
		id: 'pierre',
		name: 'Pierre',
		title: 'Tech Lead',
		portraitId: 'pierrePortrait',
		bio: 'Pierre leads the technical vision and mentors the team to achieve excellence. He focuses on delivering high-quality software that meets business needs.'
	}
];

const buildLocalizedBlocks = (person: Person, resumeTitle: LocalizedText): ResumeBlock[] => {
	const roleTitle = resumeTitle;
	const leadRole = localizedTitle('Senior Developer');
	const leadEngineerRole = localizedTitle('Lead Engineer');
	const fullstackRole = localizedTitle('Full Stack Developer');

	return [
		{
			type: 'header',
			name: person.name,
			title: roleTitle,
			summary: generateHtmlSummary(person.name),
			contact_people: [
				{
					label: { sv: 'Kontakt', en: 'Contact' },
					people: [
						{ name: person.name, email: `${person.id}@pixelcode.se`, phone: '+46 70 123 45 67' },
						{ name: 'Manager Name', email: 'manager@pixelcode.se' }
					]
				}
			],
			hidden: false
		},
		{
			type: 'highlighted_experience',
			company: 'Tech Giant Corp',
			role: leadRole,
			description: generateHtmlDescription(leadRole, 'Tech Giant Corp'),
			technologies: ['React', 'Node.js', 'AWS'],
			testimonial: {
				sv: 'En ren fröjd att samarbeta med. Levererar resultat i toppklass.',
				en: 'An absolute pleasure to work with. Delivered exceptional results.'
			},
			hidden: false
		},
		{
			type: 'highlighted_experience',
			company: 'Innovative Startup',
			role: leadEngineerRole,
			description: generateHtmlDescription(leadEngineerRole, 'Innovative Startup'),
			technologies: ['Svelte', 'Supabase', 'Vercel'],
			hidden: false
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
			],
			hidden: false
		},
		{
			type: 'experience_section',
			title: { sv: 'Tidigare erfarenhet', en: 'Previous Experience' },
			hidden: false
		},
		{
			type: 'experience_item',
			startDate: '2020-01',
			endDate: null,
			company: 'Pixel&Code',
			location: { sv: 'Stockholm', en: 'Stockholm' },
			role: roleTitle,
			description: generateHtmlDescription(roleTitle, 'Pixel&Code'),
			technologies: ['SvelteKit', 'Tailwind', 'Supabase'],
			hidden: false
		},
		{
			type: 'experience_item',
			startDate: '2018-01',
			endDate: '2019-12',
			company: 'Previous Agency',
			location: { sv: 'Göteborg', en: 'Gothenburg' },
			role: fullstackRole,
			description: generateHtmlDescription(fullstackRole, 'Previous Agency'),
			technologies: ['Vue.js', 'Laravel', 'MySQL'],
			hidden: false
		},
		{
			type: 'section_header',
			title: { sv: 'Färdigheter', en: 'Skills' },
			hidden: false
		},
		{
			type: 'skills_categorized',
			category: { sv: 'Tekniker', en: 'Techniques' },
			items: [
				'TypeScript',
				'Svelte',
				'React',
				'Node.js',
				'PostgreSQL',
				'AWS',
				'Docker',
				'Kubernetes',
				'Tailwind',
				'Supabase',
				'GraphQL',
				'Next.js'
			],
			hidden: false
		},
		{
			type: 'skills_categorized',
			category: { sv: 'Metoder', en: 'Methods' },
			items: ['Scrum', 'Agile', 'Kanban', 'Responsive design', 'TDD', 'CI/CD'],
			hidden: false
		},
		{
			type: 'section_header',
			title: { sv: 'Övrigt', en: 'Other' },
			hidden: false
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
			],
			hidden: false
		},
		{
			type: 'skills_categorized',
			category: { sv: 'Utbildning', en: 'Education' },
			items: [
				{
					label: { sv: '2015 - 2018', en: '2015 - 2018' },
					value: {
						sv: '<strong>Kandidatexamen i datavetenskap</strong><br>Kungliga Tekniska högskolan (KTH)',
						en: '<strong>BSc in Computer Science</strong><br>Royal Institute of Technology (KTH)'
					}
				},
				{
					label: { sv: '2014', en: '2014' },
					value: {
						sv: '<strong>Certifierad Scrum Master</strong><br>Scrum Alliance',
						en: '<strong>Certified Scrum Master</strong><br>Scrum Alliance'
					}
				}
			],
			hidden: false
		},
		{
			type: 'skills_categorized',
			category: { sv: 'Portfölj', en: 'Portfolio' },
			items: ['https://pixelcode.se', 'https://github.com/pixelcode'],
			hidden: false
		},
		{
			type: 'footer',
			note: {
				sv: 'Referenser lämnas på begäran.',
				en: 'References available upon request.'
			},
			updated_at: new Date().toISOString().split('T')[0],
			hidden: false
		}
	];
};

const localizedToLanguage = (content: LocalizedText | undefined, language: Language) =>
	content ? textFor(content, language) : '';

const mapBlockToLanguage = (block: ResumeBlock, language: Language): ResumeBlock => {
	switch (block.type) {
		case 'header':
			return {
				...block,
				title: localizedToLanguage(block.title, language),
				summary: localizedToLanguage(block.summary, language),
				contact_people: block.contact_people.map((group) => ({
					...group,
					label: localizedToLanguage(group.label, language)
				}))
			};
		case 'highlighted_experience':
			return {
				...block,
				role: localizedToLanguage(block.role, language),
				description: localizedToLanguage(block.description, language),
				testimonial: block.testimonial ? localizedToLanguage(block.testimonial, language) : null
			};
		case 'skills_grid':
			return { ...block, title: localizedToLanguage(block.title, language) };
		case 'experience_section':
			return { ...block, title: localizedToLanguage(block.title, language) };
		case 'experience_item': {
			const role = Array.isArray(block.role)
				? block.role.map((r) => localizedToLanguage(r, language))
				: localizedToLanguage(block.role, language);
			return {
				...block,
				location: block.location ? localizedToLanguage(block.location, language) : null,
				role,
				description: localizedToLanguage(block.description, language)
			};
		}
		case 'section_header':
			return { ...block, title: localizedToLanguage(block.title, language) };
		case 'skills_categorized':
			return {
				...block,
				category: localizedToLanguage(block.category, language),
				items: block.items.map((item) =>
					typeof item === 'string'
						? item
						: {
								label: localizedToLanguage(item.label, language),
								value: item.value ? localizedToLanguage(item.value, language) : null
						  }
				)
			};
		case 'multi_column_info':
			return {
				...block,
				items: block.items.map((item) => ({
					...item,
					label: localizedToLanguage(item.label, language),
					description: localizedToLanguage(item.description, language)
				}))
			};
		case 'testimonial':
			return { ...block, quote: localizedToLanguage(block.quote, language) };
		case 'footer':
			return { ...block, note: localizedToLanguage(block.note, language) };
		default:
			return block;
	}
};

const toLanguageBlocks = (blocks: ResumeBlock[], language: Language) =>
	blocks.map((block) => mapBlockToLanguage(block, language));

type MockResumeVersion = {
	id: string;
	resumeId: string;
	language: Language;
	version: string;
	title: string;
	isMain: boolean;
	isActive: boolean;
	updatedAt: string;
	blocks: ResumeBlock[];
};

type MockResume = {
	id: string;
	personId: string;
	title: LocalizedText;
	version: string;
	isMain: boolean;
	localizedBlocks: ResumeBlock[];
	versions: MockResumeVersion[];
};

const RESUME_DEFINITIONS: Array<{
	id: string;
	personId: Person['id'];
	title: string;
	version: string;
	isMain: boolean;
}> = [
	{ id: 'andreas-cv-1', personId: 'andreas', title: 'Fullstack Developer', version: '1.0', isMain: true },
	{ id: 'andreas-cv-2', personId: 'andreas', title: 'Backend Specialist', version: '1.0', isMain: false },
	{ id: 'emilia-cv-1', personId: 'emilia', title: 'UX/UI Designer', version: '2.1', isMain: true },
	{ id: 'linus-cv-1', personId: 'linus', title: 'Frontend Developer', version: '1.5', isMain: true },
	{ id: 'linus-cv-2', personId: 'linus', title: 'React Developer', version: '1.0', isMain: false },
	{ id: 'martin-cv-1', personId: 'martin', title: 'Backend Engineer', version: '3.0', isMain: true },
	{ id: 'nicklas-cv-1', personId: 'nicklas', title: 'Project Manager', version: '1.2', isMain: true },
	{ id: 'nicklas-cv-2', personId: 'nicklas', title: 'Scrum Master', version: '1.0', isMain: false },
	{ id: 'nicklas-cv-3', personId: 'nicklas', title: 'Product Owner', version: '1.0', isMain: false },
	{ id: 'oliver-cv-1', personId: 'oliver', title: 'Full Stack Dev', version: '2.0', isMain: true },
	{ id: 'pierre-cv-1', personId: 'pierre', title: 'Tech Lead', version: '4.5', isMain: true },
	{ id: 'pierre-cv-2', personId: 'pierre', title: 'Software Architect', version: '1.0', isMain: false }
];

const createMockResume = (definition: (typeof RESUME_DEFINITIONS)[number]): MockResume => {
	const person = MOCK_PEOPLE.find((p) => p.id === definition.personId);
	if (!person) {
		throw new Error(`Person not found for id ${definition.personId}`);
	}

	const resumeTitle = localizedTitle(definition.title);
	const localizedBlocks = assignBlockIds(buildLocalizedBlocks(person, resumeTitle));
	const updatedAt = new Date().toISOString().split('T')[0];

	const versions: MockResumeVersion[] = (['sv', 'en'] as Language[]).map((language) => ({
		id: `${definition.id}-${language}`,
		resumeId: definition.id,
		language,
		version: definition.version,
		title: textFor(resumeTitle, language),
		isMain: language === 'sv' ? definition.isMain : false,
		isActive: true,
		updatedAt,
		blocks: toLanguageBlocks(localizedBlocks, language)
	}));

	return {
		id: definition.id,
		personId: definition.personId,
		title: resumeTitle,
		version: definition.version,
		isMain: definition.isMain,
		localizedBlocks,
		versions
	};
};

const MOCK_RESUMES: MockResume[] = RESUME_DEFINITIONS.map(createMockResume);

const toInternalResume = (resume: MockResume): InternalResume => ({
	id: resume.id,
	personId: resume.personId,
	title: textFor(resume.title, 'sv'),
	version: resume.version,
	updatedAt: resume.versions[0]?.updatedAt ?? new Date().toISOString().split('T')[0],
	isMain: resume.isMain,
	content: resume.localizedBlocks
});

export class MockResumeService {
	static getPeople(): Person[] {
		return MOCK_PEOPLE;
	}

	static getPerson(id: string): Person | undefined {
		return MOCK_PEOPLE.find((p) => p.id === id);
	}

	static getResumesForPerson(personId: string): InternalResume[] {
		return MOCK_RESUMES.filter((r) => r.personId === personId).map(toInternalResume);
	}

	static getResume(id: string): InternalResume | undefined {
		const resume = MOCK_RESUMES.find((r) => r.id === id);
		return resume ? toInternalResume(resume) : undefined;
	}

	static getMainResume(personId: string): InternalResume | undefined {
		const resume = MOCK_RESUMES.find((r) => r.personId === personId && r.isMain);
		return resume ? toInternalResume(resume) : undefined;
	}

	static getResumeByLanguage(id: string, language: Language): InternalResume | undefined {
		const resume = MOCK_RESUMES.find((r) => r.id === id);
		if (!resume) return undefined;

		const version = resume.versions.find((v) => v.language === language);
		return {
			...toInternalResume(resume),
			title: textFor(resume.title, language),
			content: version ? version.blocks : toLanguageBlocks(resume.localizedBlocks, language)
		};
	}
}

export type { Language as ResumeLanguage };
