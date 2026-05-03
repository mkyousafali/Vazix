<script lang="ts">
	import { t } from '$lib/i18n';

	let { data } = $props<{
		data: {
			shops: Array<{
				id: string;
				name: string;
				slug: string;
				subscription_status: string;
				subscription_expires_at: string;
				is_active: boolean;
			}>;
			totalProducts: number;
			recentOrders: Array<{
				id: string;
				customer_name: string;
				total: number;
				fulfillment_type: string;
				created_at: string;
			}>;
			profile: { full_name?: string };
		};
	}>();

	const activeShops = $derived(
		data.shops.filter(
			(s) =>
				s.is_active &&
				(s.subscription_status === 'trial' || s.subscription_status === 'active') &&
				new Date(s.subscription_expires_at) > new Date()
		).length
	);

	function statusBadge(status: string) {
		const map: Record<string, string> = {
			trial: 'bg-blue-100 text-blue-700',
			active: 'bg-green-100 text-green-700',
			expired: 'bg-red-100 text-red-700',
			paused: 'bg-yellow-100 text-yellow-700'
		};
		return map[status] ?? 'bg-gray-100 text-gray-600';
	}

	function statusLabel(status: string) {
		const map: Record<string, string> = {
			trial: $t('dashboard.shop_trial'),
			active: $t('dashboard.shop_active'),
			expired: $t('dashboard.shop_expired'),
			paused: $t('dashboard.shop_paused')
		};
		return map[status] ?? status;
	}

	function daysLeft(expiry: string) {
		const diff = new Date(expiry).getTime() - Date.now();
		return Math.max(0, Math.ceil(diff / 86400000));
	}
</script>

<svelte:head>
	<title>Vazix — {$t('dashboard.overview')}</title>
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div>
		<h1 class="text-2xl font-bold text-gray-900">{$t('dashboard.overview')}</h1>
		<p class="text-gray-500 text-sm mt-1">
			{data.profile?.full_name ? `👋 ${data.profile.full_name}` : ''}
		</p>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		{#each [
			{ label: $t('dashboard.total_shops'), value: data.shops.length, color: 'indigo' },
			{ label: $t('dashboard.active_shops'), value: activeShops, color: 'green' },
			{ label: $t('dashboard.total_products'), value: data.totalProducts, color: 'purple' },
			{ label: $t('dashboard.recent_orders'), value: data.recentOrders.length, color: 'orange' }
		] as stat}
			<div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
				<div class="text-2xl font-bold text-gray-900">{stat.value}</div>
				<div class="text-sm text-gray-500 mt-1">{stat.label}</div>
			</div>
		{/each}
	</div>

	<!-- Shops overview -->
	<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
		<div class="flex items-center justify-between mb-4">
			<h2 class="font-bold text-gray-900">{$t('dashboard.my_shops')}</h2>
			<a
				href="/dashboard/shops/new"
				class="text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
			>
				+ {$t('dashboard.new_shop')}
			</a>
		</div>

		{#if data.shops.length === 0}
			<div class="text-center py-10">
				<div class="text-4xl mb-3">🏪</div>
				<p class="text-gray-500 mb-4">{$t('dashboard.no_shops')}</p>
				<a href="/dashboard/shops/new" class="text-indigo-600 font-semibold hover:underline">
					{$t('dashboard.create_first_shop')}
				</a>
			</div>
		{:else}
			<div class="space-y-3">
				{#each data.shops as shop}
					<div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl gap-3">
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 flex-wrap">
								<span class="font-semibold text-gray-900 truncate">{shop.name}</span>
								<span class="text-xs px-2 py-0.5 rounded-full font-medium {statusBadge(shop.subscription_status)}">
									{statusLabel(shop.subscription_status)}
								</span>
							</div>
							<div class="text-xs text-gray-400 mt-0.5">
								vazix.app/shop/{shop.slug} · {$t('dashboard.days_remaining', { days: daysLeft(shop.subscription_expires_at) })}
							</div>
						</div>
						<div class="flex items-center gap-2 shrink-0">
							<a href="/dashboard/shops/{shop.id}" class="text-sm text-indigo-600 hover:underline">
								{$t('dashboard.edit_shop')}
							</a>
							<a href="/dashboard/shops/{shop.id}/orders" class="text-sm text-gray-500 hover:underline">
								{$t('dashboard.view_orders')}
							</a>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Recent orders -->
	{#if data.recentOrders.length > 0}
		<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
			<h2 class="font-bold text-gray-900 mb-4">{$t('dashboard.recent_orders')}</h2>
			<div class="space-y-2">
				{#each data.recentOrders as order}
					<div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
						<div>
							<span class="font-medium text-gray-900">{order.customer_name}</span>
							<span class="text-gray-400 ms-2">{order.fulfillment_type}</span>
						</div>
						<span class="font-semibold text-gray-700">{order.total} {$t('common.sar')}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
