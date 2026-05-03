import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
// User must be authenticated via the recovery link (Supabase sets session)
if (!locals.session) throw redirect(302, '/login');
return {};
};

export const actions: Actions = {
default: async ({ request, locals }) => {
if (!locals.session) throw redirect(302, '/login');

const form = await request.formData();
const password = form.get('password') as string;
const confirm_password = form.get('confirm_password') as string;

if (!password || password.length < 8) {
return fail(400, { error: 'auth.error_password_short' });
}

if (password !== confirm_password) {
return fail(400, { error: 'auth.error_password_mismatch' });
}

const { error } = await locals.supabase.auth.updateUser({ password });

if (error) {
return fail(500, { error: 'auth.error_save' });
}

// Clear the reset request flag
await locals.supabase
.from('profiles')
.update({ password_reset_requested: false })
.eq('id', locals.session.user.id);

throw redirect(302, '/dashboard?password_updated=1');
}
};
