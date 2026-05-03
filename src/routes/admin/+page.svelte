<script lang="ts">
	import { t } from '$lib/i18n';
	let { data } = $props<{ data: { stats: Record<string, number> } }>();

	const cards = [
		{ key: 'total_shops', icon: '🏪', color: 'indigo' },
		{ key: 'trial_shops', icon: '🧪', color: 'yellow' },
		{ key: 'active_shops', icon: '✅', color: 'green' },
		{ key: 'expired_shops', icon: '❌', color: 'red' },
		{ key: 'paused_shops', icon: '⏸️', color: 'gray' },
		{ key: 'total_orders', icon: '📋', color: 'purple' }
	] as const;

	const colorMap: Record<string, string> = {
		indigo: 'bg-indigo-50 text-indigo-700',
		yellow: 'bg-yellow-50 text-yellow-700',
		green: 'bg-green-50 text-green-700',
		red: 'bg-red-50 text-red-700',
		gray: 'bg-gray-100 text-gray-600',
		purple: 'bg-purple-50 text-purple-700'
	};
</script>

<div class="p-6 max-w-5xl mx-auto">
	<h1 class="text-2xl font-bold text-gray-900 mb-6">{$t('admin.title')}</h1>

	<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
		{#each cards as card}
			<div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
				<div class="flex items-center gap-3">
					<div class="text-2xl">{card.icon}</div>
					<div>
						<div class="text-2xl font-bold text-gray-900">{data.stats[card.key] ?? 0}</div>
						<div class="text-xs text-gray-500">{$t(`admin.${card.key}`)}</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
