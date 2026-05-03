<script lang="ts">
import { t } from '$lib/i18n';
import { enhance } from '$app/forms';

let { data, form } = $props();

let copiedLink = $state('');
</script>

<svelte:head><title>Vazix Admin — Password Reset Requests</title></svelte:head>

<div class="p-6 max-w-4xl mx-auto">
<h1 class="text-2xl font-bold text-gray-900 mb-2">{$t('admin.reset_requests_title')}</h1>
<p class="text-gray-500 text-sm mb-6">{$t('admin.reset_requests_desc')}</p>

{#if form?.resetLink}
<div class="mb-6 bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
<p class="font-semibold text-indigo-900 mb-2">{$t('admin.reset_link_for')} {form.email}</p>
<p class="text-xs text-indigo-600 mb-3">{$t('admin.reset_link_instructions')}</p>
<div class="flex gap-2 items-center">
<input
type="text"
readonly
value={form.resetLink}
class="flex-1 text-xs px-3 py-2 bg-white border border-indigo-200 rounded-xl font-mono overflow-hidden"
/>
<button
onclick={() => {
navigator.clipboard.writeText(form.resetLink);
copiedLink = form.resetLink;
}}
class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition shrink-0"
>
{copiedLink === form.resetLink ? '✓ Copied' : $t('admin.copy_link')}
</button>
</div>
</div>
{/if}

{#if form?.error}
<p class="mb-4 text-red-500 text-sm">{form.error}</p>
{/if}

{#if data.users.length === 0}
<div class="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
{$t('admin.no_reset_requests')}
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
</div>
<div class="flex gap-2 shrink-0">
<form method="post" action="?/generate_link" use:enhance>
<input type="hidden" name="user_id" value={user.id} />
<input type="hidden" name="email" value={user.email} />
<button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition">
{$t('admin.generate_reset_link')}
</button>
</form>
<form method="post" action="?/dismiss" use:enhance>
<input type="hidden" name="user_id" value={user.id} />
<button type="submit" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-xl transition">
{$t('admin.dismiss')}
</button>
</form>
</div>
</div>
{/each}
</div>
{/if}
</div>
