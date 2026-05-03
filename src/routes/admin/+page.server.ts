import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { stats } = await parent();
	return { stats };
};
