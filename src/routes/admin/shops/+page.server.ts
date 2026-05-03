import { fail } from '@sveltejs/kit';
import { createAdminSupabaseClient } from '$lib/supabase/server';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const search = url.searchParams.get('search') ?? '';
	const statusFilter = url.searchParams.get('status') ?? '';

	let query = locals.supabase
		.from('shops')
		.select('id, name, slug, owner_id, subscription_status, subscription_expires_at, is_active, city, created_at, profiles!shops_owner_id_fkey(full_name, email:id)')
		.order('created_at', { ascending: false });

	if (statusFilter) query = query.eq('subscription_status', statusFilter as never);
	if (search) query = query.ilike('name', `%${search}%`);

	const { data: shops } = await query;

	return { shops: shops ?? [], search, statusFilter };
};

export const actions: Actions = {
	async updateSubscription({ request, locals }) {
		const form = await request.formData();
		const shopId = form.get('shop_id') as string;
		const action = form.get('action') as string;
		const adminId = locals.session!.user.id;

		if (!shopId || !action) return fail(400, { error: 'Missing data' });

		// Get current state
		const { data: shop } = await locals.supabase
			.from('shops')
			.select('subscription_status, subscription_expires_at')
			.eq('id', shopId)
			.single();

		if (!shop) return fail(404, { error: 'Shop not found' });

		const now = new Date();
		const currentExpiry = shop.subscription_expires_at ? new Date(shop.subscription_expires_at) : now;

		let newStatus = shop.subscription_status;
		let newExpiry = currentExpiry;
		let notes = '';

		switch (action) {
			case 'activate_30':
				newStatus = 'active';
				newExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
				notes = 'Admin activated 30 days';
				break;
			case 'activate_year':
				newStatus = 'active';
				newExpiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
				notes = 'Admin activated 1 year';
				break;
			case 'extend_7':
				newStatus = 'active';
				newExpiry = new Date(Math.max(currentExpiry.getTime(), now.getTime()) + 7 * 24 * 60 * 60 * 1000);
				notes = 'Admin extended 7 days';
				break;
			case 'pause':
				newStatus = 'paused';
				notes = 'Admin paused';
				break;
			case 'reactivate':
				newStatus = 'active';
				notes = 'Admin reactivated';
				break;
			case 'mark_expired':
				newStatus = 'expired';
				newExpiry = now;
				notes = 'Admin marked expired';
				break;
			default:
				return fail(400, { error: 'Unknown action' });
		}

		// Use admin client to bypass RLS for this privileged update
		const adminClient = createAdminSupabaseClient();

		const { error: updateError } = await adminClient
			.from('shops')
			.update({
				subscription_status: newStatus as never,
				subscription_expires_at: newExpiry.toISOString()
			})
			.eq('id', shopId);

		if (updateError) return fail(500, { error: updateError.message });

		// Log the action
		await adminClient.from('subscription_logs').insert({
			shop_id: shopId,
			changed_by: adminId,
			action: action as never,
			old_status: shop.subscription_status as never,
			new_status: newStatus as never,
			old_expires_at: shop.subscription_expires_at,
			new_expires_at: newExpiry.toISOString(),
			notes
		});

		return { success: true };
	}
};
