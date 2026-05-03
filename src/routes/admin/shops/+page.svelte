<script lang="ts">
	import { t } from '$lib/i18n';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	let { data, form } = $props<{
		data: {
			shops: Array<Record<string, unknown>>;
			search: string;
			statusFilter: string;
		};
		form: { success?: boolean; error?: string } | null;
	}>();

	let search = $state(data.search);

	function statusBadge(status: string) {
		const map: Record<string, string> = {
			trial: 'bg-yellow-100 text-yellow-700',
			active: 'bg-green-100 text-green-700',
			expired: 'bg-red-100 text-red-700',
			paused: 'bg-gray-100 text-gray-600'
		};
		return map[status] ?? 'bg-gray-100 text-gray-600';
	}

	function daysLeft(expiresAt: string | null) {
		if (!expiresAt) return 0;
		return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);
	}
</script>

<div class="p-6">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold text-gray-900">{$t('admin.shops')}</h1>
	</div>

	<!-- Filters -->
	<form method="get" class="flex flex-wrap gap-3 mb-6">
		<input
			bind:value={search}
			name="search"
			type="search"
			placeholder={$t('admin.search_shops')}
			class="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-60"
		/>
		<select
			name="status"
			value={data.statusFilter}
			class="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
		>
			<option value="">{$t('admin.all_statuses')}</option>
			<option value="trial">{$t('admin.trial_shops')}</option>
			<option value="active">{$t('admin.active_shops')}</option>
			<option value="expired">{$t('admin.expired_shops')}</option>
			<option value="paused">{$t('admin.paused_shops')}</option>
		</select>
		<button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
			{$t('common.search')}
		</button>
	</form>

	{#if form?.success}
		<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-4">
			{$t('common.saved')}
		</div>
	{/if}
	{#if form?.error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
			{form.error}
		</div>
	{/if}

	<!-- Table -->
	<div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
		<table class="w-full text-sm">
			<thead class="bg-gray-50 border-b border-gray-100">
				<tr>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">{$t('shop_form.shop_name')}</th>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">{$t('admin.subscriptions')}</th>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">Expiry</th>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">Days</th>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-50">
				{#each data.shops as shop}
					<tr class="hover:bg-gray-50/50">
						<td class="px-4 py-3">
							<div class="font-medium text-gray-900">{shop.name}</div>
							<div class="text-xs text-gray-400">{shop.slug}</div>
							{#if shop.city}<div class="text-xs text-gray-400">📍 {shop.city}</div>{/if}
						</td>
						<td class="px-4 py-3">
							<span class="px-2 py-0.5 rounded-full text-xs font-medium {statusBadge(shop.subscription_status as string)}">
								{shop.subscription_status}
							</span>
						</td>
						<td class="px-4 py-3 text-gray-500 text-xs">
							{shop.subscription_expires_at ? new Date(shop.subscription_expires_at as string).toLocaleDateString() : '—'}
						</td>
						<td class="px-4 py-3">
							<span class="text-xs {daysLeft(shop.subscription_expires_at as string) > 0 ? 'text-green-600' : 'text-red-500'}">
								{daysLeft(shop.subscription_expires_at as string)}d
							</span>
						</td>
						<td class="px-4 py-3">
							<form method="post" action="?/updateSubscription" use:enhance class="flex flex-wrap gap-1">
								<input type="hidden" name="shop_id" value={shop.id} />
								<button name="action" value="activate_30" class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">30d</button>
								<button name="action" value="activate_year" class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">1yr</button>
								<button name="action" value="extend_7" class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">+7d</button>
								<button name="action" value="pause" class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">Pause</button>
								<button name="action" value="reactivate" class="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200">Reactivate</button>
								<button name="action" value="mark_expired" class="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Expire</button>
							</form>
						</td>
					</tr>
				{/each}
				{#if data.shops.length === 0}
					<tr>
						<td colspan="5" class="px-4 py-8 text-center text-gray-400">{$t('common.empty')}</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
