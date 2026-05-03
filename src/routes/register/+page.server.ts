import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
if (locals.session) throw redirect(302, '/dashboard');
};

export const actions: Actions = {
default: async ({ request, locals }) => {
const form = await request.formData();
const full_name = (form.get('full_name') as string)?.trim();
const email = (form.get('email') as string)?.trim().toLowerCase();
const whatsapp_number = (form.get('whatsapp_number') as string)?.trim().replace(/\s+/g, '');
const password = form.get('password') as string;
const confirm_password = form.get('confirm_password') as string;

if (!full_name || !email || !whatsapp_number || !password) {
return fail(400, { error: 'auth.error_required', full_name, email, whatsapp_number });
}

if (password.length < 8) {
return fail(400, { error: 'auth.error_password_short', full_name, email, whatsapp_number });
}

if (password !== confirm_password) {
return fail(400, { error: 'auth.error_password_mismatch', full_name, email, whatsapp_number });
}

const { data, error } = await locals.supabase.auth.signUp({ email, password });

if (error) {
if (error.message.toLowerCase().includes('already')) {
return fail(400, { error: 'auth.error_email_taken', full_name, email, whatsapp_number });
}
return fail(500, { error: 'auth.error_register_failed', full_name, email, whatsapp_number });
}

if (!data.user) {
return fail(500, { error: 'auth.error_register_failed', full_name, email, whatsapp_number });
}

// Update profile with name and whatsapp (profile auto-created by DB trigger)
await locals.supabase
.from('profiles')
.update({ full_name, whatsapp_number, status: 'pending' })
.eq('id', data.user.id);

// Sign out — account needs admin approval first
await locals.supabase.auth.signOut();

return { success: true };
}
};
