import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createAdminSupabaseClient } from '$lib/supabase/server';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ locals, url }) => {
if (!locals.session) throw redirect(302, '/login');

const admin = createAdminSupabaseClient();

const { data: requesters } = await admin
.from('profiles')
.select('id, full_name, whatsapp_number, created_at')
.eq('password_reset_requested', true)
.order('created_at', { ascending: true });

const { data: authUsers } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
const emailMap = Object.fromEntries((authUsers?.users ?? []).map((u: any) => [u.id, u.email]));

const users = (requesters ?? []).map((p) => ({ ...p, email: emailMap[p.id] ?? '' }));

// If a reset link was just generated, pass it through
const generatedLink = url.searchParams.get('link') ?? null;
const generatedFor = url.searchParams.get('for') ?? null;

return { users, generatedLink, generatedFor };
};

export const actions: Actions = {
generate_link: async ({ request, locals, url }) => {
if (!locals.session) throw redirect(302, '/login');

const form = await request.formData();
const userId = form.get('user_id') as string;
const email = form.get('email') as string;

const admin = createAdminSupabaseClient();

const { data, error } = await admin.auth.admin.generateLink({
type: 'recovery',
email,
options: { redirectTo: `${url.origin}/auth/callback?type=recovery` }
});

if (error || !data) {
return { error: 'Failed to generate link.' };
}

const resetLink = (data as any).properties?.action_link ?? '';

// Return the link to display in admin UI (admin will send via WhatsApp)
return { success: true, resetLink, email };
},

dismiss: async ({ request, locals }) => {
if (!locals.session) throw redirect(302, '/login');

const form = await request.formData();
const userId = form.get('user_id') as string;

const admin = createAdminSupabaseClient();
await admin.from('profiles').update({ password_reset_requested: false }).eq('id', userId);

return { success: true };
}
};
