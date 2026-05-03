import { redirect, error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { createAdminSupabaseClient } from '$lib/supabase/server';

export const load: LayoutServerLoad = async ({ locals }) => {
if (!locals.session) throw redirect(302, '/login');
if (locals.profile?.role !== 'super_admin' && locals.profile?.role !== 'admin') {
throw error(403, 'Forbidden');
}

const admin = createAdminSupabaseClient();

const [shopsResult, ordersResult, pendingResult, resetResult] = await Promise.all([
admin.from('shops').select('id, subscription_status'),
admin.from('orders').select('id', { count: 'exact', head: true }),
admin.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
admin.from('profiles').select('id', { count: 'exact', head: true }).eq('password_reset_requested', true)
]);

const shops = shopsResult.data ?? [];
const stats = {
total_shops: shops.length,
trial_shops: shops.filter((s) => s.subscription_status === 'trial').length,
active_shops: shops.filter((s) => s.subscription_status === 'active').length,
expired_shops: shops.filter((s) => s.subscription_status === 'expired').length,
paused_shops: shops.filter((s) => s.subscription_status === 'paused').length,
total_orders: ordersResult.count ?? 0,
pending_registrations: pendingResult.count ?? 0,
reset_requests: resetResult.count ?? 0
};

return {
stats,
isSuperAdmin: locals.profile?.role === 'super_admin',
adminProfile: locals.profile
};
};
