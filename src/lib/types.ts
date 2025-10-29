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

export type LinkedInPost = {
	id: string;
	title: string;
	summary: string;
	publishedAt: string;
	link: string;
	mediaUrl?: string;
	mediaAlt?: string;
	badge?: string;
	ctaLabel?: string;
};
