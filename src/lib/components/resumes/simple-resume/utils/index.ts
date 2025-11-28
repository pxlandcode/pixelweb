import type { LocalizedText } from '$lib/types/resume';

export type Language = 'sv' | 'en';

/**
 * Resolve localized text to a string based on the current language
 */
export const t = (text: LocalizedText | undefined, language: Language): string => {
	if (!text) return '';
	if (typeof text === 'string') return text;
	return text[language] ?? text.sv ?? '';
};

/**
 * Get a specific language value from a LocalizedText
 */
export const getLocalizedValue = (text: LocalizedText | undefined, lang: Language): string => {
	if (!text) return '';
	if (typeof text === 'string') return text;
	return text[lang] ?? '';
};

/**
 * Set a specific language value in a LocalizedText, returning a new object
 */
export const setLocalizedValue = (
	current: LocalizedText | undefined,
	lang: Language,
	value: string
): LocalizedText => {
	if (!current || typeof current === 'string') {
		const other = lang === 'sv' ? 'en' : 'sv';
		return { [lang]: value, [other]: typeof current === 'string' ? current : '' } as {
			sv: string;
			en: string;
		};
	}
	return { ...current, [lang]: value };
};

/**
 * Format a date string for display (e.g., "Jan 2020")
 */
export const formatDate = (dateString: string | null | undefined, language: Language): string => {
	if (!dateString) return language === 'sv' ? 'Nuvarande' : 'Present';
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return dateString;
	const month = date.toLocaleDateString(language === 'sv' ? 'sv-SE' : 'en-US', {
		month: 'short'
	});
	const year = date.getFullYear();
	return `${month} ${year}`;
};
