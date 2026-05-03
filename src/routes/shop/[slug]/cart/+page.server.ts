import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data: shop } = await locals.supabase
		.from('shops')
		.select('id, name, slug, whatsapp_number, pickup_enabled, delivery_enabled, delivery_fee, minimum_delivery_order, is_active, subscription_status, subscription_expires_at')
		.eq('slug', params.slug)
		.maybeSingle();

	if (!shop) throw error(404, 'Shop not found');

	const isAvailable =
		shop.is_active &&
		(shop.subscription_status === 'trial' || shop.subscription_status === 'active') &&
		new Date(shop.subscription_expires_at) > new Date();

	return { shop, isAvailable };
};
