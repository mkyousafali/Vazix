import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {};

export const actions: Actions = {
default: async ({ request, locals }) => {
const form = await request.formData();
const email = (form.get('email') as string)?.trim().toLowerCase();

if (!email) {
return fail(400, { error: 'auth.error_required' });
}

// Find the profile by email via auth
const { data: userData } = await locals.supabase.auth.admin?.listUsers?.() ?? { data: null };

// Mark password_reset_requested on profile (by email match in auth)
// We use a lightweight approach: just store the request; admin will generate the link
const { data: authUser } = await locals.supabase.rpc('get_user_id_by_email', { p_email: email }).maybeSingle() as any;

// Try to find profile by looking up auth users - use admin client approach
// Simple: just flag by email stored in auth.users (via service role)
const { createAdminSupabaseClient } = await import('$lib/supabase/server');
const admin = createAdminSupabaseClient();
const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
const user = users?.users?.find((u: any) => u.email === email);

if (!user) {
// Return success anyway to not leak if email exists
return { success: true };
}

await admin.from('profiles').update({ password_reset_requested: true }).eq('id', user.id);

return { success: true };
}
};
