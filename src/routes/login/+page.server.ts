import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
if (locals.session) {
throw redirect(302, '/dashboard');
}
};

export const actions: Actions = {
default: async ({ request, locals }) => {
const form = await request.formData();
const email = (form.get('email') as string)?.trim().toLowerCase();
const password = form.get('password') as string;

if (!email || !password) {
return fail(400, { error: 'auth.error_required' });
}

const { data, error } = await locals.supabase.auth.signInWithPassword({ email, password });

if (error) {
return fail(401, { error: 'auth.error_invalid_credentials' });
}

// Check profile status
const { data: profile } = await locals.supabase
.from('profiles')
.select('status, role, full_name, whatsapp_number, city')
.eq('id', data.user.id)
.single();

if (profile?.status === 'suspended') {
await locals.supabase.auth.signOut();
return fail(403, { error: 'auth.error_suspended' });
}

// Admins go to admin panel
if (profile?.role === 'super_admin' || profile?.role === 'admin') {
throw redirect(302, '/admin');
}

// Check if profile is complete
if (!profile?.full_name || !profile?.whatsapp_number || !profile?.city) {
throw redirect(302, '/onboarding');
}

throw redirect(302, '/dashboard');
}
};
