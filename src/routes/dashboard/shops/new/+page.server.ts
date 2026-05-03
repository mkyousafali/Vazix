import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) throw redirect(302, '/login');
	if (locals.profile?.status === 'pending') throw redirect(302, '/dashboard');
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.session) throw redirect(302, '/login');
		if (locals.profile?.status === 'pending') return fail(403, { error: 'error_pending' });

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

		if (!name || !slug || !whatsapp_number) {
			return fail(400, { error: 'error_required' });
		}

		// Check slug uniqueness
		const { data: existing } = await locals.supabase
			.from('shops')
			.select('id')
			.eq('slug', slug)
			.maybeSingle();

		if (existing) {
			return fail(400, { error: 'error_slug_taken' });
		}

		// Handle logo upload
		let logo_url: string | null = null;
		const logoFile = form.get('logo') as File;
		if (logoFile && logoFile.size > 0) {
			const ext = logoFile.name.split('.').pop();
			const filename = `${Date.now()}.${ext}`;
			// We'll use a temp placeholder — shop id not yet known
			// Will upload after insert
		}

		const now = new Date();
		const trialEnd = new Date(now);
		trialEnd.setDate(trialEnd.getDate() + 30);

		const { data: shop, error: insertError } = await locals.supabase
			.from('shops')
			.insert({
				owner_id: locals.session.user.id,
				name,
				slug,
				city: city || null,
				description: description || null,
				whatsapp_number,
				pickup_enabled,
				delivery_enabled,
				delivery_fee: isNaN(delivery_fee) ? 0 : delivery_fee,
				minimum_delivery_order: isNaN(minimum_delivery_order) ? 0 : minimum_delivery_order,
				subscription_status: 'trial',
				subscription_started_at: now.toISOString(),
				subscription_expires_at: trialEnd.toISOString(),
				is_active: true
			})
			.select('id')
			.single();

		if (insertError || !shop) {
			return fail(500, { error: 'error_save' });
		}

		// Upload logo if provided
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
				await locals.supabase
					.from('shops')
					.update({ logo_url: urlData.publicUrl })
					.eq('id', shop.id);
			}
		}

		throw redirect(302, `/dashboard/shops/${shop.id}`);
	}
};
