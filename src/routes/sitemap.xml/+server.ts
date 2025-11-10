import type { RequestHandler } from './$types';
import { absoluteUrl, marketingRoutes } from '$lib/seo';

export const prerender = true;

const xmlEscape = (value: string) =>
	value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

export const GET: RequestHandler = () => {
	const timestamp = new Date().toISOString();

	const urlset = marketingRoutes
		.map((entry) => {
			const loc = xmlEscape(absoluteUrl(entry.path));
			const changefreq = entry.changefreq ?? 'monthly';
			const priority =
				typeof entry.priority === 'number' ? Math.max(0, Math.min(1, entry.priority)).toFixed(1) : '0.5';
			const lastmod = xmlEscape(entry.lastmod ?? timestamp);
			return `
	<url>
		<loc>${loc}</loc>
		<changefreq>${changefreq}</changefreq>
		<priority>${priority}</priority>
		<lastmod>${lastmod}</lastmod>
	</url>`;
		})
		.join('');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
