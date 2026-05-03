import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: orders } = await locals.supabase
		.from('orders')
		.select('id, shop_id, customer_name, customer_phone, fulfillment_type, total, created_at, shops!orders_shop_id_fkey(name, slug)')
		.order('created_at', { ascending: false })
		.limit(200);

	return { orders: orders ?? [] };
};
