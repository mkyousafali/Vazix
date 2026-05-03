<script lang="ts">
import { t } from '$lib/i18n';
import { enhance } from '$app/forms';

let { data, form } = $props();
let showCreate = $state(false);
let showChangePassword = $state(false);
</script>

<svelte:head><title>Vazix Admin — Admin Accounts</title></svelte:head>

<div class="p-6 max-w-4xl mx-auto space-y-8">
<!-- Change own password -->
<div class="bg-white rounded-2xl border border-gray-100 p-6">
<div class="flex items-center justify-between mb-4">
<h2 class="text-lg font-bold text-gray-900">{$t('admin.change_password_title')}</h2>
<button
onclick={() => (showChangePassword = !showChangePassword)}
class="text-sm text-indigo-600 hover:underline"
>
{showChangePassword ? $t('common.cancel') : $t('admin.change_password_title')}
</button>
</div>

{#if form?.passwordChanged}
<p class="text-green-600 text-sm">{$t('admin.password_changed')}</p>
{/if}

{#if showChangePassword}
<form method="post" action="?/change_password" use:enhance class="space-y-4 mt-4">
<div>
<label for="cp_password" class="block text-sm font-medium text-gray-700 mb-1">{$t('auth.new_password_label')}</label>
<input id="cp_password" name="password" type="password" minlength="8" required
class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" dir="ltr" />
</div>
<div>
<label for="cp_confirm" class="block text-sm font-medium text-gray-700 mb-1">{$t('auth.confirm_password_label')}</label>
<input id="cp_confirm" name="confirm_password" type="password" minlength="8" required
class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" dir="ltr" />
</div>
{#if form?.error}
<p class="text-red-500 text-sm">{$t(form.error)}</p>
{/if}
<button type="submit" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition">
{$t('admin.save_password')}
</button>
</form>
{/if}
</div>

<!-- Admin accounts list -->
<div>
<div class="flex items-center justify-between mb-4">
<h2 class="text-lg font-bold text-gray-900">{$t('admin.admins_title')}</h2>
<button
onclick={() => (showCreate = !showCreate)}
class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition"
>
{showCreate ? $t('common.cancel') : $t('admin.create_admin')}
</button>
</div>

{#if form?.success && !form?.passwordChanged}
<p class="mb-4 text-green-600 text-sm">{$t('admin.admin_created')}</p>
{/if}

{#if showCreate}
<div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-4">
<h3 class="font-semibold text-gray-900 mb-4">{$t('admin.create_admin')}</h3>
<form method="post" action="?/create" use:enhance class="space-y-4">
<div class="grid grid-cols-2 gap-4">
<div>
<label class="block text-sm font-medium text-gray-700 mb-1">{$t('onboarding.full_name_label')}</label>
<input name="full_name" type="text" required
class="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm" />
</div>
<div>
<label class="block text-sm font-medium text-gray-700 mb-1">{$t('auth.email_label')}</label>
<input name="email" type="email" required dir="ltr"
class="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm" />
</div>
</div>
<div>
<label class="block text-sm font-medium text-gray-700 mb-1">{$t('auth.password_label')}</label>
<input name="password" type="password" minlength="8" required dir="ltr"
class="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm" />
</div>
{#if form?.error}
<p class="text-red-500 text-sm">{$t(form.error)}</p>
{/if}
<button type="submit" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition">
{$t('admin.create_admin')}
</button>
</form>
</div>
{/if}

<div class="space-y-3">
{#each data.admins as admin}
<div class="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4">
<div>
<div class="flex items-center gap-2">
<p class="font-semibold text-gray-900">{admin.full_name ?? '—'}</p>
<span class="text-xs px-2 py-0.5 rounded-full {admin.role === 'super_admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}">
{admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
</span>
</div>
<p class="text-sm text-gray-500">{admin.email}</p>
</div>
{#if admin.role !== 'super_admin'}
<form method="post" action="?/revoke" use:enhance>
<input type="hidden" name="user_id" value={admin.id} />
<button type="submit"
onclick={(e) => { if (!confirm('Remove admin access?')) e.preventDefault(); }}
class="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-xl transition">
{$t('admin.revoke_admin')}
</button>
</form>
{/if}
</div>
{/each}
</div>
</div>
</div>
