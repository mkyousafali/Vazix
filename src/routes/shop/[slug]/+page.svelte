<script lang="ts">
	import { t, lang, setLang } from '$lib/i18n';
	import { onMount } from 'svelte';

	let { data } = $props<{
		data: {
			shop: Record<string, unknown> | null;
			products: Array<Record<string, unknown>>;
			inactive: boolean;
			shopName: string;
		};
	}>();

	type CartItem = { id: string; name: string; price: number; qty: number; image_url?: string };

	let cart = $state<CartItem[]>([]);
	let selectedCategory = $state('all');
	let mounted = $state(false);

	const cartKey = $derived(`vazix_cart_${data.shop?.slug ?? 'unknown'}`);

	const categories = $derived(() => {
		const cats = new Set<string>();
		data.products.forEach((p) => { if (p.category) cats.add(p.category as string); });
		return Array.from(cats);
	});

	const filteredProducts = $derived(() => {
		if (selectedCategory === 'all') return data.products;
		return data.products.filter((p) => p.category === selectedCategory);
	});

	const cartCount = $derived(cart.reduce((s, i) => s + i.qty, 0));
	const cartSubtotal = $derived(cart.reduce((s, i) => s + i.price * i.qty, 0));

	onMount(() => {
		mounted = true;
		const stored = localStorage.getItem(cartKey);
		if (stored) {
			try { cart = JSON.parse(stored); } catch {}
		}
	});

	function saveCart() {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(cartKey, JSON.stringify(cart));
		}
	}

	function addToCart(product: Record<string, unknown>) {
		const existing = cart.find((i) => i.id === product.id);
		if (existing) {
			cart = cart.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
		} else {
			cart = [...cart, {
				id: product.id as string,
				name: product.name as string,
				price: product.price as number,
				qty: 1,
				image_url: product.image_url as string | undefined
			}];
		}
		saveCart();
	}

	function getQty(id: string) {
		return cart.find((i) => i.id === id)?.qty ?? 0;
	}
</script>

<svelte:head>
	<title>{data.shopName} — Vazix</title>
</svelte:head>

<!-- Navbar -->
<nav class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center justify-between">
	<div class="flex items-center gap-2">
		{#if data.shop?.logo_url}
			<img src={data.shop.logo_url as string} alt={data.shopName} class="w-8 h-8 rounded-lg object-cover" />
		{/if}
		<span class="font-bold text-gray-900">{data.shopName}</span>
	</div>
	<div class="flex items-center gap-2">
		<button
			onclick={() => setLang($lang === 'ar' ? 'en' : 'ar')}
			class="text-xs border border-gray-200 px-2 py-1 rounded-lg text-gray-500 hover:bg-gray-50"
		>
			{$lang === 'ar' ? 'EN' : 'عربي'}
		</button>
		{#if cartCount > 0}
			<a href="/shop/{data.shop?.slug}/cart"
				class="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1">
				🛒 {$t('shop_page.view_cart', { count: cartCount })}
			</a>
		{/if}
	</div>
</nav>

{#if data.inactive}
	<div class="min-h-[60vh] flex items-center justify-center px-4">
		<div class="text-center">
			<div class="text-5xl mb-4">🔒</div>
			<p class="text-xl font-semibold text-gray-700">{$t('shop_page.inactive')}</p>
		</div>
	</div>
{:else if data.shop}
	<!-- Shop header -->
	<div class="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-8">
		<div class="max-w-4xl mx-auto flex items-center gap-4">
			{#if data.shop.logo_url}
				<img src={data.shop.logo_url as string} alt={data.shopName} class="w-20 h-20 rounded-2xl object-cover shadow" />
			{/if}
			<div>
				<h1 class="text-2xl font-bold text-gray-900">{data.shop.name}</h1>
				{#if data.shop.city}<p class="text-gray-500 text-sm">📍 {data.shop.city}</p>{/if}
				{#if data.shop.description}<p class="text-gray-600 text-sm mt-1">{data.shop.description}</p>{/if}
				<div class="flex gap-2 mt-2">
					{#if data.shop.pickup_enabled}
						<span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{$t('cart.pickup')} ✓</span>
					{/if}
					{#if data.shop.delivery_enabled}
						<span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{$t('cart.delivery')} ✓</span>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-4xl mx-auto px-4 py-6 pb-28">
		<!-- Category filter -->
		{#if categories().length > 0}
			<div class="flex gap-2 mb-6 overflow-x-auto pb-1">
				<button
					onclick={() => selectedCategory = 'all'}
					class="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition
					{selectedCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
				>
					{$t('shop_page.all_categories')}
				</button>
				{#each categories() as cat}
					<button
						onclick={() => selectedCategory = cat}
						class="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition
						{selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
					>
						{cat}
					</button>
				{/each}
			</div>
		{/if}

		<!-- Products -->
		{#if filteredProducts().length === 0}
			<div class="text-center py-16 text-gray-400">{$t('shop_page.no_products')}</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each filteredProducts() as product}
					<div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
						{#if product.image_url}
							<img src={product.image_url as string} alt={product.name as string} class="w-full h-44 object-cover" />
						{:else}
							<div class="w-full h-44 bg-gray-50 flex items-center justify-center text-4xl">🛒</div>
						{/if}
						<div class="p-4">
							<h3 class="font-semibold text-gray-900">{product.name}</h3>
							{#if product.description}
								<p class="text-gray-500 text-xs mt-0.5 line-clamp-2">{product.description}</p>
							{/if}
							<div class="flex items-center justify-between mt-3">
								<span class="font-bold text-indigo-600">{product.price} {$t('common.sar')}</span>
								<button
									onclick={() => addToCart(product)}
									class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition"
								>
									{#if getQty(product.id as string) > 0}
										{$t('shop_page.added')} ({getQty(product.id as string)})
									{:else}
										{$t('shop_page.add_to_cart')}
									{/if}
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Sticky cart bar -->
	{#if mounted && cartCount > 0}
		<div class="fixed bottom-0 inset-x-0 z-50 p-4">
			<a
				href="/shop/{data.shop.slug}/cart"
				class="flex items-center justify-between bg-indigo-600 text-white px-5 py-4 rounded-2xl shadow-xl max-w-lg mx-auto"
			>
				<div class="flex items-center gap-2">
					<span class="bg-white text-indigo-600 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
						{cartCount}
					</span>
					<span class="font-semibold">{$t('shop_page.view_cart', { count: cartCount })}</span>
				</div>
				<span class="font-bold">{cartSubtotal.toFixed(2)} {$t('common.sar')}</span>
			</a>
		</div>
	{/if}
{/if}
