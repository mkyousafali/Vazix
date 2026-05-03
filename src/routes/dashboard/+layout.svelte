<script lang="ts">
	import { t, lang, setLang, isRTL } from '$lib/i18n';
	import { page } from '$app/state';

	let { children, data } = $props<{
		children: unknown;
		data: { profile: { full_name?: string; role: string; status?: string }; isPending: boolean };
	}>();

	let mobileOpen = $state(false);

	const navItems = [
		{ href: '/dashboard', label: 'dashboard.overview', icon: '🏠' },
		{ href: '/dashboard/shops', label: 'dashboard.my_shops', icon: '🏪' },
		{ href: '/dashboard/shops/new', label: 'dashboard.new_shop', icon: '➕' }
	];

	function isActive(href: string) {
		return page.url.pathname === href;
	}

	async function logout() {
		await fetch('/auth/logout', { method: 'POST' });
		window.location.href = '/login';
	}
</script>

<div class="min-h-screen bg-gray-50 flex" dir={$isRTL ? 'rtl' : 'ltr'}>
	<!-- Sidebar (desktop) -->
	<aside class="hidden lg:flex flex-col w-64 bg-white border-e border-gray-100 fixed inset-y-0 start-0 z-30">
		<div class="px-6 py-5 border-b border-gray-100">
			<a href="/"><img src="/logo.png" alt="Vazix" class="h-9 w-auto" /></a>
		</div>
		<nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
					{isActive(item.href)
						? 'bg-indigo-50 text-indigo-700'
						: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
				>
					<span>{item.icon}</span>
					{$t(item.label)}
				</a>
			{/each}
		</nav>
		<div class="px-4 py-4 border-t border-gray-100 space-y-2">
			<div class="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
				<span>👤</span>
				<span class="truncate">{data.profile?.full_name ?? ''}</span>
			</div>
			<button
				onclick={() => setLang($lang === 'ar' ? 'en' : 'ar')}
				class="w-full text-start px-3 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition"
			>
				🌐 {$lang === 'ar' ? 'English' : 'عربي'}
			</button>
			<button
				onclick={logout}
				class="w-full text-start px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition"
			>
				🚪 {$t('nav.logout')}
			</button>
		</div>
	</aside>

	<!-- Main content -->
	<div class="flex-1 lg:ms-64 flex flex-col min-h-screen">
		<!-- Topbar -->
		<header class="bg-white border-b border-gray-100 sticky top-0 z-20 px-4 py-3 flex items-center gap-3 lg:hidden">
			<button onclick={() => mobileOpen = true} class="text-gray-600 hover:text-gray-900">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
				</svg>
			</button>
			<img src="/logo.png" alt="Vazix" class="h-7 w-auto" />
		</header>

		<!-- Mobile drawer -->
		{#if mobileOpen}
			<div class="fixed inset-0 z-40 lg:hidden">
				<button class="absolute inset-0 bg-black/40" onclick={() => mobileOpen = false}></button>
				<aside class="absolute start-0 top-0 bottom-0 w-64 bg-white flex flex-col shadow-xl">
					<div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
						<img src="/logo.png" alt="Vazix" class="h-8 w-auto" />
						<button onclick={() => mobileOpen = false} class="text-gray-400 hover:text-gray-600">✕</button>
					</div>
					<nav class="flex-1 px-4 py-6 space-y-1">
						{#each navItems as item}
							<a
								href={item.href}
								onclick={() => mobileOpen = false}
								class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
								{isActive(item.href)
									? 'bg-indigo-50 text-indigo-700'
									: 'text-gray-600 hover:bg-gray-50'}"
							>
								<span>{item.icon}</span>
								{$t(item.label)}
							</a>
						{/each}
					</nav>
					<div class="px-4 py-4 border-t border-gray-100 space-y-2">
						<button
							onclick={() => { setLang($lang === 'ar' ? 'en' : 'ar'); mobileOpen = false; }}
							class="w-full text-start px-3 py-2 text-sm text-gray-500 rounded-xl hover:bg-gray-50"
						>
							🌐 {$lang === 'ar' ? 'English' : 'عربي'}
						</button>
						<button
							onclick={logout}
							class="w-full text-start px-3 py-2 text-sm text-red-500 rounded-xl hover:bg-red-50"
						>
							🚪 {$t('nav.logout')}
						</button>
					</div>
				</aside>
			</div>
		{/if}

		<main class="flex-1 p-4 lg:p-8">
			{#if data.isPending}
				<div class="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
					<span class="text-2xl">⏳</span>
					<div>
						<p class="font-semibold text-amber-800">{$t('dashboard.pending_title')}</p>
						<p class="text-amber-700 text-sm mt-0.5">{$t('dashboard.pending_desc')}</p>
					</div>
				</div>
			{/if}
			{@render children()}
		</main>
	</div>
</div>
