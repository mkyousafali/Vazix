<script lang="ts">
import { t } from '$lib/i18n';
import { enhance } from '$app/forms';

let { form } = $props();
let loading = $state(false);
</script>

<svelte:head>
<title>Vazix — {$t('auth.forgot_password')}</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4">
<div class="w-full max-w-md">
<div class="text-center mb-8">
<a href="/" class="inline-block">
<img src="/logo.png" alt="Vazix" class="h-12 w-auto mx-auto" />
</a>
</div>

<div class="bg-white rounded-2xl shadow-lg p-8">
{#if form?.success}
<div class="text-center">
<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
</div>
<h2 class="text-xl font-bold text-gray-900 mb-2">{$t('auth.reset_request_sent_title')}</h2>
<p class="text-gray-500 text-sm">{$t('auth.reset_request_sent_desc')}</p>
<a href="/login" class="mt-6 inline-block text-indigo-600 text-sm hover:underline">
{$t('auth.back_to_login')}
</a>
</div>
{:else}
<h1 class="text-2xl font-bold text-gray-900 mb-1">{$t('auth.forgot_password')}</h1>
<p class="text-gray-500 text-sm mb-6">{$t('auth.forgot_password_desc')}</p>

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
<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
{$t('auth.email_label')}
</label>
<input
id="email"
name="email"
type="email"
placeholder={$t('auth.email_placeholder')}
class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
dir="ltr"
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
{loading ? $t('common.loading') : $t('auth.request_reset')}
</button>
</form>

<p class="mt-4 text-center text-sm">
<a href="/login" class="text-gray-400 hover:underline">{$t('auth.back_to_login')}</a>
</p>
{/if}
</div>
</div>
</div>
