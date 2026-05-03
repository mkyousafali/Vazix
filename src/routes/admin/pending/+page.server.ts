import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createAdminSupabaseClient } from '$lib/supabase/server';

export const load: PageServerLoad = async ({ locals }) => {
if (!locals.session) throw redirect(302, '/login');

const admin = createAdminSupabaseClient();

const { data: pending } = await admin
.from('profiles')
.select('id, full_name, whatsapp_number, city, created_at')
.eq('status', 'pending')
.order('created_at', { ascending: true });

// Fetch emails from auth
const { data: authUsers } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
const emailMap = Object.fromEntries((authUsers?.users ?? []).map((u: any) => [u.id, u.email]));

const users = (pending ?? []).map((p) => ({ ...p, email: emailMap[p.id] ?? '' }));

return { users };
};

export const actions: Actions = {
approve: async ({ request, locals }) => {
if (!locals.session) throw redirect(302, '/login');

const form = await request.formData();
const userId = form.get('user_id') as string;

const admin = createAdminSupabaseClient();

// Activate the user — 30-day trial starts when they create their first shop
await admin
.from('profiles')
.update({ status: 'active' })
.eq('id', userId);

return { success: true };
},

reject: async ({ request, locals }) => {
if (!locals.session) throw redirect(302, '/login');

const form = await request.formData();
const userId = form.get('user_id') as string;

const admin = createAdminSupabaseClient();

await admin
.from('profiles')
.update({ status: 'suspended' })
.eq('id', userId);

return { success: true };
}
};
