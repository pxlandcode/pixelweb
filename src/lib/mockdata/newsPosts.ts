import type { NewsPreviewItem } from '$lib/types';

export const mockNewsPosts: NewsPreviewItem[] = [
	{
		id: 'mock-news-1',
		title: 'PixelCode launches new design system accelerator',
		summary:
			'Our design engineering team just shipped a reusable accelerator that helps clients launch cohesive product experiences faster.',
		publishedAt: new Date().toISOString(),
		href: '#',
		ctaLabel: 'Read article',
		coverImageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=640&q=80',
		coverImageAlt: 'Team collaborating around laptops'
	},
	{
		id: 'mock-news-2',
		title: 'Behind the scenes of a fintech platform re-platform',
		summary:
			"We recently helped a Nordic fintech scale their platform globally—here's how our cross-functional team delivered in record time.",
		publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
		href: '#',
		ctaLabel: 'Read article',
		coverImageUrl: 'https://images.unsplash.com/photo-1523966211575-eb4a3e252d5c?auto=format&fit=crop&w=640&q=80',
		coverImageAlt: 'Laptop displaying analytics'
	},
	{
		id: 'mock-news-3',
		title: 'Meet our latest senior product designer, Sofia',
		summary:
			'Sofia joins PixelCode after leading product design at a fast-growing SaaS scale-up. Learn more about her journey and design philosophy.',
		publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
		href: '#',
		ctaLabel: 'Get to know Sofia',
		coverImageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=640&q=80',
		coverImageAlt: 'Designer at workstation'
	}
];
