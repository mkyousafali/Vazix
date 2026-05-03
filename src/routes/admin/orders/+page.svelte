<script lang="ts">
	import { t } from '$lib/i18n';
	let { data } = $props<{ data: { orders: Array<Record<string, unknown>> } }>();
</script>

<div class="p-6">
	<h1 class="text-2xl font-bold text-gray-900 mb-6">{$t('admin.orders')}</h1>

	<div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
		<table class="w-full text-sm">
			<thead class="bg-gray-50 border-b border-gray-100">
				<tr>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">Shop</th>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">Customer</th>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">Type</th>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">Total</th>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">Date</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-50">
				{#each data.orders as order}
					{@const shop = order.shops as Record<string, unknown> | null}
					<tr class="hover:bg-gray-50/50">
						<td class="px-4 py-3">
							<div class="font-medium text-gray-900">{shop?.name ?? '—'}</div>
							<div class="text-xs text-gray-400">{shop?.slug ?? ''}</div>
						</td>
						<td class="px-4 py-3">
							<div class="text-gray-900">{order.customer_name}</div>
							<div class="text-xs text-gray-400">{order.customer_phone}</div>
						</td>
						<td class="px-4 py-3">
							<span class="text-xs px-2 py-0.5 rounded-full {order.fulfillment_type === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}">
								{order.fulfillment_type}
							</span>
						</td>
						<td class="px-4 py-3 font-medium text-indigo-600">{Number(order.total).toFixed(2)} SAR</td>
						<td class="px-4 py-3 text-gray-400 text-xs">
							{order.created_at ? new Date(order.created_at as string).toLocaleDateString() : '—'}
						</td>
					</tr>
				{/each}
				{#if data.orders.length === 0}
					<tr>
						<td colspan="5" class="px-4 py-8 text-center text-gray-400">{$t('common.empty')}</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
