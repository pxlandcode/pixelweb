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
	typeof value === 'string' ? value : (value[language] ?? '');

const localizedTitle = (title: string): LocalizedText => ({
	en: title,
	sv: ROLE_TRANSLATIONS[title] ?? title
});

const assignBlockIds = (blocks: ResumeBlock[]) =>
	blocks.map((block) => ({
		...block,
		id: block.id ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
	}));

const buildAnonymousFullstackBlocks = (
	person: Person,
	resumeTitle: LocalizedText
): ResumeBlock[] => {
	return [
		{
			type: 'header',
			name: '',
			title: resumeTitle,
			summary: {
				en: `<p>Seasoned fullstack developer with over 20 years of professional experience delivering robust software solutions across diverse industries including medtech, gaming, fintech, and enterprise systems.</p>
<p>Core expertise spans modern web development with React, Vue.js, and Node.js, alongside deep backend experience in Python (Flask, Django) and cloud infrastructure (AWS, GCP, Kubernetes). Strong foundation in test-driven development, CI/CD pipelines, and building scalable distributed systems.</p>`,
				sv: `<p>Erfaren fullstack-utvecklare med över 20 års professionell erfarenhet av att leverera robusta mjukvarulösningar inom olika branscher som medtech, spel, fintech och företagssystem.</p>
<p>Kärnkompetens omfattar modern webbutveckling med React, Vue.js och Node.js, tillsammans med djup backend-erfarenhet i Python (Flask, Django) och molninfrastruktur (AWS, GCP, Kubernetes). Stark grund i testdriven utveckling, CI/CD-pipelines och byggande av skalbara distribuerade system.</p>`
			},
			contact_people: [],
			hidden: false
		},
		{
			type: 'skills_grid',
			title: { sv: 'Exempel på färdigheter', en: 'Examples of skills' },
			columns: 2,
			skills: [
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
			hidden: false
		},
		{
			type: 'highlighted_experience',
			company: 'Medtech Startup (Neurodiagnostics)',
			role: localizedTitle('Senior Fullstack Developer'),
			description: {
				en: '<p>Dockerized and migrated the system to cloud environments using Kubernetes. Designed an internationalization framework enabling expansion to new markets. Implemented extensive automated tests improving velocity and reducing support issues.</p>',
				sv: '<p>Dockeriserade och migrerade systemet till molnmiljöer med Kubernetes. Designade ett internationaliseringsramverk som möjliggjorde expansion till nya marknader. Implementerade omfattande automatiserade tester vilket förbättrade hastigheten och minskade supportärenden.</p>'
			},
			technologies: [
				'TypeScript',
				'React',
				'Docker',
				'Kubernetes',
				'Node.js',
				'Python',
				'Cypress',
				'Jest'
			],
			hidden: false
		},
		{
			type: 'highlighted_experience',
			company: 'Website Hosting & Marketing Automation Company',
			role: localizedTitle('Senior Fullstack Developer'),
			description: {
				en: '<p>Designed and implemented core services for hosting and marketing automation. Built domain registration, instance allocation, and automated site creation. Created email/SMS marketing systems with analytics.</p>',
				sv: '<p>Designade och implementerade kärntjänster för hosting och marknadsföringsautomation. Byggde domänregistrering, instansallokering och automatiserad sajtskapande. Skapade e-post/SMS-marknadsföringssystem med analys.</p>'
			},
			technologies: ['Python', 'Flask', 'JavaScript', 'Vue', 'Docker', 'Postgres', 'AWS'],
			hidden: false
		},
		{
			type: 'experience_section',
			title: { sv: 'Tidigare Erfarenhet', en: 'Previous Experience' },
			hidden: false
		},
		{
			type: 'experience_item',
			startDate: '2020-01',
			endDate: null,
			company: 'Medtech Startup (Neurodiagnostics)',
			location: null,
			role: localizedTitle('Senior Fullstack Developer'),
			description: {
				en: `<ul>
    <li>Dockerized and migrated the system to cloud environments (GCP, Safespring) using Kubernetes.</li>
    <li>Designed an internationalization framework enabling expansion to new markets.</li>
    <li>Implemented extensive automated tests (Cypress, Jest, Skivvy) improving velocity and reducing support issues.</li>
    <li>Designed and implemented an event-sourcing framework for improved patient safety and runtime observability.</li>
</ul>`,
				sv: `<ul>
    <li>Dockeriserade och migrerade systemet till molnmiljöer (GCP, Safespring) med Kubernetes.</li>
    <li>Designade ett internationaliseringsramverk som möjliggjorde expansion till nya marknader.</li>
    <li>Implementerade omfattande automatiserade tester (Cypress, Jest, Skivvy) vilket förbättrade hastigheten och minskade supportärenden.</li>
    <li>Designade och implementerade ett event-sourcing-ramverk för förbättrad patientsäkerhet och observerbarhet.</li>
</ul>`
			},
			technologies: [
				'TypeScript',
				'JavaScript',
				'React',
				'Docker',
				'Kubernetes',
				'Postgres',
				'Node.js',
				'Python',
				'Cypress',
				'Jest',
				'GitHub Actions',
				'GCP'
			],
			hidden: false
		},
		{
			type: 'experience_item',
			startDate: '2019-01',
			endDate: '2020-12',
			company: 'Medtech Company (Diagnostics & Clinical Tools)',
			location: null,
			role: localizedTitle('Senior Fullstack Developer'),
			description: {
				en: `<ul>
    <li>Implemented a build-system for compiling proprietary DSLs used for patient diagnostics.</li>
    <li>Built real-time notification systems for clinical personnel.</li>
</ul>`,
				sv: `<ul>
    <li>Implementerade ett byggsystem för kompilering av proprietära DSL:er som används för patientdiagnostik.</li>
    <li>Byggde realtidsnotifikationssystem för klinisk personal.</li>
</ul>`
			},
			technologies: ['Python', 'Django', 'JavaScript', 'Docker', 'MySQL', 'SQLite'],
			hidden: false
		},
		{
			type: 'experience_item',
			startDate: '2018-01',
			endDate: '2019-12',
			company: 'Website Hosting & Marketing Automation Company',
			location: null,
			role: localizedTitle('Senior Fullstack Developer'),
			description: {
				en: `<ul>
    <li>Designed and implemented core services included in several product offerings.</li>
    <li>Built hosting services including domain registration, instance allocation, and automated site creation.</li>
    <li>Created marketing automation systems (email/SMS) with analytics and engagement tracking.</li>
    <li>Developed a custom email-editor for styling marketing emails.</li>
    <li>Implemented automated monitoring systems for maintaining high uptime.</li>
</ul>`,
				sv: `<ul>
    <li>Designade och implementerade kärntjänster inkluderade i flera produkterbjudanden.</li>
    <li>Byggde hosting-tjänster inklusive domänregistrering, instansallokering och automatiserad sajtskapande.</li>
    <li>Skapade system för marknadsföringsautomation (e-post/SMS) med analys och engagemangsspårning.</li>
    <li>Utvecklade en anpassad e-posteditor för styling av marknadsföringsmejl.</li>
    <li>Implementerade automatiserade övervakningssystem för att upprätthålla hög drifttid.</li>
</ul>`
			},
			technologies: ['Python', 'Flask', 'JavaScript', 'Vue', 'Docker', 'Postgres', 'AWS'],
			hidden: false
		},
		{
			type: 'experience_item',
			startDate: '2016-01',
			endDate: '2018-12',
			company: 'Office Space Marketplace Platform',
			location: null,
			role: localizedTitle('Backend Developer'),
			description: {
				en: `<ul>
    <li>Fully refactored a legacy backend over six months for better maintainability.</li>
    <li>Built new backend services and APIs for the frontend.</li>
    <li>Developed integration-testing tools for backend APIs, reducing errors and enabling daily deployments.</li>
</ul>`,
				sv: `<ul>
    <li>Omstrukturerade helt en legacy-backend över sex månader för bättre underhållbarhet.</li>
    <li>Byggde nya backend-tjänster och API:er för frontend.</li>
    <li>Utvecklade integrationstestverktyg för backend-API:er, vilket minskade fel och möjliggjorde dagliga deploys.</li>
</ul>`
			},
			technologies: ['Python', 'Flask', 'JavaScript', 'React', 'Docker', 'Postgres', 'GCP'],
			hidden: false
		},
		{
			type: 'experience_item',
			startDate: '2013-01',
			endDate: '2015-12',
			company: 'Web Consultancy Firm',
			location: null,
			role: localizedTitle('Fullstack Developer'),
			description: {
				en: `<p>Responsible for multiple large web projects, including:</p>
<ul>
    <li>Polling analysis platform used during the 2015 Swedish election, processing over 1 million submitted polls.</li>
    <li>Lightweight CMS for buying and selling apartments.</li>
</ul>`,
				sv: `<p>Ansvarig för flera stora webbprojekt, inklusive:</p>
<ul>
    <li>Opinionsanalysplattform som användes under valet 2015, med bearbetning av över 1 miljon inskickade enkäter.</li>
    <li>Lättvikts-CMS för köp och försäljning av bostäder.</li>
</ul>`
			},
			technologies: ['Python', 'Flask', 'JavaScript', 'Vue', 'Postgres', 'AWS'],
			hidden: false
		},
		{
			type: 'experience_item',
			startDate: '2012-01',
			endDate: '2013-12',
			company: 'Game & Gambling Company',
			location: null,
			role: { sv: 'Konsult', en: 'Consultant' },
			description: {
				en: `<ul>
    <li>Implemented the web version of an online Mahjong game client.</li>
    <li>Performed maintenance and bug fixes on game servers and payment systems.</li>
</ul>`,
				sv: `<ul>
    <li>Implementerade webbversionen av en online Mahjong-spelklient.</li>
    <li>Utförde underhåll och buggfixar på spelservrar och betalningssystem.</li>
</ul>`
			},
			technologies: [],
			hidden: false
		},
		{
			type: 'experience_item',
			startDate: '2010-01',
			endDate: '2011-12',
			company: 'CMS Platform Provider',
			location: null,
			role: { sv: 'Utvecklare', en: 'Developer' },
			description: {
				en: `<ul>
    <li>Implemented backend features for improved user-content moderation.</li>
    <li>Automated builds and deployments for more efficient delivery.</li>
</ul>`,
				sv: `<ul>
    <li>Implementerade backend-funktioner för förbättrad användarinnehållsmoderering.</li>
    <li>Automatiserade byggen och deployments för mer effektiv leverans.</li>
</ul>`
			},
			technologies: [],
			hidden: false
		},
		{
			type: 'experience_item',
			startDate: '2009-01',
			endDate: '2011-12',
			company: "Children's Game Studio",
			location: null,
			role: { sv: 'Spelutvecklare', en: 'Game Developer' },
			description: {
				en: `<ul>
    <li>Built the game server for an upcoming MMO game.</li>
    <li>Developed in-house tools for artists and designers.</li>
</ul>`,
				sv: `<ul>
    <li>Byggde spelservern för ett kommande MMO-spel.</li>
    <li>Utvecklade interna verktyg för artister och designers.</li>
</ul>`
			},
			technologies: [],
			hidden: false
		},
		{
			type: 'experience_item',
			startDate: '2004-01',
			endDate: '2009-12',
			company: 'Large Online Gambling Company',
			location: null,
			role: { sv: 'Spelutvecklare', en: 'Game Developer' },
			description: {
				en: `<ul>
    <li>Designed and implemented a new online poker client used by millions daily.</li>
    <li>Applied test-driven development achieving over 80 percent code coverage.</li>
    <li>Maintained and extended the legacy poker client.</li>
</ul>`,
				sv: `<ul>
    <li>Designade och implementerade en ny online-pokerklient som användes dagligen av miljoner.</li>
    <li>Tillämpade testdriven utveckling och uppnådde över 80 procents kodtäckning.</li>
    <li>Underhöll och utökade den äldre pokerklienten.</li>
</ul>`
			},
			technologies: [],
			hidden: false
		},
		{
			type: 'experience_item',
			startDate: '1999-01',
			endDate: '2004-12',
			company: 'Telecom Consultancy Firm',
			location: null,
			role: { sv: 'Konsult', en: 'Consultant' },
			description: {
				en: `<p>Performed server development work for major telecom and enterprise clients.</p>
<p><em>Clients included: national pharmacy chain, telecom operator, and electronics/telecom companies</em></p>`,
				sv: `<p>Utförde serverutvecklingsarbete för stora telekom- och företagskunder.</p>
<p><em>Kunder inkluderade: nationell apotekskedja, telekomoperatör och elektronik-/telekomföretag</em></p>`
			},
			technologies: [],
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
				'Python',
				'JavaScript',
				'TypeScript',
				'Elixir',
				'Java',
				'C/C++',
				'x86 Assembly',
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
				'MongoDB',
				'MySQL',
				'Postgres',
				'SQLite',
				'Cypress',
				'Jest',
				'GitHub Actions'
			],
			hidden: false
		},
		{
			type: 'skills_categorized',
			category: { sv: 'Metoder', en: 'Methods' },
			items: ['Agile', 'TDD', 'CI/CD', 'Test Automation'],
			hidden: false
		},
		{
			type: 'section_header',
			title: { sv: 'Övrigt', en: 'Other' },
			hidden: false
		},
		{
			type: 'skills_categorized',
			category: { sv: 'Utbildning', en: 'Education' },
			items: [
				{
					label: { sv: '2014 - 2016', en: '2014 - 2016' },
					value: {
						sv: 'Master of Fine Arts – Konstfack',
						en: 'Master of Fine Arts – University of Arts, Crafts and Design'
					}
				},
				{
					label: { sv: '2011 - 2013', en: '2011 - 2013' },
					value: {
						sv: 'Bachelor of Fine Arts – Konstfack',
						en: 'Bachelor of Fine Arts – University of Arts, Crafts and Design'
					}
				}
			],
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
		bio: 'Pierre leads the technical vision and mentors the team to achieve excellence. He focuses on delivering high-quality software that meets business needs.',
		techStack: [
			{
				id: 'frontend',
				name: 'Frontend',
				skills: ['Svelte', 'React', 'Tailwind', 'TypeScript']
			},
			{
				id: 'backend',
				name: 'Backend',
				skills: ['Node.js', 'PostgreSQL', 'Supabase']
			},
			{
				id: 'tools',
				name: 'Tools',
				skills: ['Git', 'Docker', 'Figma']
			}
		]
	},
	{
		id: 'anonymous-fullstack',
		name: '',
		title: 'Fullstack Developer',
		bio: 'Fullstack developer with 20 years of professional experience across a wide range of software projects. Expertise includes web development, cloud computing, gaming, animation, audio, agile practices, and test automation.'
	}
];

const buildLocalizedBlocks = (person: Person, resumeTitle: LocalizedText): ResumeBlock[] => {
	const roleTitle = resumeTitle;
	const leadRole = localizedTitle('Senior Developer');
	const leadEngineerRole = localizedTitle('Lead Engineer');
	const fullstackRole = localizedTitle('Full Stack Developer');

	// Special handling for anonymous profile
	if (person.id === 'anonymous-fullstack') {
		return buildAnonymousFullstackBlocks(person, resumeTitle);
	}

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
				{
					label: { sv: 'Svenska', en: 'Swedish' },
					value: { sv: 'Modersmål', en: 'Native speaker' }
				}
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
	{
		id: 'andreas-cv-1',
		personId: 'andreas',
		title: 'Fullstack Developer',
		version: '1.0',
		isMain: true
	},
	{
		id: 'andreas-cv-2',
		personId: 'andreas',
		title: 'Backend Specialist',
		version: '1.0',
		isMain: false
	},
	{ id: 'emilia-cv-1', personId: 'emilia', title: 'UX/UI Designer', version: '2.1', isMain: true },
	{
		id: 'linus-cv-1',
		personId: 'linus',
		title: 'Frontend Developer',
		version: '1.5',
		isMain: true
	},
	{ id: 'linus-cv-2', personId: 'linus', title: 'React Developer', version: '1.0', isMain: false },
	{
		id: 'martin-cv-1',
		personId: 'martin',
		title: 'Backend Engineer',
		version: '3.0',
		isMain: true
	},
	{
		id: 'nicklas-cv-1',
		personId: 'nicklas',
		title: 'Project Manager',
		version: '1.2',
		isMain: true
	},
	{ id: 'nicklas-cv-2', personId: 'nicklas', title: 'Scrum Master', version: '1.0', isMain: false },
	{
		id: 'nicklas-cv-3',
		personId: 'nicklas',
		title: 'Product Owner',
		version: '1.0',
		isMain: false
	},
	{ id: 'oliver-cv-1', personId: 'oliver', title: 'Full Stack Dev', version: '2.0', isMain: true },
	{ id: 'pierre-cv-1', personId: 'pierre', title: 'Tech Lead', version: '4.5', isMain: true },
	{
		id: 'pierre-cv-2',
		personId: 'pierre',
		title: 'Software Architect',
		version: '1.0',
		isMain: false
	},
	{
		id: 'anonymous-fullstack-cv-1',
		personId: 'anonymous-fullstack',
		title: 'Fullstack Developer',
		version: '1.0',
		isMain: true
	}
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
