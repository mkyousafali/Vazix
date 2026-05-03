<script lang="ts">
import { t } from '$lib/i18n';
import { enhance } from '$app/forms';

let { form } = $props();
let loading = $state(false);
</script>

<svelte:head>
<title>Vazix — {$t('auth.register_title')}</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4 py-8">
<div class="w-full max-w-md">
<div class="text-center mb-8">
<a href="/" class="inline-block">
<img src="/logo.png" alt="Vazix" class="h-12 w-auto mx-auto" />
</a>
</div>

<div class="bg-white rounded-2xl shadow-lg p-8">
{#if form?.success}
<div class="text-center">
<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
</svg>
</div>
<h2 class="text-xl font-bold text-gray-900 mb-2">{$t('auth.register_success_title')}</h2>
<p class="text-gray-500 text-sm">{$t('auth.register_success_desc')}</p>
<a href="/login" class="mt-6 inline-block text-indigo-600 text-sm hover:underline">
{$t('auth.back_to_login')}
</a>
</div>
{:else}
<h1 class="text-2xl font-bold text-gray-900 mb-1">{$t('auth.register_title')}</h1>
<p class="text-gray-500 text-sm mb-6">{$t('auth.register_subtitle')}</p>

<form
method="post"
use:enhance={() => {
loading = true;
return async ({ update }) => {
loading = false;
await update();
};
}}
class="space-y-4"
>
<div>
<label for="full_name" class="block text-sm font-medium text-gray-700 mb-1">
{$t('onboarding.full_name_label')}
</label>
<input
id="full_name"
name="full_name"
type="text"
value={form?.full_name ?? ''}
placeholder={$t('onboarding.full_name_placeholder')}
class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
required
/>
</div>

<div>
<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
{$t('auth.email_label')}
</label>
<input
id="email"
name="email"
type="email"
value={form?.email ?? ''}
placeholder={$t('auth.email_placeholder')}
class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
dir="ltr"
required
/>
</div>

<div>
<label for="whatsapp_number" class="block text-sm font-medium text-gray-700 mb-1">
{$t('onboarding.whatsapp_label')}
</label>
<input
id="whatsapp_number"
name="whatsapp_number"
type="tel"
value={form?.whatsapp_number ?? ''}
placeholder={$t('onboarding.whatsapp_placeholder')}
class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
dir="ltr"
required
/>
</div>

<div>
<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
{$t('auth.password_label')}
</label>
<input
id="password"
name="password"
type="password"
placeholder={$t('auth.password_placeholder')}
class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
dir="ltr"
minlength="8"
required
/>
</div>

<div>
<label for="confirm_password" class="block text-sm font-medium text-gray-700 mb-1">
{$t('auth.confirm_password_label')}
</label>
<input
id="confirm_password"
name="confirm_password"
type="password"
placeholder={$t('auth.confirm_password_placeholder')}
class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
dir="ltr"
minlength="8"
required
/>
</div>

{#if form?.error}
<p class="text-red-500 text-sm">{$t(form.error)}</p>
{/if}

<button
type="submit"
disabled={loading}
class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
>
{loading ? $t('common.loading') : $t('auth.register_button')}
</button>
</form>

<p class="mt-4 text-center text-sm text-gray-400">
{$t('auth.have_account')}
<a href="/login" class="text-indigo-600 hover:underline">{$t('auth.sign_in')}</a>
</p>
{/if}
</div>
</div>
</div>
