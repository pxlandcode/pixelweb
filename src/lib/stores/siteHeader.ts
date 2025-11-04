import { writable } from 'svelte/store';

type SiteHeaderState = {
	height: number;
	parallaxOffset: number;
};

const defaultState: SiteHeaderState = {
	height: 0,
	parallaxOffset: 0
};

const siteHeaderState = writable<SiteHeaderState>(defaultState);

const updateSiteHeaderState = (state: Partial<SiteHeaderState>) =>
	siteHeaderState.update((current) => {
		const next = { ...current, ...state };
		if (next.height === current.height && next.parallaxOffset === current.parallaxOffset) {
			return current;
		}
		return next;
	});

const resetSiteHeaderState = () => {
	siteHeaderState.set(defaultState);
};

export { resetSiteHeaderState, siteHeaderState, updateSiteHeaderState };
export type { SiteHeaderState };
