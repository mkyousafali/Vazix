import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Redirect /dashboard/shops/[id] -> /dashboard/shops/[id]/edit
export const load: PageServerLoad = async ({ params }) => {
	throw redirect(302, `/dashboard/shops/${params.id}/edit`);
};
