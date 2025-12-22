import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = async () => {
	const isChristmas = String(env.IS_CHRISTMAS ?? '').toLowerCase() === 'true';

	return { isChristmas };
};
