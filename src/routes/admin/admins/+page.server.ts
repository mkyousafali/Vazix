import { redirect, error } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createAdminSupabaseClient } from '$lib/supabase/server';

export const load: PageServerLoad = async ({ locals }) => {
if (!locals.session) throw redirect(302, '/login');
// Only super_admin can manage admins
if (locals.profile?.role !== 'super_admin') throw error(403, 'Forbidden');

const admin = createAdminSupabaseClient();

const { data: admins } = await admin
.from('profiles')
.select('id, full_name, role, status, created_at')
.in('role', ['super_admin', 'admin'])
.order('created_at', { ascending: true });

const { data: authUsers } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
const emailMap = Object.fromEntries((authUsers?.users ?? []).map((u: any) => [u.id, u.email]));

const adminList = (admins ?? []).map((p) => ({ ...p, email: emailMap[p.id] ?? '' }));

return { admins: adminList };
};

export const actions: Actions = {
create: async ({ request, locals }) => {
if (!locals.session) throw redirect(302, '/login');
if (locals.profile?.role !== 'super_admin') throw error(403, 'Forbidden');

const form = await request.formData();
const email = (form.get('email') as string)?.trim().toLowerCase();
const full_name = (form.get('full_name') as string)?.trim();
const password = form.get('password') as string;

if (!email || !full_name || !password || password.length < 8) {
return fail(400, { error: 'admin.error_required' });
}

const admin = createAdminSupabaseClient();

const { data, error: createError } = await admin.auth.admin.createUser({
email,
password,
email_confirm: true
});

if (createError || !data.user) {
return fail(500, { error: 'admin.error_create_admin' });
}

await admin.from('profiles').update({
full_name,
role: 'admin',
status: 'active',
is_complete: true
}).eq('id', data.user.id);

return { success: true };
},

revoke: async ({ request, locals }) => {
if (!locals.session) throw redirect(302, '/login');
if (locals.profile?.role !== 'super_admin') throw error(403, 'Forbidden');

const form = await request.formData();
const userId = form.get('user_id') as string;

// Cannot revoke yourself
if (userId === locals.session.user.id) {
return fail(400, { error: 'admin.error_revoke_self' });
}

const admin = createAdminSupabaseClient();
await admin.from('profiles').update({ role: 'shop_owner', status: 'suspended' }).eq('id', userId);

return { success: true };
},

change_password: async ({ request, locals }) => {
if (!locals.session) throw redirect(302, '/login');
if (locals.profile?.role !== 'super_admin') throw error(403, 'Forbidden');

const form = await request.formData();
const password = form.get('password') as string;
const confirm = form.get('confirm_password') as string;

if (!password || password.length < 8) {
return fail(400, { error: 'auth.error_password_short' });
}
if (password !== confirm) {
return fail(400, { error: 'auth.error_password_mismatch' });
}

const { error } = await locals.supabase.auth.updateUser({ password });
if (error) return fail(500, { error: 'auth.error_save' });

return { passwordChanged: true };
}
};
