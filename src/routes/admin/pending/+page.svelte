<script lang="ts">
import { t } from '$lib/i18n';
import { enhance } from '$app/forms';

let { data } = $props();
</script>

<svelte:head><title>Vazix Admin — Pending Registrations</title></svelte:head>

<div class="p-6 max-w-4xl mx-auto">
<h1 class="text-2xl font-bold text-gray-900 mb-2">{$t('admin.pending_title')}</h1>
<p class="text-gray-500 text-sm mb-6">{$t('admin.pending_desc')}</p>

{#if data.users.length === 0}
<div class="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
{$t('admin.no_pending')}
</div>
{:else}
<div class="space-y-3">
{#each data.users as user}
<div class="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4">
<div>
<p class="font-semibold text-gray-900">{user.full_name ?? '—'}</p>
<p class="text-sm text-gray-500">{user.email}</p>
{#if user.whatsapp_number}
<p class="text-sm text-gray-400">WhatsApp: {user.whatsapp_number}</p>
{/if}
<p class="text-xs text-gray-300 mt-1">{new Date(user.created_at).toLocaleDateString()}</p>
</div>
<div class="flex gap-2 shrink-0">
<form method="post" action="?/approve" use:enhance>
<input type="hidden" name="user_id" value={user.id} />
<button type="submit" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition">
{$t('admin.approve')}
</button>
</form>
<form method="post" action="?/reject" use:enhance>
<input type="hidden" name="user_id" value={user.id} />
<button type="submit" class="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-xl transition">
{$t('admin.reject')}
</button>
</form>
</div>
</div>
{/each}
</div>
{/if}
</div>
