import type { Person, InternalResume } from '$lib/types/internal-resumes';
import { peopleImages } from '$lib/images/definitions';

export const people: Person[] = [
	{
		id: 'andreas',
		name: 'Andreas',
		title: 'Senior Developer',
		portraitId: 'andreasPortrait',
		bio: 'Andreas is a seasoned developer with a passion for clean code and scalable architecture.'
	},
	{
		id: 'emilia',
		name: 'Emilia',
		title: 'UX Designer',
		portraitId: 'emiliaPortrait',
		bio: 'Emilia creates intuitive and beautiful user experiences that delight customers.'
	},
	{
		id: 'linus',
		name: 'Linus',
		title: 'Frontend Developer',
		portraitId: 'linusPortrait',
		bio: 'Linus loves building interactive and responsive web applications with the latest tech.'
	},
	{
		id: 'martin',
		name: 'Martin',
		title: 'Backend Developer',
		portraitId: 'martinPortrait',
		bio: 'Martin ensures our systems are robust, secure, and performant under load.'
	},
	{
		id: 'nicklas',
		name: 'Nicklas',
		title: 'Project Manager',
		portraitId: 'nicklasPortrait',
		bio: 'Nicklas keeps projects on track and ensures clear communication between teams.'
	},
	{
		id: 'oliver',
		name: 'Oliver',
		title: 'Full Stack Developer',
		portraitId: 'oliverPortrait',
		bio: 'Oliver is a versatile developer who can handle everything from database to frontend.'
	},
	{
		id: 'pierre',
		name: 'Pierre',
		title: 'Tech Lead',
		portraitId: 'pierrePortrait',
		bio: 'Pierre leads the technical vision and mentors the team to achieve excellence.'
	}
];

const createMockResume = (
	id: string,
	personId: string,
	title: string,
	version: string,
	isMain: boolean
): InternalResume => ({
	id,
	personId,
	title,
	version,
	updatedAt: new Date().toISOString().split('T')[0],
	isMain,
	content: [
		{
			type: 'header',
			id: 'header-1',
			name: people.find((p) => p.id === personId)?.name || 'Unknown',
			title: people.find((p) => p.id === personId)?.title || 'Developer',
			email: `${personId}@pixelcode.se`,
			phone: '+46 70 123 45 67',
			github: `github.com/${personId}`,
			linkedin: `linkedin.com/in/${personId}`,
			website: `pixelcode.se`,
			hidden: false
		},
		{
			type: 'section_header',
			id: 'summary-header',
			title: 'Summary',
			hidden: false
		},
		{
			type: 'multi_column_info',
			id: 'summary-content',
			columns: [
				{
					title: 'About',
					content: [
						'Experienced professional with a strong background in web development.',
						'Passionate about creating high-quality software solutions.'
					]
				}
			],
			hidden: false
		},
		{
			type: 'section_header',
			id: 'skills-header',
			title: 'Skills',
			hidden: false
		},
		{
			type: 'skills_grid',
			id: 'skills-content',
			skills: ['TypeScript', 'Svelte', 'Tailwind CSS', 'Node.js', 'PostgreSQL'],
			hidden: false
		}
	]
});

export const resumes: InternalResume[] = [
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
