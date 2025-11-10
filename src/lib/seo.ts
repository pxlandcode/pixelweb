export type JsonLd = Record<string, unknown>;

export type PageMetaInput = {
	title?: string;
	description?: string;
	path?: string;
	canonical?: string;
	ogImage?: string;
	type?: 'website' | 'article';
	twitterCard?: 'summary' | 'summary_large_image';
	noindex?: boolean;
	jsonLd?: JsonLd | JsonLd[];
};

export type PageMeta = {
	title: string;
	description: string;
	path: string;
	canonical: string;
	ogImage?: string;
	type: 'website' | 'article';
	twitterCard: 'summary' | 'summary_large_image';
	noindex: boolean;
	jsonLd?: JsonLd | JsonLd[];
};

export type SitemapEntry = {
	path: string;
	changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
	priority?: number;
	lastmod?: string;
};

export const siteMeta = {
	name: 'Pixelcode',
	url: 'https://pixelcode.se',
	tagline: 'Digital products with real business value',
	defaultDescription: 'We design, build and support digital products that create real business value.',
	logoPath: '/and.svg'
};

export const marketingRoutes: SitemapEntry[] = [
	{ path: '/', changefreq: 'weekly', priority: 1 },
	{ path: '/about-us', changefreq: 'monthly', priority: 0.6 }
];

export const absoluteUrl = (path: string): string => {
	const safePath = path || '/';
	try {
		return new URL(safePath, siteMeta.url).toString();
	} catch {
		const sanitizedSite = siteMeta.url.replace(/\/$/, '');
		const sanitizedPath = safePath.startsWith('/') ? safePath : `/${safePath}`;
		return `${sanitizedSite}${sanitizedPath}`;
	}
};

export const withMetaDefaults = (meta?: PageMetaInput, currentPath = '/'): PageMeta => {
	const resolvedPath = meta?.path ?? currentPath ?? '/';
	return {
		title: meta?.title ?? `${siteMeta.name} — ${siteMeta.tagline}`,
		description: meta?.description ?? siteMeta.defaultDescription,
		path: resolvedPath,
		canonical: meta?.canonical ?? absoluteUrl(resolvedPath),
		ogImage: meta?.ogImage,
		type: meta?.type ?? 'website',
		twitterCard: meta?.twitterCard ?? 'summary_large_image',
		noindex: meta?.noindex ?? false,
		jsonLd: meta?.jsonLd
	};
};

export const buildOrganizationSchema = () => ({
	'@context': 'https://schema.org',
	'@type': 'Organization',
	name: siteMeta.name,
	url: siteMeta.url,
	logo: absoluteUrl(siteMeta.logoPath)
});

export const buildWebsiteSchema = () => ({
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: siteMeta.name,
	url: siteMeta.url,
	publisher: {
		'@type': 'Organization',
		name: siteMeta.name,
		url: siteMeta.url
	},
	potentialAction: {
		'@type': 'SearchAction',
		target: `${siteMeta.url}/?s={search_term_string}`,
		'query-input': 'required name=search_term_string'
	}
});
