import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
const code = url.searchParams.get('code');
const type = url.searchParams.get('type');

if (code) {
await locals.supabase.auth.exchangeCodeForSession(code);
}

// Password recovery — redirect to set new password
if (type === 'recovery') {
throw redirect(302, '/auth/reset-password');
}

const {
data: { session }
} = await locals.supabase.auth.getSession();

if (!session) {
throw redirect(302, '/login');
}

// Check profile status and completeness
const { data: profile } = await locals.supabase
.from('profiles')
.select('status, role, full_name, whatsapp_number, city')
.eq('id', session.user.id)
.single();

if (profile?.status === 'pending') {
await locals.supabase.auth.signOut();
throw redirect(302, '/login?pending=1');
}

if (profile?.role === 'super_admin' || profile?.role === 'admin') {
throw redirect(302, '/admin');
}

if (!profile?.full_name || !profile?.whatsapp_number || !profile?.city) {
throw redirect(302, '/onboarding');
}

throw redirect(302, '/dashboard');
};
