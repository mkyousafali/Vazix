<script lang="ts">
	import { t } from '$lib/i18n';

	let { data } = $props<{ data: { shops: Array<Record<string, unknown>> } }>();

	let copied = $state<string | null>(null);

	function copyLink(slug: string) {
		navigator.clipboard.writeText(`https://vazix.app/shop/${slug}`);
		copied = slug;
		setTimeout(() => (copied = null), 2000);
	}

	function statusBadge(status: string) {
		const map: Record<string, string> = {
			trial: 'bg-blue-100 text-blue-700',
			active: 'bg-green-100 text-green-700',
			expired: 'bg-red-100 text-red-700',
			paused: 'bg-yellow-100 text-yellow-700'
		};
		return map[status] ?? 'bg-gray-100 text-gray-600';
	}

	function daysLeft(expiry: string) {
		const diff = new Date(expiry).getTime() - Date.now();
		return Math.max(0, Math.ceil(diff / 86400000));
	}
</script>

<svelte:head>
	<title>Vazix — {$t('dashboard.my_shops')}</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900">{$t('dashboard.my_shops')}</h1>
		<a
			href="/dashboard/shops/new"
			class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
		>
			+ {$t('dashboard.new_shop')}
		</a>
	</div>

	{#if data.shops.length === 0}
		<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
			<div class="text-5xl mb-4">🏪</div>
			<p class="text-gray-500 mb-4">{$t('dashboard.no_shops')}</p>
			<a href="/dashboard/shops/new" class="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
				{$t('dashboard.create_first_shop')}
			</a>
		</div>
	{:else}
		<div class="grid gap-4">
			{#each data.shops as shop}
				{@const slug = shop.slug as string}
				{@const status = shop.subscription_status as string}
				{@const expiry = shop.subscription_expires_at as string}
				<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
					<div class="flex items-start justify-between gap-4 flex-wrap">
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 flex-wrap">
								{#if shop.logo_url}
									<img src={shop.logo_url as string} alt={shop.name as string} class="w-8 h-8 rounded-lg object-cover" />
								{/if}
								<h2 class="font-bold text-gray-900 text-lg">{shop.name}</h2>
								<span class="text-xs px-2 py-0.5 rounded-full font-medium {statusBadge(status)}">
									{$t(`dashboard.shop_${status}`)}
								</span>
							</div>
							<p class="text-sm text-gray-400 mt-1">
								vazix.app/shop/{slug}
								· {$t('dashboard.days_remaining', { days: daysLeft(expiry) })}
							</p>
							{#if shop.description}
								<p class="text-sm text-gray-500 mt-1 truncate">{shop.description}</p>
							{/if}
						</div>

						<div class="flex items-center gap-2 shrink-0 flex-wrap">
							<button
								onclick={() => copyLink(slug)}
								class="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
							>
								{copied === slug ? $t('dashboard.link_copied') : $t('dashboard.copy_link')}
							</button>
							<a href="/dashboard/shops/{shop.id}/products" class="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
								{$t('dashboard.manage_products')}
							</a>
							<a href="/dashboard/shops/{shop.id}/orders" class="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
								{$t('dashboard.view_orders')}
							</a>
							<a href="/dashboard/shops/{shop.id}/edit" class="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition">
								{$t('dashboard.edit_shop')}
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
