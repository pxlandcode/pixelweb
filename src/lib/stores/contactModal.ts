import { writable } from 'svelte/store';

function createContactModalStore() {
	const { subscribe, set, update } = writable(false);

	return {
		subscribe,
		open: () => set(true),
		close: () => set(false),
		toggle: () => update((value) => !value)
	};
}

export const contactModal = createContactModalStore();
