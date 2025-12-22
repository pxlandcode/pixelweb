import { writable } from 'svelte/store';

const marqueeHeight = writable(0);

const setMarqueeHeight = (height: number) => {
	marqueeHeight.set(Math.max(0, height));
};

const resetMarqueeHeight = () => {
	marqueeHeight.set(0);
};

export { marqueeHeight, resetMarqueeHeight, setMarqueeHeight };
