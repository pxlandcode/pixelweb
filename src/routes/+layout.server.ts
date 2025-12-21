import type { LayoutServerLoad } from './$types';
import { IS_CHRISTMAS } from '$env/static/private';

export const load: LayoutServerLoad = async () => {
	const isChristmas = String(IS_CHRISTMAS ?? '').toLowerCase() === 'true';

	return { isChristmas };
};
