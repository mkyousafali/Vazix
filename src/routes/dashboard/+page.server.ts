import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: shops } = await locals.supabase
		.from('shops')
		.select('id, name, slug, subscription_status, subscription_expires_at, is_active')
		.eq('owner_id', locals.session!.user.id)
		.order('created_at', { ascending: false });

	const shopIds = shops?.map((s) => s.id) ?? [];

	let totalProducts = 0;
	let recentOrders: unknown[] = [];

	if (shopIds.length > 0) {
		const { count } = await locals.supabase
			.from('products')
			.select('id', { count: 'exact', head: true })
			.in('shop_id', shopIds);
		totalProducts = count ?? 0;

		const { data: orders } = await locals.supabase
			.from('orders')
			.select('id, customer_name, total, fulfillment_type, created_at, shop_id')
			.in('shop_id', shopIds)
			.order('created_at', { ascending: false })
			.limit(5);
		recentOrders = orders ?? [];
	}

	return {
		shops: shops ?? [],
		totalProducts,
		recentOrders
	};
};
