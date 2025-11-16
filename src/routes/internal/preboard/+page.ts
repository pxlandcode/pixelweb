import type { PageLoad } from './$types';

const SUPPORTED_LANGUAGES = ['sv', 'en'] as const;
type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const load: PageLoad = ({ url }) => {
	const param = url.searchParams.get('lang')?.toLowerCase() ?? '';
	const lang = (SUPPORTED_LANGUAGES.find((code) => code === param) ?? 'sv') as Language;

	return {
		lang,
		unauthorized: url.searchParams.has('unauthorized')
	};
};
