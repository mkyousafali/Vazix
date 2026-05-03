import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	// Fetch shop (respects RLS - only available shops returned for public)
	const { data: shop } = await locals.supabase
		.from('shops')
		.select('*')
		.eq('slug', params.slug)
		.maybeSingle();

	// Check if shop exists at all (even if inactive)
	if (!shop) {
		// Try without RLS filter to see if it exists but inactive
		const { data: anyShop } = await locals.supabase
			.from('shops')
			.select('id, name, is_active, subscription_status')
			.eq('slug', params.slug)
			.maybeSingle();

		if (!anyShop) throw error(404, 'Shop not found');

		// Shop exists but inactive
		return { shop: null, products: [], inactive: true, shopName: anyShop.name };
	}

	const { data: products } = await locals.supabase
		.from('products')
		.select('id, name, description, price, image_url, category, sort_order, is_active')
		.eq('shop_id', shop.id)
		.eq('is_active', true)
		.order('sort_order', { ascending: true })
		.order('name', { ascending: true });

	return { shop, products: products ?? [], inactive: false, shopName: shop.name };
};
