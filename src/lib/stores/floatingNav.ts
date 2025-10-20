import { writable } from 'svelte/store';

type FloatingNavState = {
	active: boolean;
	showCta: boolean;
};

const defaultState: FloatingNavState = {
	active: false,
	showCta: false
};

const floatingNavState = writable<FloatingNavState>(defaultState);

const setFloatingNavState = (state: FloatingNavState) => {
	floatingNavState.set(state);
};

const resetFloatingNavState = () => {
	floatingNavState.set(defaultState);
};

export { floatingNavState, resetFloatingNavState, setFloatingNavState };
export type { FloatingNavState };
