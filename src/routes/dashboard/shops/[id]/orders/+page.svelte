<script lang="ts">
	import { t } from '$lib/i18n';

	let { data } = $props<{
		data: {
			shop: { id: string; name: string };
			orders: Array<Record<string, unknown>>;
		};
	}>();

	let expanded = $state<string | null>(null);

	function formatDate(d: string) {
		return new Date(d).toLocaleString();
	}
</script>

<svelte:head>
	<title>Vazix — {$t('dashboard.orders')}</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<a href="/dashboard/shops/{data.shop.id}/edit" class="text-gray-400 hover:text-gray-600">←</a>
		<div>
			<h1 class="text-2xl font-bold text-gray-900">{$t('dashboard.orders')}</h1>
			<p class="text-sm text-gray-400">{data.shop.name}</p>
		</div>
	</div>

	{#if data.orders.length === 0}
		<div class="bg-white rounded-2xl border border-gray-100 p-12 text-center">
			<div class="text-4xl mb-3">📦</div>
			<p class="text-gray-500">{$t('dashboard.recent_orders')}: 0</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each data.orders as order}
				{@const oid = order.id as string}
				{@const items = order.items as Array<{ name: string; qty: number; price: number }>}
				<div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
					<button
						class="w-full text-start p-4 hover:bg-gray-50 transition"
						onclick={() => expanded = expanded === oid ? null : oid}
					>
						<div class="flex items-center justify-between gap-4 flex-wrap">
							<div>
								<span class="font-semibold text-gray-900">{order.customer_name}</span>
								<span class="ms-2 text-xs text-gray-400">{order.customer_phone}</span>
								<span class="ms-2 text-xs px-2 py-0.5 rounded-full {order.fulfillment_type === 'delivery' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">
									{$t(`cart.${order.fulfillment_type}`)}
								</span>
							</div>
							<div class="flex items-center gap-3">
								<span class="font-bold text-gray-900">{order.total} {$t('common.sar')}</span>
								<span class="text-xs text-gray-400">{formatDate(order.created_at as string)}</span>
								<span class="text-gray-400">{expanded === oid ? '▲' : '▼'}</span>
							</div>
						</div>
					</button>

					{#if expanded === oid}
						<div class="border-t border-gray-100 p-4 space-y-3 bg-gray-50 text-sm">
							<div class="grid grid-cols-2 gap-3">
								<div>
									<div class="text-gray-400 text-xs mb-0.5">{$t('cart.customer_name')}</div>
									<div class="font-medium">{order.customer_name}</div>
								</div>
								<div>
									<div class="text-gray-400 text-xs mb-0.5">{$t('cart.customer_phone')}</div>
									<div dir="ltr">{order.customer_phone}</div>
								</div>
								{#if order.fulfillment_type === 'delivery'}
									<div>
										<div class="text-gray-400 text-xs mb-0.5">{$t('cart.delivery_area')}</div>
										<div>{order.delivery_area ?? '—'}</div>
									</div>
									<div>
										<div class="text-gray-400 text-xs mb-0.5">{$t('cart.delivery_landmark')}</div>
										<div>{order.delivery_landmark ?? '—'}</div>
									</div>
									{#if order.delivery_map_link}
										<div class="col-span-2">
											<a href={order.delivery_map_link as string} target="_blank" class="text-indigo-600 hover:underline text-xs">
												📍 Maps link
											</a>
										</div>
									{/if}
								{/if}
								{#if order.preferred_time}
									<div>
										<div class="text-gray-400 text-xs mb-0.5">{$t('cart.pickup_time')}</div>
										<div>{order.preferred_time}</div>
									</div>
								{/if}
								{#if order.notes}
									<div class="col-span-2">
										<div class="text-gray-400 text-xs mb-0.5">{$t('cart.notes')}</div>
										<div>{order.notes}</div>
									</div>
								{/if}
							</div>

							<div class="border-t border-gray-100 pt-3">
								<div class="text-gray-400 text-xs mb-2">Items</div>
								{#each items as item}
									<div class="flex justify-between py-1">
										<span>{item.qty}× {item.name}</span>
										<span>{(item.qty * item.price).toFixed(2)} {$t('common.sar')}</span>
									</div>
								{/each}
								{#if (order.delivery_fee as number) > 0}
									<div class="flex justify-between py-1 text-gray-500">
										<span>{$t('cart.delivery_fee')}</span>
										<span>{order.delivery_fee} {$t('common.sar')}</span>
									</div>
								{/if}
								<div class="flex justify-between py-1 font-bold border-t border-gray-100 mt-1">
									<span>{$t('cart.total')}</span>
									<span>{order.total} {$t('common.sar')}</span>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
