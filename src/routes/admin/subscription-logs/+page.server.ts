import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: logs } = await locals.supabase
		.from('subscription_logs')
		.select('id, shop_id, changed_by, action, old_status, new_status, old_expires_at, new_expires_at, notes, created_at, shops!subscription_logs_shop_id_fkey(name, slug)')
		.order('created_at', { ascending: false })
		.limit(200);

	return { logs: logs ?? [] };
};
