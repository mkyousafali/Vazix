<script lang="ts">
	import { t } from '$lib/i18n';

	let { data } = $props<{
		data: {
			shop: {
				id: string;
				name: string;
				subscription_status: string;
				subscription_expires_at: string;
			};
			logs: Array<Record<string, unknown>>;
		};
	}>();

	function daysLeft(expiry: string) {
		const diff = new Date(expiry).getTime() - Date.now();
		return Math.max(0, Math.ceil(diff / 86400000));
	}

	function statusColor(s: string) {
		const m: Record<string, string> = {
			trial: 'bg-blue-100 text-blue-700',
			active: 'bg-green-100 text-green-700',
			expired: 'bg-red-100 text-red-700',
			paused: 'bg-yellow-100 text-yellow-700'
		};
		return m[s] ?? 'bg-gray-100 text-gray-600';
	}
</script>

<svelte:head>
	<title>Vazix — {$t('dashboard.subscription')}</title>
</svelte:head>

<div class="max-w-2xl space-y-6">
	<div class="flex items-center gap-3">
		<a href="/dashboard/shops/{data.shop.id}/edit" class="text-gray-400 hover:text-gray-600">←</a>
		<h1 class="text-2xl font-bold text-gray-900">{$t('dashboard.subscription')}</h1>
	</div>

	<div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
		<div class="flex items-center gap-3">
			<span class="text-lg font-semibold text-gray-900">{data.shop.name}</span>
			<span class="text-sm px-2 py-0.5 rounded-full font-medium {statusColor(data.shop.subscription_status)}">
				{$t(`subscription.${data.shop.subscription_status}`)}
			</span>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<div class="text-xs text-gray-400">{$t('subscription.expires')}</div>
				<div class="font-semibold text-gray-900">
					{new Date(data.shop.subscription_expires_at).toLocaleDateString()}
				</div>
			</div>
			<div>
				<div class="text-xs text-gray-400">{$t('subscription.days_left', { days: 0 })}</div>
				<div class="font-semibold text-gray-900">
					{$t('subscription.days_left', { days: daysLeft(data.shop.subscription_expires_at) })}
				</div>
			</div>
		</div>

		<div class="bg-indigo-50 rounded-xl p-4">
			<h3 class="font-semibold text-indigo-900 mb-1">{$t('subscription.renew_title')}</h3>
			<p class="text-indigo-700 text-sm mb-3">{$t('subscription.renew_desc')}</p>
			<div class="space-y-1 text-sm text-indigo-800">
				<div>📅 {$t('subscription.monthly')}</div>
				<div>📅 {$t('subscription.yearly')}</div>
			</div>
		</div>
	</div>

	{#if data.logs.length > 0}
		<div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
			<h2 class="font-semibold text-gray-900 mb-4">{$t('admin.logs')}</h2>
			<div class="space-y-2">
				{#each data.logs as log}
					<div class="text-sm flex items-center justify-between p-2 bg-gray-50 rounded-lg">
						<span class="font-medium text-gray-700">{log.action}</span>
						<span class="text-gray-400">{new Date(log.created_at as string).toLocaleDateString()}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
