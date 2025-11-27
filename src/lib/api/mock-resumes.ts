import type { Person, InternalResume } from '$lib/types/internal-resumes';
import type { LocalizedText } from '$lib/services/resumes';

export const MOCK_PEOPLE: Person[] = [
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

const toLocalizedStrings = (value: LocalizedText): { sv: string; en: string } =>
	typeof value === 'string' ? { sv: value, en: value } : value;

const localizeRole = (roleEn: string) => ({
	en: roleEn,
	sv: ROLE_TRANSLATIONS[roleEn] ?? roleEn
});

const generateHtmlSummary = (name: string) => ({
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

const generateHtmlDescription = (role: LocalizedText, company: string) => {
	const roleText = toLocalizedStrings(role);

	return {
		en: `
<p>As a <strong>${roleText.en}</strong> at <strong>${company}</strong>, I was responsible for:</p>
<ul>
    <li>Leading a team of 5 developers to build a new customer-facing portal.</li>
    <li>Architecting a scalable microservices backend using Node.js and Kubernetes.</li>
    <li>Improving site performance by 40% through code optimization and caching strategies.</li>
    <li>Collaborating with product owners to define requirements and roadmap.</li>
</ul>
<p><em>Key achievement:</em> Successfully launched the platform ahead of schedule and under budget.</p>
`,
		sv: `
<p>Som <strong>${roleText.sv}</strong> på <strong>${company}</strong> ansvarade jag för:</p>
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

const createMockResume = (
	id: string,
	personId: string,
	title: string,
	version: string,
	isMain: boolean
): InternalResume => {
	const person = MOCK_PEOPLE.find((p) => p.id === personId);
	const name = person?.name || 'Unknown';
	const roleTitle = person?.title || 'Developer';
	const localizedRoleTitle = localizeRole(roleTitle);
	const highlightedRole = localizeRole('Senior Developer');
	const highlightedRoleSecondary = localizeRole('Lead Engineer');

	return {
		id,
		personId,
		title,
		version,
		updatedAt: new Date().toISOString().split('T')[0],
		isMain,
		content: [
			{
				type: 'header',
				id: crypto.randomUUID(),
				name: name,
				title: localizedRoleTitle,
				summary: generateHtmlSummary(name),
				contact_people: [
					{
						label: { sv: 'Kontakt', en: 'Contact' },
						people: [
							{ name: name, email: `${personId}@pixelcode.se`, phone: '+46 70 123 45 67' },
							{ name: 'Manager Name', email: 'manager@pixelcode.se' }
						]
					}
				],
				hidden: false
			},
			{
				type: 'highlighted_experience',
				id: crypto.randomUUID(),
				company: 'Tech Giant Corp',
				role: highlightedRole,
				description: generateHtmlDescription(highlightedRole, 'Tech Giant Corp'),
				technologies: ['React', 'Node.js', 'AWS'],
				testimonial: {
					sv: 'En ren fröjd att samarbeta med. Levererar resultat i toppklass.',
					en: 'An absolute pleasure to work with. Delivered exceptional results.'
				},
				hidden: false
			},
			{
				type: 'highlighted_experience',
				id: crypto.randomUUID(),
				company: 'Innovative Startup',
				role: highlightedRoleSecondary,
				description: generateHtmlDescription(highlightedRoleSecondary, 'Innovative Startup'),
				technologies: ['Svelte', 'Supabase', 'Vercel'],
				hidden: false
			},
			{
				type: 'skills_grid',
				id: crypto.randomUUID(),
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
				id: crypto.randomUUID(),
				title: { sv: 'Tidigare erfarenhet', en: 'Previous Experience' },
				hidden: false
			},
			{
				type: 'experience_item',
				id: crypto.randomUUID(),
				startDate: '2020-01',
				endDate: null,
				company: 'Pixel&Code',
				location: { sv: 'Stockholm', en: 'Stockholm' },
				role: localizedRoleTitle,
				description: generateHtmlDescription(localizedRoleTitle, 'Pixel&Code'),
				technologies: ['SvelteKit', 'Tailwind', 'Supabase'],
				hidden: false
			},
			{
				type: 'experience_item',
				id: crypto.randomUUID(),
				startDate: '2018-01',
				endDate: '2019-12',
				company: 'Previous Agency',
				location: { sv: 'Göteborg', en: 'Gothenburg' },
				role: localizeRole('Full Stack Developer'),
				description: generateHtmlDescription(localizeRole('Full Stack Developer'), 'Previous Agency'),
				technologies: ['Vue.js', 'Laravel', 'MySQL'],
				hidden: false
			},
			{
				type: 'section_header',
				id: crypto.randomUUID(),
				title: { sv: 'Färdigheter', en: 'Skills' },
				hidden: false
			},
			{
				type: 'skills_categorized',
				id: crypto.randomUUID(),
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
				id: crypto.randomUUID(),
				category: { sv: 'Metoder', en: 'Methods' },
				items: ['Scrum', 'Agile', 'Kanban', 'Responsive design', 'TDD', 'CI/CD'],
				hidden: false
			},
			{
				type: 'section_header',
				id: crypto.randomUUID(),
				title: { sv: 'Övrigt', en: 'Other' },
				hidden: false
			},
			{
				type: 'skills_categorized',
				id: crypto.randomUUID(),
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
				type: 'multi_column_info',
				id: crypto.randomUUID(),
				items: [
					{
						label: { sv: '2015 - 2018', en: '2015 - 2018' },
						description: {
							sv: '<strong>Kandidatexamen i datavetenskap</strong><br>Kungliga Tekniska högskolan (KTH)',
							en: '<strong>BSc in Computer Science</strong><br>Royal Institute of Technology (KTH)'
						}
					},
					{
						label: { sv: '2014', en: '2014' },
						description: {
							sv: '<strong>Certifierad Scrum Master</strong><br>Scrum Alliance',
							en: '<strong>Certified Scrum Master</strong><br>Scrum Alliance'
						}
					}
				],
				hidden: false
			},
			{
				type: 'skills_categorized',
				id: crypto.randomUUID(),
				category: { sv: 'Portfölj', en: 'Portfolio' },
				items: ['https://pixelcode.se', 'https://github.com/pixelcode'],
				hidden: false
			},
			{
				type: 'footer',
				id: crypto.randomUUID(),
				note: {
					sv: 'Referenser lämnas på begäran.',
					en: 'References available upon request.'
				},
				updated_at: new Date().toISOString().split('T')[0],
				hidden: false
			}
		]
	};
};

const MOCK_RESUMES: InternalResume[] = [
	// Andreas
	createMockResume('andreas-cv-1', 'andreas', 'Fullstack Developer', '1.0', true),
	createMockResume('andreas-cv-2', 'andreas', 'Backend Specialist', '1.0', false),
	// Emilia
	createMockResume('emilia-cv-1', 'emilia', 'UX/UI Designer', '2.1', true),
	// Linus
	createMockResume('linus-cv-1', 'linus', 'Frontend Developer', '1.5', true),
	createMockResume('linus-cv-2', 'linus', 'React Developer', '1.0', false),
	// Martin
	createMockResume('martin-cv-1', 'martin', 'Backend Engineer', '3.0', true),
	// Nicklas
	createMockResume('nicklas-cv-1', 'nicklas', 'Project Manager', '1.2', true),
	createMockResume('nicklas-cv-2', 'nicklas', 'Scrum Master', '1.0', false),
	createMockResume('nicklas-cv-3', 'nicklas', 'Product Owner', '1.0', false),
	// Oliver
	createMockResume('oliver-cv-1', 'oliver', 'Full Stack Dev', '2.0', true),
	// Pierre
	createMockResume('pierre-cv-1', 'pierre', 'Tech Lead', '4.5', true),
	createMockResume('pierre-cv-2', 'pierre', 'Software Architect', '1.0', false)
];

export class MockResumeService {
	static getPeople(): Person[] {
		return MOCK_PEOPLE;
	}

	static getPerson(id: string): Person | undefined {
		return MOCK_PEOPLE.find((p) => p.id === id);
	}

	static getResumesForPerson(personId: string): InternalResume[] {
		return MOCK_RESUMES.filter((r) => r.personId === personId);
	}

	static getResume(id: string): InternalResume | undefined {
		return MOCK_RESUMES.find((r) => r.id === id);
	}
    
    static getMainResume(personId: string): InternalResume | undefined {
        return MOCK_RESUMES.find((r) => r.personId === personId && r.isMain);
    }
}
