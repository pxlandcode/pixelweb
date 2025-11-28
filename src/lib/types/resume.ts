/**
 * Simplified Resume Types
 *
 * Fixed structure matching Pierre's resume format:
 * 1. Header (name, title, summary, contacts)
 * 2. Skills Grid (example skills for sidebar)
 * 3. Highlighted Experiences (1-2 featured)
 * 4. Previous Experience (list)
 * 5. Skills (Techniques + Methods)
 * 6. Other (Languages + Education + Portfolio)
 * 7. Footer
 */

export type LocalizedText = string | { sv: string; en: string };

export type ContactPerson = {
	name: string;
	phone?: string | null;
	email?: string | null;
};

export type HighlightedExperience = {
	company: string;
	role: LocalizedText;
	description: LocalizedText;
	technologies: string[];
};

export type ExperienceItem = {
	startDate: string;
	endDate?: string | null;
	company: string;
	location?: LocalizedText | null;
	role: LocalizedText;
	description: LocalizedText;
	technologies: string[];
};

export type LabeledItem = {
	label: LocalizedText;
	value: LocalizedText;
};

export type ResumeData = {
	// Header
	name: string;
	title: LocalizedText;
	summary: LocalizedText;
	contacts: ContactPerson[];

	// Skills sidebar
	exampleSkills: string[];

	// Highlighted experiences (shown on cover page, max 2 visible)
	highlightedExperiences: HighlightedExperience[];

	// Previous experience list
	experiences: ExperienceItem[];

	// Skills section
	techniques: string[];
	methods: string[];

	// Other section
	languages: LabeledItem[];
	education: LabeledItem[];
	portfolio?: string[];

	// Footer
	footerNote?: LocalizedText;
};

export type SimpleResume = {
	id: string;
	personId: string;
	title: string;
	version: string;
	updatedAt: string;
	isMain: boolean;
	data: ResumeData;
};
