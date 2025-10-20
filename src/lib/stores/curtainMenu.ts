import { writable } from 'svelte/store';

const createCurtainMenuStore = () => {
	const { subscribe, set, update } = writable(false);

	return {
		subscribe,
		open: () => set(true),
		close: () => set(false),
		toggle: () => update((value) => !value)
	};
};

const curtainMenu = createCurtainMenuStore();

export { curtainMenu };
