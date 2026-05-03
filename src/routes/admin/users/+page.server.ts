import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: users } = await locals.supabase
		.from('profiles')
		.select('id, full_name, whatsapp_number, city, role, is_complete, created_at')
		.order('created_at', { ascending: false });

	return { users: users ?? [] };
};
