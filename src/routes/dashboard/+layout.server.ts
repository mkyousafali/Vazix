import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.session) throw redirect(302, '/login');

	const profile = locals.profile;
	if (!profile?.full_name || !profile?.whatsapp_number || !profile?.city) {
		throw redirect(302, '/onboarding');
	}

	return { session: locals.session, profile, isPending: profile?.status === 'pending' };
};
