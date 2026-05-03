<script lang="ts">
import { page } from '$app/stores';
import { t } from '$lib/i18n';

let { children, data } = $props();

const navItems = [
{ href: '/admin', label: 'dashboard', icon: '📊', exact: true, superOnly: false },
{ href: '/admin/pending', label: 'pending', icon: '⏳', exact: false, superOnly: false },
{ href: '/admin/reset-requests', label: 'reset_requests', icon: '🔑', exact: false, superOnly: false },
{ href: '/admin/shops', label: 'shops', icon: '🏪', exact: false, superOnly: false },
{ href: '/admin/users', label: 'users', icon: '👥', exact: false, superOnly: false },
{ href: '/admin/orders', label: 'orders', icon: '📋', exact: false, superOnly: false },
{ href: '/admin/subscription-logs', label: 'logs', icon: '📝', exact: false, superOnly: false },
{ href: '/admin/admins', label: 'admins', icon: '🛡️', exact: false, superOnly: true }
];

function isActive(href: string, exact = false) {
const path = $page.url.pathname;
return exact ? path === href : path.startsWith(href);
}
</script>

<div class="min-h-screen flex bg-gray-50">
<!-- Sidebar -->
<aside class="w-56 shrink-0 bg-white border-e border-gray-100 flex flex-col">
<div class="px-5 py-5 border-b border-gray-100">
<img src="/logo.png" alt="Vazix" class="h-8 w-auto" />
<div class="text-xs text-gray-400 mt-0.5">Admin Panel</div>
</div>
<nav class="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
{#each navItems as item}
{#if !item.superOnly || data.isSuperAdmin}
<a
href={item.href}
class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
{isActive(item.href, item.exact) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}"
>
<span>{item.icon}</span>
<span class="flex-1">{$t(`admin.${item.label}`)}</span>
{#if item.href === '/admin/pending' && data.stats.pending_registrations > 0}
<span class="text-xs bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold">
{data.stats.pending_registrations}
</span>
{/if}
{#if item.href === '/admin/reset-requests' && data.stats.reset_requests > 0}
<span class="text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold">
{data.stats.reset_requests}
</span>
{/if}
</a>
{/if}
{/each}
</nav>
<div class="px-3 py-4 border-t border-gray-100 space-y-1">
<div class="px-3 py-2 text-xs text-gray-400 truncate">{data.adminProfile?.full_name ?? ''}</div>
<form action="/auth/logout" method="post">
<button type="submit" class="w-full text-start flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50">
🚪 {$t('dashboard.logout')}
</button>
</form>
</div>
</aside>

<!-- Main -->
<div class="flex-1 overflow-auto">
{@render children()}
</div>
</div>
