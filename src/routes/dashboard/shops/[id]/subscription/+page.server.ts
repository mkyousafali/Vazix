import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.session) throw redirect(302, '/login');

	const { data: shop } = await locals.supabase
		.from('shops')
		.select('id, name, subscription_status, subscription_expires_at, subscription_started_at')
		.eq('id', params.id)
		.eq('owner_id', locals.session.user.id)
		.single();

	if (!shop) throw error(404, 'Shop not found');

	const { data: logs } = await locals.supabase
		.from('subscription_logs')
		.select('*')
		.eq('shop_id', params.id)
		.order('created_at', { ascending: false })
		.limit(20);

	return { shop, logs: logs ?? [] };
};
