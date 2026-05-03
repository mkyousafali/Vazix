import { redirect, fail, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.session) throw redirect(302, '/login');

	// Verify shop ownership
	const { data: shop } = await locals.supabase
		.from('shops')
		.select('id, name')
		.eq('id', params.id)
		.eq('owner_id', locals.session.user.id)
		.single();

	if (!shop) throw error(404, 'Shop not found');

	const { data: products } = await locals.supabase
		.from('products')
		.select('*')
		.eq('shop_id', params.id)
		.order('sort_order', { ascending: true })
		.order('created_at', { ascending: false });

	return { shop, products: products ?? [] };
};

export const actions: Actions = {
	create: async ({ request, params, locals }) => {
		if (!locals.session) throw redirect(302, '/login');

		const { data: shop } = await locals.supabase
			.from('shops')
			.select('id')
			.eq('id', params.id)
			.eq('owner_id', locals.session.user.id)
			.single();

		if (!shop) throw error(403, 'Forbidden');

		const form = await request.formData();
		const name = (form.get('name') as string)?.trim();
		const description = (form.get('description') as string)?.trim();
		const price = parseFloat(form.get('price') as string);
		const category = (form.get('category') as string)?.trim();
		const sort_order = parseInt((form.get('sort_order') as string) || '0', 10);
		const is_active = form.get('is_active') === 'on';

		if (!name) return fail(400, { error: 'error_required', action: 'create' });
		if (isNaN(price) || price < 0) return fail(400, { error: 'error_price', action: 'create' });

		const { data: product, error: insertError } = await locals.supabase
			.from('products')
			.insert({
				shop_id: params.id,
				name,
				description: description || null,
				price,
				category: category || null,
				sort_order: isNaN(sort_order) ? 0 : sort_order,
				is_active
			})
			.select('id')
			.single();

		if (insertError || !product) return fail(500, { error: 'error_save', action: 'create' });

		// Upload image
		const imageFile = form.get('image') as File;
		if (imageFile && imageFile.size > 0) {
			const ext = imageFile.name.split('.').pop();
			const filename = `products/${params.id}/${product.id}.${ext}`;
			const arrayBuffer = await imageFile.arrayBuffer();
			const { error: uploadError } = await locals.supabase.storage
				.from('shop-assets')
				.upload(filename, arrayBuffer, { contentType: imageFile.type, upsert: true });

			if (!uploadError) {
				const { data: urlData } = locals.supabase.storage
					.from('shop-assets')
					.getPublicUrl(filename);
				await locals.supabase.from('products').update({ image_url: urlData.publicUrl }).eq('id', product.id);
			}
		}

		return { success: true, action: 'create' };
	},

	update: async ({ request, params, locals }) => {
		if (!locals.session) throw redirect(302, '/login');

		const { data: shop } = await locals.supabase
			.from('shops')
			.select('id')
			.eq('id', params.id)
			.eq('owner_id', locals.session.user.id)
			.single();

		if (!shop) throw error(403, 'Forbidden');

		const form = await request.formData();
		const productId = form.get('product_id') as string;
		const name = (form.get('name') as string)?.trim();
		const description = (form.get('description') as string)?.trim();
		const price = parseFloat(form.get('price') as string);
		const category = (form.get('category') as string)?.trim();
		const sort_order = parseInt((form.get('sort_order') as string) || '0', 10);
		const is_active = form.get('is_active') === 'on';

		if (!name) return fail(400, { error: 'error_required', action: 'update', productId });
		if (isNaN(price) || price < 0) return fail(400, { error: 'error_price', action: 'update', productId });

		const updateData: Record<string, unknown> = {
			name,
			description: description || null,
			price,
			category: category || null,
			sort_order: isNaN(sort_order) ? 0 : sort_order,
			is_active
		};

		// Upload image
		const imageFile = form.get('image') as File;
		if (imageFile && imageFile.size > 0) {
			const ext = imageFile.name.split('.').pop();
			const filename = `products/${params.id}/${productId}.${ext}`;
			const arrayBuffer = await imageFile.arrayBuffer();
			const { error: uploadError } = await locals.supabase.storage
				.from('shop-assets')
				.upload(filename, arrayBuffer, { contentType: imageFile.type, upsert: true });

			if (!uploadError) {
				const { data: urlData } = locals.supabase.storage
					.from('shop-assets')
					.getPublicUrl(filename);
				updateData.image_url = urlData.publicUrl;
			}
		}

		const { error: updateError } = await locals.supabase
			.from('products')
			.update(updateData)
			.eq('id', productId)
			.eq('shop_id', params.id);

		if (updateError) return fail(500, { error: 'error_save', action: 'update', productId });

		return { success: true, action: 'update', productId };
	},

	delete: async ({ request, params, locals }) => {
		if (!locals.session) throw redirect(302, '/login');

		const { data: shop } = await locals.supabase
			.from('shops')
			.select('id')
			.eq('id', params.id)
			.eq('owner_id', locals.session.user.id)
			.single();

		if (!shop) throw error(403, 'Forbidden');

		const form = await request.formData();
		const productId = form.get('product_id') as string;

		await locals.supabase
			.from('products')
			.delete()
			.eq('id', productId)
			.eq('shop_id', params.id);

		return { success: true, action: 'delete' };
	}
};
