import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) throw redirect(302, '/login');
	return { profile: locals.profile };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.session) throw redirect(302, '/login');

		const form = await request.formData();
		const full_name = (form.get('full_name') as string)?.trim();
		const whatsapp_number = (form.get('whatsapp_number') as string)?.trim();
		const city = (form.get('city') as string)?.trim();

		if (!full_name || !whatsapp_number || !city) {
			return { error: 'error_required' };
		}

		const { error } = await locals.supabase
			.from('profiles')
			.update({ full_name, whatsapp_number, city, is_complete: true })
			.eq('id', locals.session.user.id);

		if (error) {
			return { error: 'error_save' };
		}

		throw redirect(302, '/dashboard');
	}
};
