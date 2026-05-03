<script lang="ts">
	import { t } from '$lib/i18n';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let { data } = $props<{
		data: {
			shop: {
				id: string;
				name: string;
				slug: string;
				pickup_enabled: boolean;
				delivery_enabled: boolean;
				delivery_fee: number;
				minimum_delivery_order: number;
			};
			isAvailable: boolean;
		};
	}>();

	type CartItem = { id: string; name: string; price: number; qty: number; image_url?: string };

	const cartKey = `vazix_cart_${data.shop.slug}`;
	let cart = $state<CartItem[]>([]);
	let mounted = $state(false);

	let customerName = $state('');
	let customerPhone = $state('');
	let notes = $state('');
	let fulfillmentType = $state<'pickup' | 'delivery'>(
		data.shop.pickup_enabled ? 'pickup' : 'delivery'
	);
	let preferredTime = $state('');
	let deliveryArea = $state('');
	let deliveryLandmark = $state('');
	let deliveryMapLink = $state('');

	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	const subtotal = $derived(cart.reduce((s, i) => s + i.price * i.qty, 0));
	const deliveryFee = $derived(fulfillmentType === 'delivery' ? (data.shop.delivery_fee ?? 0) : 0);
	const total = $derived(subtotal + deliveryFee);
	const belowMinOrder = $derived(
		fulfillmentType === 'delivery' && subtotal < (data.shop.minimum_delivery_order ?? 0)
	);

	onMount(() => {
		mounted = true;
		const stored = localStorage.getItem(cartKey);
		if (stored) {
			try { cart = JSON.parse(stored); } catch {}
		}
	});

	function saveCart() {
		localStorage.setItem(cartKey, JSON.stringify(cart));
	}

	function updateQty(id: string, delta: number) {
		cart = cart
			.map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i)
			.filter((i) => i.qty > 0);
		saveCart();
	}

	function removeItem(id: string) {
		cart = cart.filter((i) => i.id !== id);
		saveCart();
	}

	async function placeOrder() {
		error = '';

		if (!customerName.trim() || !customerPhone.trim()) {
			error = $t('cart.error_required');
			return;
		}

		const phoneRegex = /^[+]?[\d\s\-]{8,15}$/;
		if (!phoneRegex.test(customerPhone)) {
			error = $t('cart.error_phone');
			return;
		}

		if (belowMinOrder) {
			error = $t('cart.min_order_notice', { amount: data.shop.minimum_delivery_order });
			return;
		}

		if (cart.length === 0) return;

		loading = true;

		const res = await fetch(`/shop/${data.shop.slug}/cart`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				customer_name: customerName,
				customer_phone: customerPhone,
				fulfillment_type: fulfillmentType,
				preferred_time: preferredTime || undefined,
				delivery_area: deliveryArea || undefined,
				delivery_landmark: deliveryLandmark || undefined,
				delivery_map_link: deliveryMapLink || undefined,
				items: cart,
				notes: notes || undefined
			})
		});

		const result = await res.json();
		loading = false;

		if (!res.ok || !result.success) {
			error = $t(`cart.${result.error ?? 'order_error'}`);
			return;
		}

		// Clear cart
		localStorage.removeItem(cartKey);
		cart = [];
		success = true;

		// Open WhatsApp
		window.open(result.waUrl, '_blank');
	}
</script>

<svelte:head>
	<title>{data.shop.name} — {$t('cart.title')}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Navbar -->
	<nav class="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
		<a href="/shop/{data.shop.slug}" class="text-gray-400 hover:text-gray-600">←</a>
		<h1 class="font-bold text-gray-900">{data.shop.name} — {$t('cart.title')}</h1>
	</nav>

	<div class="max-w-lg mx-auto px-4 py-6 space-y-5">
		{#if success}
			<div class="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
				<div class="text-4xl mb-3">✅</div>
				<p class="font-semibold text-green-800">{$t('cart.order_success')}</p>
				<a href="/shop/{data.shop.slug}" class="mt-4 inline-block text-indigo-600 hover:underline text-sm">
					← {$t('common.back')}
				</a>
			</div>
		{:else if !data.isAvailable}
			<div class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
				<div class="text-4xl mb-3">🔒</div>
				<p class="text-red-700">{$t('shop_page.inactive')}</p>
			</div>
		{:else if !mounted || cart.length === 0}
			<div class="bg-white rounded-2xl border border-gray-100 p-8 text-center">
				<div class="text-4xl mb-3">🛒</div>
				<p class="text-gray-500 mb-4">{$t('cart.empty')}</p>
				<a href="/shop/{data.shop.slug}" class="text-indigo-600 hover:underline">{$t('common.back')}</a>
			</div>
		{:else}
			<!-- Cart items -->
			<div class="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
				{#each cart as item}
					<div class="flex items-center gap-3 p-4">
						{#if item.image_url}
							<img src={item.image_url} alt={item.name} class="w-12 h-12 rounded-xl object-cover shrink-0" />
						{:else}
							<div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl shrink-0">🛒</div>
						{/if}
						<div class="flex-1 min-w-0">
							<div class="font-medium text-gray-900 text-sm">{item.name}</div>
							<div class="text-indigo-600 text-sm">{item.price} {$t('common.sar')}</div>
						</div>
						<div class="flex items-center gap-2 shrink-0">
							<button onclick={() => updateQty(item.id, -1)}
								class="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">−</button>
							<span class="w-6 text-center text-sm font-medium">{item.qty}</span>
							<button onclick={() => updateQty(item.id, 1)}
								class="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">+</button>
							<button onclick={() => removeItem(item.id)} class="text-red-400 hover:text-red-600 ms-1 text-xs">✕</button>
						</div>
					</div>
				{/each}
			</div>

			<!-- Customer details -->
			<div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
				<h2 class="font-semibold text-gray-900">{$t('cart.customer_name')}</h2>
				<div>
					<label class="block text-sm text-gray-600 mb-1">{$t('cart.customer_name')} *</label>
					<input bind:value={customerName} type="text" placeholder={$t('cart.customer_name_placeholder')}
						class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
				</div>
				<div>
					<label class="block text-sm text-gray-600 mb-1">{$t('cart.customer_phone')} *</label>
					<input bind:value={customerPhone} type="tel" placeholder={$t('cart.customer_phone_placeholder')}
						class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" dir="ltr" />
				</div>
				<div>
					<label class="block text-sm text-gray-600 mb-1">{$t('cart.notes')}</label>
					<textarea bind:value={notes} rows="2" placeholder={$t('cart.notes_placeholder')}
						class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"></textarea>
				</div>
			</div>

			<!-- Fulfillment -->
			<div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
				<h2 class="font-semibold text-gray-900">{$t('cart.fulfillment')}</h2>
				<div class="flex gap-3">
					{#if data.shop.pickup_enabled}
						<button
							onclick={() => fulfillmentType = 'pickup'}
							class="flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition
							{fulfillmentType === 'pickup' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
						>
							🏪 {$t('cart.pickup')}
						</button>
					{/if}
					{#if data.shop.delivery_enabled}
						<button
							onclick={() => fulfillmentType = 'delivery'}
							class="flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition
							{fulfillmentType === 'delivery' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
						>
							🚚 {$t('cart.delivery')}
						</button>
					{/if}
					{#if !data.shop.pickup_enabled && !data.shop.delivery_enabled}
						<p class="text-sm text-red-500">{$t('cart.no_fulfillment')}</p>
					{/if}
				</div>

				{#if fulfillmentType === 'pickup'}
					<div>
						<label class="block text-sm text-gray-600 mb-1">{$t('cart.pickup_time')}</label>
						<input bind:value={preferredTime} type="text" placeholder="e.g. 2:00 PM"
							class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
					</div>
				{:else if fulfillmentType === 'delivery'}
					<div>
						<label class="block text-sm text-gray-600 mb-1">{$t('cart.delivery_area')} *</label>
						<input bind:value={deliveryArea} type="text"
							class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
					</div>
					<div>
						<label class="block text-sm text-gray-600 mb-1">{$t('cart.delivery_landmark')}</label>
						<input bind:value={deliveryLandmark} type="text"
							class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
					</div>
					<div>
						<label class="block text-sm text-gray-600 mb-1">{$t('cart.delivery_map_link')}</label>
						<input bind:value={deliveryMapLink} type="url" dir="ltr"
							class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
					</div>
					<div>
						<label class="block text-sm text-gray-600 mb-1">{$t('cart.delivery_time')}</label>
						<input bind:value={preferredTime} type="text"
							class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
					</div>
					{#if belowMinOrder}
						<p class="text-orange-600 text-sm bg-orange-50 rounded-xl px-4 py-2">
							{$t('cart.min_order_notice', { amount: data.shop.minimum_delivery_order })}
						</p>
					{/if}
				{/if}
			</div>

			<!-- Order summary -->
			<div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
				<div class="flex justify-between text-sm text-gray-600">
					<span>{$t('cart.subtotal')}</span>
					<span>{subtotal.toFixed(2)} {$t('common.sar')}</span>
				</div>
				{#if deliveryFee > 0}
					<div class="flex justify-between text-sm text-gray-600">
						<span>{$t('cart.delivery_fee')}</span>
						<span>{deliveryFee.toFixed(2)} {$t('common.sar')}</span>
					</div>
				{/if}
				<div class="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-2">
					<span>{$t('cart.total')}</span>
					<span>{total.toFixed(2)} {$t('common.sar')}</span>
				</div>
			</div>

			{#if error}
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
					{error}
				</div>
			{/if}

			<button
				onclick={placeOrder}
				disabled={loading || belowMinOrder || (!data.shop.pickup_enabled && !data.shop.delivery_enabled)}
				class="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-4 rounded-2xl text-lg transition flex items-center justify-center gap-2"
			>
				<span>💬</span>
				{loading ? $t('cart.placing') : $t('cart.place_order')}
			</button>
		{/if}
	</div>
</div>
