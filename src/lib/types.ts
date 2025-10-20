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
};
