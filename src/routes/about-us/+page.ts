import type { PageLoad } from './$types';
import { siteMeta } from '$lib/seo';

const meta = {
	title: `About Us — People & Culture | ${siteMeta.name}`,
	description:
		'Peek behind the scenes at how Pixel&Code_, grows and maintains a healthy culture for developers.',
	path: '/about-us'
};

export const load = (() => ({ meta })) satisfies PageLoad;
