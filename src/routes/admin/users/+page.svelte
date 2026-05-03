<script lang="ts">
	import { t } from '$lib/i18n';
	let { data } = $props<{ data: { users: Array<Record<string, unknown>> } }>();
</script>

<div class="p-6">
	<h1 class="text-2xl font-bold text-gray-900 mb-6">{$t('admin.users')}</h1>

	<div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
		<table class="w-full text-sm">
			<thead class="bg-gray-50 border-b border-gray-100">
				<tr>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">Name</th>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">Phone</th>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">City</th>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">Role</th>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">Profile</th>
					<th class="text-start px-4 py-3 text-gray-500 font-medium">Joined</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-50">
				{#each data.users as user}
					<tr class="hover:bg-gray-50/50">
						<td class="px-4 py-3 font-medium text-gray-900">{user.full_name ?? '—'}</td>
						<td class="px-4 py-3 text-gray-500">{user.whatsapp_number ?? '—'}</td>
						<td class="px-4 py-3 text-gray-500">{user.city ?? '—'}</td>
						<td class="px-4 py-3">
							<span class="px-2 py-0.5 rounded-full text-xs {user.role === 'super_admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}">
								{user.role}
							</span>
						</td>
						<td class="px-4 py-3">
							{#if user.is_complete}
								<span class="text-green-600 text-xs">✓ Complete</span>
							{:else}
								<span class="text-orange-500 text-xs">⏳ Incomplete</span>
							{/if}
						</td>
						<td class="px-4 py-3 text-gray-400 text-xs">
							{user.created_at ? new Date(user.created_at as string).toLocaleDateString() : '—'}
						</td>
					</tr>
				{/each}
				{#if data.users.length === 0}
					<tr>
						<td colspan="6" class="px-4 py-8 text-center text-gray-400">{$t('common.empty')}</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
