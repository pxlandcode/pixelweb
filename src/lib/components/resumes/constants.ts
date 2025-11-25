export const ResumeBlockType = {
	HEADER: 'header',
	SKILLS_GRID: 'skills_grid',
	HIGHLIGHTED_EXPERIENCE: 'highlighted_experience',
	EXPERIENCE_SECTION: 'experience_section',
	EXPERIENCE_ITEM: 'experience_item',
	SECTION_HEADER: 'section_header',
	SKILLS_CATEGORIZED: 'skills_categorized',
	MULTI_COLUMN_INFO: 'multi_column_info',
	TESTIMONIAL: 'testimonial',
	FOOTER: 'footer'
} as const;

export type ResumeBlockTypeValue = (typeof ResumeBlockType)[keyof typeof ResumeBlockType];
