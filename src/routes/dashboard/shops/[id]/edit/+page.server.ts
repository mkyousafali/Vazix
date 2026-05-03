import { redirect, fail, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	return await parent();
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		if (!locals.session) throw redirect(302, '/login');

		const { data: shop } = await locals.supabase
			.from('shops')
			.select('id, owner_id')
			.eq('id', params.id)
			.eq('owner_id', locals.session.user.id)
			.single();

		if (!shop) throw error(403, 'Forbidden');

		const form = await request.formData();
		const name = (form.get('name') as string)?.trim();
		const slug = (form.get('slug') as string)?.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
		const city = (form.get('city') as string)?.trim();
		const description = (form.get('description') as string)?.trim();
		const whatsapp_number = (form.get('whatsapp_number') as string)?.trim().replace(/\s+/g, '');
		const pickup_enabled = form.get('pickup_enabled') === 'on';
		const delivery_enabled = form.get('delivery_enabled') === 'on';
		const delivery_fee = parseFloat((form.get('delivery_fee') as string) || '0');
		const minimum_delivery_order = parseFloat((form.get('minimum_delivery_order') as string) || '0');
		const is_active = form.get('is_active') === 'on';

		if (!name || !slug || !whatsapp_number) {
			return fail(400, { error: 'error_required' });
		}

		// Check slug uniqueness (exclude current shop)
		const { data: existing } = await locals.supabase
			.from('shops')
			.select('id')
			.eq('slug', slug)
			.neq('id', params.id)
			.maybeSingle();

		if (existing) {
			return fail(400, { error: 'error_slug_taken' });
		}

		const updateData: Record<string, unknown> = {
			name,
			slug,
			city: city || null,
			description: description || null,
			whatsapp_number,
			pickup_enabled,
			delivery_enabled,
			delivery_fee: isNaN(delivery_fee) ? 0 : delivery_fee,
			minimum_delivery_order: isNaN(minimum_delivery_order) ? 0 : minimum_delivery_order,
			is_active
		};

		// Handle logo upload
		const logoFile = form.get('logo') as File;
		if (logoFile && logoFile.size > 0) {
			const ext = logoFile.name.split('.').pop();
			const filename = `logos/${shop.id}/${Date.now()}.${ext}`;
			const arrayBuffer = await logoFile.arrayBuffer();
			const { error: uploadError } = await locals.supabase.storage
				.from('shop-assets')
				.upload(filename, arrayBuffer, { contentType: logoFile.type, upsert: false });

			if (!uploadError) {
				const { data: urlData } = locals.supabase.storage
					.from('shop-assets')
					.getPublicUrl(filename);
				updateData.logo_url = urlData.publicUrl;
			}
		}

		const { error: updateError } = await locals.supabase
			.from('shops')
			.update(updateData)
			.eq('id', shop.id);

		if (updateError) {
			return fail(500, { error: 'error_save' });
		}

		return { success: true };
	}
};
