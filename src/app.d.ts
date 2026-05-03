import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>;
			session: Session | null;
			profile: Profile | null;
		}
		interface PageData {
			session: Session | null;
			profile: Profile | null;
		}
	}
}

export {};
