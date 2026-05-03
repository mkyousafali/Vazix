<script lang="ts">
import { t, isRTL } from '$lib/i18n';
import { enhance } from '$app/forms';

let { form } = $props();

let loading = $state(false);
</script>

<svelte:head>
<title>Vazix — {$t('auth.login_title')}</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4">
<div class="w-full max-w-md">
<div class="text-center mb-8">
<a href="/" class="inline-block">
<img src="/logo.png" alt="Vazix" class="h-12 w-auto mx-auto" />
</a>
</div>

<div class="bg-white rounded-2xl shadow-lg p-8">
<h1 class="text-2xl font-bold text-gray-900 mb-1">{$t('auth.login_title')}</h1>
<p class="text-gray-500 text-sm mb-6">{$t('auth.login_subtitle')}</p>

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
{loading ? $t('common.loading') : $t('auth.sign_in')}
</button>
</form>

<div class="mt-6 flex items-center justify-between text-sm">
<a href="/register" class="text-indigo-600 hover:underline">{$t('auth.no_account')}</a>
<a href="/forgot-password" class="text-gray-400 hover:underline">{$t('auth.forgot_password')}</a>
</div>
</div>
</div>
</div>
