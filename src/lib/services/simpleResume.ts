/**
 * Simplified Resume Service
 *
 * Uses fixed resume structure instead of generic blocks.
 */

import type { SimpleResume, LocalizedText } from '$lib/types/resume';

type Language = 'sv' | 'en';

// Helper to get text for a language
export const getText = (text: LocalizedText, lang: Language): string => {
	if (typeof text === 'string') return text;
	return text[lang] ?? text.sv ?? '';
};

// Person data (separate from resume)
export type Person = {
	id: string;
	name: string;
	title: string;
	portraitId?: string;
	bio: string;
};

const PEOPLE: Person[] = [
	{
		id: 'pierre',
		name: 'Pierre Elmén',
		title: 'Tech Lead',
		portraitId: 'pierrePortrait',
		bio: 'Pierre leads the technical vision and mentors the team to achieve excellence.'
	},
	{
		id: 'anonymous-fullstack',
		name: '',
		title: 'Fullstack Developer',
		bio: 'Fullstack developer with 20 years of professional experience.'
	}
];

// Resume data
const RESUMES: SimpleResume[] = [
	{
		id: 'pierre-cv-1',
		personId: 'pierre',
		title: 'Tech Lead',
		version: '1.0',
		updatedAt: '2024-01-15',
		isMain: true,
		data: {
			name: 'Pierre Elmén',
			title: {
				sv: 'Frontendutvecklare och ledare',
				en: 'Frontend developer and leader'
			},
			summary: {
				sv: 'Pierre är en nyfiken och driven fullstackutvecklare med gedigen erfarenhet av att utveckla och integrera produkter från koncept till lansering och vidareutveckling. Han trivs i agila team där han kan arbeta i högt tempo och i nära kontakt med både kunder och slutanvändare.',
				en: 'Pierre is a curious and driven full-stack developer with solid experience in developing and integrating products from concept to launch and further development. He thrives in agile teams where he can work at a high pace and in close contact with both clients and end-users.'
			},
			contacts: [
				{ name: 'Pierre Elmén', phone: '+46 (0)73 640 06 22', email: 'pierre@pixelcode.se' },
				{ name: 'Robin Östberg', email: 'robin@pixelcode.se' }
			],
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
					],
					testimonial: {
						sv: 'Vi känner oss stöttade i ert team, utvecklarna har utmärkta färdigheter.',
						en: 'We feel supported within your team, the developers have excellent skills.'
					}
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
			portfolio: ['https://elmen.dev'],
			footerNote: {
				sv: 'Världsklass teknik av världsklass människor',
				en: 'Worldclass tech by worldclass people'
			}
		}
	},
	{
		id: 'anonymous-fullstack-cv-1',
		personId: 'anonymous-fullstack',
		title: 'Fullstack Developer',
		version: '1.0',
		updatedAt: '2024-11-28',
		isMain: true,
		data: {
			name: '',
			title: {
				sv: 'Fullstack-utvecklare',
				en: 'Fullstack Developer'
			},
			summary: {
				sv: 'Erfaren fullstack-utvecklare med över 20 års professionell erfarenhet av att leverera robusta mjukvarulösningar inom olika branscher som medtech, spel, fintech och företagssystem.',
				en: 'Seasoned fullstack developer with over 20 years of professional experience delivering robust software solutions across diverse industries including medtech, gaming, fintech, and enterprise systems.'
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
					company: 'Medtech Startup (Neurodiagnostics)',
					role: { sv: 'Senior Fullstack-utvecklare', en: 'Senior Fullstack Developer' },
					description: {
						sv: 'Dockeriserade och migrerade systemet till molnmiljöer med Kubernetes. Designade ett internationaliseringsramverk.',
						en: 'Dockerized and migrated the system to cloud environments using Kubernetes. Designed an internationalization framework.'
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
					]
				},
				{
					company: 'Website Hosting & Marketing Automation',
					role: { sv: 'Senior Fullstack-utvecklare', en: 'Senior Fullstack Developer' },
					description: {
						sv: 'Designade och implementerade kärntjänster för hosting och marknadsföringsautomation.',
						en: 'Designed and implemented core services for hosting and marketing automation.'
					},
					technologies: ['Python', 'Flask', 'JavaScript', 'Vue', 'Docker', 'Postgres', 'AWS']
				}
			],
			experiences: [
				{
					startDate: '2020-01',
					endDate: null,
					company: 'Medtech Startup (Neurodiagnostics)',
					role: { sv: 'Senior Fullstack-utvecklare', en: 'Senior Fullstack Developer' },
					description: {
						sv: 'Dockeriserade och migrerade systemet till molnmiljöer (GCP, Safespring) med Kubernetes.',
						en: 'Dockerized and migrated the system to cloud environments (GCP, Safespring) using Kubernetes.'
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
					]
				},
				{
					startDate: '2019-01',
					endDate: '2020-12',
					company: 'Medtech Company (Diagnostics)',
					role: { sv: 'Senior Fullstack-utvecklare', en: 'Senior Fullstack Developer' },
					description: {
						sv: 'Implementerade ett byggsystem för kompilering av proprietära DSL:er.',
						en: 'Implemented a build-system for compiling proprietary DSLs used for patient diagnostics.'
					},
					technologies: ['Python', 'Django', 'JavaScript', 'Docker', 'MySQL', 'SQLite']
				},
				{
					startDate: '2018-01',
					endDate: '2019-12',
					company: 'Website Hosting & Marketing Automation',
					role: { sv: 'Senior Fullstack-utvecklare', en: 'Senior Fullstack Developer' },
					description: {
						sv: 'Designade och implementerade kärntjänster för hosting och marknadsföring.',
						en: 'Designed and implemented core services for hosting and marketing automation.'
					},
					technologies: ['Python', 'Flask', 'JavaScript', 'Vue', 'Docker', 'Postgres', 'AWS']
				},
				{
					startDate: '2016-01',
					endDate: '2018-12',
					company: 'Office Space Marketplace Platform',
					role: { sv: 'Backend-utvecklare', en: 'Backend Developer' },
					description: {
						sv: 'Omstrukturerade helt en legacy-backend för bättre underhållbarhet.',
						en: 'Fully refactored a legacy backend for better maintainability.'
					},
					technologies: ['Python', 'Flask', 'JavaScript', 'React', 'Docker', 'Postgres', 'GCP']
				},
				{
					startDate: '2013-01',
					endDate: '2015-12',
					company: 'Web Consultancy Firm',
					role: { sv: 'Fullstack-utvecklare', en: 'Fullstack Developer' },
					description: {
						sv: 'Ansvarig för flera stora webbprojekt, inklusive opinionsanalysplattform.',
						en: 'Responsible for multiple large web projects, including a polling analysis platform.'
					},
					technologies: ['Python', 'Flask', 'JavaScript', 'Vue', 'Postgres', 'AWS']
				},
				{
					startDate: '2012-01',
					endDate: '2013-12',
					company: 'Game & Gambling Company',
					role: { sv: 'Konsult', en: 'Consultant' },
					description: {
						sv: 'Implementerade webbversionen av en online Mahjong-spelklient.',
						en: 'Implemented the web version of an online Mahjong game client.'
					},
					technologies: []
				},
				{
					startDate: '2004-01',
					endDate: '2009-12',
					company: 'Large Online Gambling Company',
					role: { sv: 'Spelutvecklare', en: 'Game Developer' },
					description: {
						sv: 'Designade och implementerade en ny online-pokerklient som användes av miljoner.',
						en: 'Designed and implemented a new online poker client used by millions daily.'
					},
					technologies: []
				},
				{
					startDate: '1999-01',
					endDate: '2004-12',
					company: 'Telecom Consultancy Firm',
					role: { sv: 'Konsult', en: 'Consultant' },
					description: {
						sv: 'Utförde serverutvecklingsarbete för stora telekom- och företagskunder.',
						en: 'Performed server development work for major telecom and enterprise clients.'
					},
					technologies: []
				}
			],
			techniques: [
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
			methods: ['Agile', 'TDD', 'CI/CD', 'Test Automation'],
			languages: [],
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
			footerNote: {
				sv: 'Referenser lämnas på begäran.',
				en: 'References available upon request.'
			}
		}
	}
];

// Service functions
export const ResumeService = {
	getPeople(): Person[] {
		return PEOPLE;
	},

	getPerson(id: string): Person | undefined {
		return PEOPLE.find((p) => p.id === id);
	},

	getResumesForPerson(personId: string): SimpleResume[] {
		return RESUMES.filter((r) => r.personId === personId);
	},

	getResume(id: string): SimpleResume | undefined {
		return RESUMES.find((r) => r.id === id);
	},

	getMainResume(personId: string): SimpleResume | undefined {
		return RESUMES.find((r) => r.personId === personId && r.isMain);
	},

	getAllResumes(): SimpleResume[] {
		return RESUMES;
	}
};
