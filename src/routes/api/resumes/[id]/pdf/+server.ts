import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { AUTH_COOKIE_NAMES } from '$lib/server/supabase';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '$env/static/private';

const PDF_FILENAME = (id: string, lang: string) => `resume-${id}-${lang}.pdf`;

export const GET: RequestHandler = async ({ params, url, cookies }) => {
	const resumeId = params.id;
	const lang = url.searchParams.get('lang') ?? 'sv';

	let chromium: typeof import('playwright').chromium;
	try {
		({ chromium } = await import('playwright'));
	} catch (err) {
		console.error('Playwright import failed. Install `playwright` to enable PDF export.', err);
		throw error(500, 'PDF export not available. Please install the playwright dependency.');
	}

	const browser = await chromium.launch({ headless: true });

	try {
		const page = await browser.newPage({
			viewport: { width: 1123, height: 1587 }
		});

		// Use the print route
		const target = new URL(`/print/resumes/${resumeId}`, url.origin);
		target.searchParams.set('lang', lang);
		const targetUrl = target.toString();

		let accessToken = cookies.get(AUTH_COOKIE_NAMES.access);
		const refreshToken = cookies.get(AUTH_COOKIE_NAMES.refresh);

		if (!accessToken && refreshToken) {
			try {
				const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
					auth: {
						persistSession: false,
						autoRefreshToken: false,
						detectSessionInUrl: false
					}
				});
				const { data, error: refreshError } = await supabase.auth.refreshSession({
					refresh_token: refreshToken
				});

				if (!refreshError && data.session) {
					accessToken = data.session.access_token;
				}
			} catch (err) {
				console.error('[pdf] Error during token refresh:', err);
			}
		}

		if (!accessToken) {
			throw error(401, 'Unauthorized: missing access token for PDF rendering.');
		}

		await page.context().addCookies([
			{
				name: AUTH_COOKIE_NAMES.access,
				value: accessToken,
				domain: new URL(url.origin).hostname,
				path: '/',
				httpOnly: true,
				sameSite: 'Lax' as const
			},
			...(refreshToken
				? [
						{
							name: AUTH_COOKIE_NAMES.refresh,
							value: refreshToken,
							domain: new URL(url.origin).hostname,
							path: '/',
							httpOnly: true,
							sameSite: 'Lax' as const
						}
					]
				: [])
		]);

		const response = await page.goto(targetUrl, { waitUntil: 'networkidle' });
		if (!response || !response.ok()) {
			throw error(response?.status() ?? 500, 'Failed to load resume page for PDF rendering.');
		}

		await page.emulateMedia({ media: 'print', colorScheme: 'light' });
		await page.waitForSelector('.resume-print-page', { timeout: 15_000 });
		await page.waitForSelector('.pdf-mode', { timeout: 5_000 }).catch(() => null);
		await page
			.waitForFunction(() => (document as Document).fonts?.ready, { timeout: 5_000 })
			.catch(() => null);

		await page.waitForFunction(
			() => {
				const el = document.querySelector('.resume-print-page');
				if (!el) return false;
				return (el as HTMLElement).innerText.trim().length > 0;
			},
			{ timeout: 15_000 }
		);

		// Convert oklch/lab colors to rgb for PDF compatibility
		await page.evaluate(() => {
			const toRgb = (value: string) => {
				if (!value) return value;
				const el = document.createElement('div');
				el.style.color = value;
				document.body.appendChild(el);
				const resolved = getComputedStyle(el).color;
				el.remove();
				return resolved || value;
			};

			const resume = document.querySelector('.resume-print-page') as HTMLElement | null;
			if (resume) {
				const walker = document.createTreeWalker(resume, NodeFilter.SHOW_ELEMENT, null);
				while (walker.nextNode()) {
					const el = walker.currentNode as HTMLElement;
					const computed = getComputedStyle(el);
					const color = computed.color || '';
					const bg = computed.backgroundColor || '';
					if (color.startsWith('oklch') || color.startsWith('lch') || color.startsWith('lab')) {
						el.style.color = toRgb(color);
					}
					if (
						bg &&
						bg !== 'rgba(0, 0, 0, 0)' &&
						(bg.startsWith('oklch') || bg.startsWith('lch') || bg.startsWith('lab'))
					) {
						el.style.backgroundColor = toRgb(bg);
					}
				}
			}
		});

		const pdfBuffer = await page.pdf({
			format: 'A4',
			printBackground: true,
			preferCSSPageSize: true,
			margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' }
		});

		return new Response(new Uint8Array(pdfBuffer), {
			status: 200,
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="${PDF_FILENAME(resumeId, lang)}"`
			}
		});
	} catch (err) {
		console.error('Failed to generate PDF', err);
		throw error(500, 'Could not generate PDF.');
	} finally {
		await browser.close();
	}
};
