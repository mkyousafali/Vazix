import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: shops } = await locals.supabase
		.from('shops')
		.select('*')
		.eq('owner_id', locals.session!.user.id)
		.order('created_at', { ascending: false });

	return { shops: shops ?? [] };
};
