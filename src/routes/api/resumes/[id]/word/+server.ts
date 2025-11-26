import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
        // Placeholder DOCX handler; connect to docx generation utilities later.
        return json({ message: 'Word export stub', resumeId: params.id }, { status: 202 });
};
