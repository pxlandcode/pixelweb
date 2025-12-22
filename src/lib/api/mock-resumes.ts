/**
 * Thin wrapper so older imports can keep using the mock API location.
 * The data lives in `src/lib/services/resume.ts`.
 */

import { ResumeService } from '$lib/services/resume';

export { ResumeService as MockResumeService };
export type { Resume, Person, TechCategory, ResumeData } from '$lib/types/resume';
