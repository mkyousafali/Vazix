import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	const body = await request.json();

	const {
		customer_name,
		customer_phone,
		fulfillment_type,
		preferred_time,
		delivery_area,
		delivery_landmark,
		delivery_map_link,
		items,
		notes
	} = body as {
		customer_name: string;
		customer_phone: string;
		fulfillment_type: 'pickup' | 'delivery';
		preferred_time?: string;
		delivery_area?: string;
		delivery_landmark?: string;
		delivery_map_link?: string;
		items: Array<{ id: string; name: string; price: number; qty: number }>;
		notes?: string;
	};

	// Server-side validation
	if (!customer_name?.trim() || !customer_phone?.trim() || !fulfillment_type || !items?.length) {
		return json({ error: 'error_required' }, { status: 400 });
	}

	const phoneRegex = /^[+]?[\d\s\-]{8,15}$/;
	if (!phoneRegex.test(customer_phone)) {
		return json({ error: 'error_phone' }, { status: 400 });
	}

	// Validate shop is available
	const { data: shop } = await locals.supabase
		.from('shops')
		.select('*')
		.eq('slug', params.slug)
		.maybeSingle();

	if (!shop) {
		return json({ error: 'shop_inactive' }, { status: 403 });
	}

	const isAvailable =
		shop.is_active &&
		(shop.subscription_status === 'trial' || shop.subscription_status === 'active') &&
		new Date(shop.subscription_expires_at) > new Date();

	if (!isAvailable) {
		return json({ error: 'shop_inactive' }, { status: 403 });
	}

	// Validate fulfillment
	if (fulfillment_type === 'pickup' && !shop.pickup_enabled) {
		return json({ error: 'no_fulfillment' }, { status: 400 });
	}
	if (fulfillment_type === 'delivery' && !shop.delivery_enabled) {
		return json({ error: 'no_fulfillment' }, { status: 400 });
	}

	// Re-calculate totals from DB to prevent tampering
	const productIds = items.map((i) => i.id);
	const { data: dbProducts } = await locals.supabase
		.from('products')
		.select('id, name, price, is_active')
		.in('id', productIds)
		.eq('shop_id', shop.id)
		.eq('is_active', true);

	if (!dbProducts || dbProducts.length === 0) {
		return json({ error: 'error_required' }, { status: 400 });
	}

	const priceMap = new Map(dbProducts.map((p) => [p.id, { name: p.name, price: p.price }]));

	const validatedItems = items
		.filter((i) => priceMap.has(i.id))
		.map((i) => {
			const db = priceMap.get(i.id)!;
			return { id: i.id, name: db.name, price: db.price, qty: i.qty };
		});

	if (validatedItems.length === 0) {
		return json({ error: 'error_required' }, { status: 400 });
	}

	const subtotal = validatedItems.reduce((s, i) => s + i.price * i.qty, 0);
	const delivery_fee = fulfillment_type === 'delivery' ? (shop.delivery_fee ?? 0) : 0;

	// Minimum delivery order check
	if (fulfillment_type === 'delivery' && subtotal < (shop.minimum_delivery_order ?? 0)) {
		return json({ error: 'min_order', min: shop.minimum_delivery_order }, { status: 400 });
	}

	const total = subtotal + delivery_fee;

	// Save order
	const { error: insertError } = await locals.supabase.from('orders').insert({
		shop_id: shop.id,
		customer_name: customer_name.trim(),
		customer_phone: customer_phone.trim(),
		fulfillment_type,
		preferred_time: preferred_time || null,
		delivery_area: delivery_area || null,
		delivery_landmark: delivery_landmark || null,
		delivery_map_link: delivery_map_link || null,
		items: validatedItems,
		subtotal: Math.round(subtotal * 100) / 100,
		delivery_fee: Math.round(delivery_fee * 100) / 100,
		total: Math.round(total * 100) / 100,
		notes: notes || null
	});

	if (insertError) {
		return json({ error: 'order_error' }, { status: 500 });
	}

	// Build WhatsApp message
	const waNumber = shop.whatsapp_number.replace(/[\s+\-]/g, '');
	const message = buildWhatsAppMessage({
		shopName: shop.name,
		customerName: customer_name.trim(),
		customerPhone: customer_phone.trim(),
		fulfillmentType: fulfillment_type,
		preferredTime: preferred_time,
		deliveryArea: delivery_area,
		deliveryLandmark: delivery_landmark,
		deliveryMapLink: delivery_map_link,
		items: validatedItems,
		subtotal,
		deliveryFee: delivery_fee,
		total,
		notes
	});

	const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

	return json({ success: true, waUrl });
};

function buildWhatsAppMessage(o: {
	shopName: string;
	customerName: string;
	customerPhone: string;
	fulfillmentType: string;
	preferredTime?: string;
	deliveryArea?: string;
	deliveryLandmark?: string;
	deliveryMapLink?: string;
	items: Array<{ name: string; price: number; qty: number }>;
	subtotal: number;
	deliveryFee: number;
	total: number;
	notes?: string;
}) {
	const lines: string[] = [];
	lines.push(`🛒 New Order from Vazix`);
	lines.push(`Shop: ${o.shopName}`);
	lines.push(`Order Type: ${o.fulfillmentType === 'delivery' ? 'Delivery 🚚' : 'Pickup 🏪'}`);
	lines.push('');
	lines.push(`👤 Customer:`);
	lines.push(`  Name: ${o.customerName}`);
	lines.push(`  Phone: ${o.customerPhone}`);

	if (o.fulfillmentType === 'delivery') {
		lines.push('');
		lines.push(`📍 Delivery:`);
		if (o.deliveryArea) lines.push(`  Area: ${o.deliveryArea}`);
		if (o.deliveryLandmark) lines.push(`  Landmark: ${o.deliveryLandmark}`);
		if (o.deliveryMapLink) lines.push(`  Map: ${o.deliveryMapLink}`);
		if (o.preferredTime) lines.push(`  Time: ${o.preferredTime}`);
	} else {
		if (o.preferredTime) {
			lines.push('');
			lines.push(`⏰ Pickup Time: ${o.preferredTime}`);
		}
	}

	lines.push('');
	lines.push('🧾 Items:');
	o.items.forEach((item) => {
		lines.push(`  ${item.qty}x ${item.name} — ${(item.qty * item.price).toFixed(2)} SAR`);
	});

	lines.push('');
	lines.push(`Subtotal: ${o.subtotal.toFixed(2)} SAR`);
	if (o.deliveryFee > 0) lines.push(`Delivery Fee: ${o.deliveryFee.toFixed(2)} SAR`);
	lines.push(`*Total: ${o.total.toFixed(2)} SAR*`);

	if (o.notes) {
		lines.push('');
		lines.push(`📝 Notes: ${o.notes}`);
	}

	lines.push('');
	lines.push('_Please share live location on WhatsApp if needed._');

	return lines.join('\n');
}
