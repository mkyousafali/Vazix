import { createServerSupabaseClient } from '$lib/supabase/server';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const supabase = createServerSupabaseClient(event.cookies);
	event.locals.supabase = supabase;

	// getUser() re-validates the JWT with Supabase Auth server
	// getSession() alone only reads from cookie without server validation
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (user) {
		// Reconstruct a minimal session-like object from the cookie
		const {
			data: { session }
		} = await supabase.auth.getSession();
		event.locals.session = session;

		const { data: profile } = await supabase
			.from('profiles')
			.select('id, full_name, whatsapp_number, city, role, is_complete, status, password_reset_requested')
			.eq('id', user.id)
			.single();
		event.locals.profile = profile;
	} else {
		event.locals.session = null;
		event.locals.profile = null;
	}

	return resolve(event);
};
