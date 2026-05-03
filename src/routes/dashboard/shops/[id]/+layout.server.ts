import { redirect, error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, locals }) => {
	if (!locals.session) throw redirect(302, '/login');

	const { data: shop, error: dbError } = await locals.supabase
		.from('shops')
		.select('*')
		.eq('id', params.id)
		.eq('owner_id', locals.session.user.id)
		.single();

	if (dbError || !shop) throw error(404, 'Shop not found');

	return { shop };
};
