export type NavLink = {
	label: string;
	href: string;
};

export type CardstackEntry = {
	eyebrow: string;
	title: string;
	description: string;
	bullets?: string[];
	link?: { href: string; label: string };
	img?: string;
	imgAlt?: string;
	imagePosition?: 'left' | 'right';
};

export type LeadInput = { website_url: string; email: string; consent: 'true' };

export type QuotaInfo = { remaining: number };

export type NewsPreviewItem = {
	id: string;
	title: string;
	summary: string | null;
	publishedAt: string | null;
	href: string;
	ctaLabel?: string;
	coverImageUrl?: string | null;
	coverImageAlt?: string | null;
	badge?: string | null;
};
