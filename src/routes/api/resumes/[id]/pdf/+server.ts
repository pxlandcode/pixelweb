import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
        // Placeholder export handler; hook into Playwright/PDFKit generation later.
        return json({ message: 'PDF export stub', resumeId: params.id }, { status: 202 });
};
