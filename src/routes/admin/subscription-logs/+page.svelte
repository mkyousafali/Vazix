<script lang="ts">
	import { t } from '$lib/i18n';
	let { data } = $props<{ data: { logs: Array<Record<string, unknown>> } }>();

	function statusBadge(status: string) {
		const map: Record<string, string> = {
			trial: 'bg-yellow-100 text-yellow-700',
			active: 'bg-green-100 text-green-700',
			expired: 'bg-red-100 text-red-700',
			paused: 'bg-gray-100 text-gray-600'
		};
		return map[status] ?? 'bg-gray-100 text-gray-600';
	}
</script>

<div class="p-6">
	<h1 class="text-2xl font-bold text-gray-900 mb-6">{$t('admin.logs')}</h1>

	<div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
		<table class="w-full text-sm">
			<thead class="bg-gray-50 border-b border-gray-100">
				<tr>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">Shop</th>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">Action</th>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">Status Change</th>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">New Expiry</th>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">Notes</th>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">Date</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-50">
				{#each data.logs as log}
					{@const shop = log.shops as Record<string, unknown> | null}
					<tr class="hover:bg-gray-50/50">
						<td class="px-4 py-3">
							<div class="font-medium text-gray-900">{shop?.name ?? '—'}</div>
							<div class="text-xs text-gray-400">{shop?.slug ?? ''}</div>
						</td>
						<td class="px-4 py-3">
							<span class="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg font-mono">{log.action}</span>
						</td>
						<td class="px-4 py-3 flex items-center gap-1">
							<span class="text-xs px-2 py-0.5 rounded-full {statusBadge(log.old_status as string)}">{log.old_status}</span>
							<span class="text-gray-400">→</span>
							<span class="text-xs px-2 py-0.5 rounded-full {statusBadge(log.new_status as string)}">{log.new_status}</span>
						</td>
						<td class="px-4 py-3 text-gray-500 text-xs">
							{log.new_expires_at ? new Date(log.new_expires_at as string).toLocaleDateString() : '—'}
						</td>
						<td class="px-4 py-3 text-gray-400 text-xs">{log.notes ?? '—'}</td>
						<td class="px-4 py-3 text-gray-400 text-xs">
							{log.created_at ? new Date(log.created_at as string).toLocaleDateString() : '—'}
						</td>
					</tr>
				{/each}
				{#if data.logs.length === 0}
					<tr>
						<td colspan="6" class="px-4 py-8 text-center text-gray-400">{$t('common.empty')}</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
