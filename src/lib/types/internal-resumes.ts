import type { PeopleImageId } from '$lib/images/definitions';
import type { ResumeBlock } from '$lib/services/resumes';

export type Person = {
	id: string;
	name: string;
	title: string;
	portraitId: PeopleImageId;
	bio: string;
};

export type InternalResume = {
	id: string;
	personId: string;
	title: string;
	version: string;
	updatedAt: string;
	isMain: boolean;
	content: ResumeBlock[];
};
