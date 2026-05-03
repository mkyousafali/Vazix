export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string;
					full_name: string | null;
					whatsapp_number: string | null;
					city: string | null;
					role: 'super_admin' | 'admin' | 'shop_owner';
					status: 'pending' | 'active' | 'suspended';
					is_complete: boolean;
					password_reset_requested: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					full_name?: string | null;
					whatsapp_number?: string | null;
					city?: string | null;
					role?: 'super_admin' | 'admin' | 'shop_owner';
					status?: 'pending' | 'active' | 'suspended';
					is_complete?: boolean;
					password_reset_requested?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					full_name?: string | null;
					whatsapp_number?: string | null;
					city?: string | null;
					role?: 'super_admin' | 'admin' | 'shop_owner';
					status?: 'pending' | 'active' | 'suspended';
					is_complete?: boolean;
					password_reset_requested?: boolean;
					created_at?: string;
					updated_at?: string;
				};
					created_at?: string;
					updated_at?: string;
				};
			};
			shops: {
				Row: {
					id: string;
					owner_id: string;
					name: string;
					slug: string;
					city: string | null;
					description: string | null;
					whatsapp_number: string;
					logo_url: string | null;
					is_active: boolean;
					pickup_enabled: boolean;
					delivery_enabled: boolean;
					pickup_time_slots: Json;
					delivery_time_slots: Json;
					delivery_fee: number;
					minimum_delivery_order: number;
					subscription_status: 'trial' | 'active' | 'expired' | 'paused';
					subscription_started_at: string;
					subscription_expires_at: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					owner_id: string;
					name: string;
					slug: string;
					city?: string | null;
					description?: string | null;
					whatsapp_number: string;
					logo_url?: string | null;
					is_active?: boolean;
					pickup_enabled?: boolean;
					delivery_enabled?: boolean;
					pickup_time_slots?: Json;
					delivery_time_slots?: Json;
					delivery_fee?: number;
					minimum_delivery_order?: number;
					subscription_status?: 'trial' | 'active' | 'expired' | 'paused';
					subscription_started_at?: string;
					subscription_expires_at?: string;
				};
				Update: {
					id?: string;
					owner_id?: string;
					name?: string;
					slug?: string;
					city?: string | null;
					description?: string | null;
					whatsapp_number?: string;
					logo_url?: string | null;
					is_active?: boolean;
					pickup_enabled?: boolean;
					delivery_enabled?: boolean;
					pickup_time_slots?: Json;
					delivery_time_slots?: Json;
					delivery_fee?: number;
					minimum_delivery_order?: number;
					subscription_status?: 'trial' | 'active' | 'expired' | 'paused';
					subscription_started_at?: string;
					subscription_expires_at?: string;
				};
			};
			products: {
				Row: {
					id: string;
					shop_id: string;
					name: string;
					description: string | null;
					price: number;
					image_url: string | null;
					category: string | null;
					is_active: boolean;
					sort_order: number;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					shop_id: string;
					name: string;
					description?: string | null;
					price: number;
					image_url?: string | null;
					category?: string | null;
					is_active?: boolean;
					sort_order?: number;
				};
				Update: {
					id?: string;
					shop_id?: string;
					name?: string;
					description?: string | null;
					price?: number;
					image_url?: string | null;
					category?: string | null;
					is_active?: boolean;
					sort_order?: number;
				};
			};
			orders: {
				Row: {
					id: string;
					shop_id: string;
					customer_name: string;
					customer_phone: string;
					fulfillment_type: 'pickup' | 'delivery';
					preferred_time: string | null;
					delivery_area: string | null;
					delivery_landmark: string | null;
					delivery_map_link: string | null;
					items: Json;
					subtotal: number;
					delivery_fee: number;
					total: number;
					notes: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					shop_id: string;
					customer_name: string;
					customer_phone: string;
					fulfillment_type: 'pickup' | 'delivery';
					preferred_time?: string | null;
					delivery_area?: string | null;
					delivery_landmark?: string | null;
					delivery_map_link?: string | null;
					items: Json;
					subtotal: number;
					delivery_fee?: number;
					total: number;
					notes?: string | null;
				};
				Update: Record<string, never>;
			};
			subscription_logs: {
				Row: {
					id: string;
					shop_id: string;
					action: string;
					old_status: string | null;
					new_status: string | null;
					old_expiry: string | null;
					new_expiry: string | null;
					admin_id: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					shop_id: string;
					action: string;
					old_status?: string | null;
					new_status?: string | null;
					old_expiry?: string | null;
					new_expiry?: string | null;
					admin_id?: string | null;
				};
				Update: Record<string, never>;
			};
		};
		Functions: {
			is_super_admin: {
				Args: Record<string, never>;
				Returns: boolean;
			};
			is_shop_available: {
				Args: { shop_id: string };
				Returns: boolean;
			};
		};
	};
}
