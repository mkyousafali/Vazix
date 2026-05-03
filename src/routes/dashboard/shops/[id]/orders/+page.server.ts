import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.session) throw redirect(302, '/login');

	const { data: shop } = await locals.supabase
		.from('shops')
		.select('id, name')
		.eq('id', params.id)
		.eq('owner_id', locals.session.user.id)
		.single();

	if (!shop) throw error(404, 'Shop not found');

	const { data: orders } = await locals.supabase
		.from('orders')
		.select('*')
		.eq('shop_id', params.id)
		.order('created_at', { ascending: false });

	return { shop, orders: orders ?? [] };
};
