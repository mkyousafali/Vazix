<script lang="ts">
	import { t, isRTL, lang, setLang } from '$lib/i18n';

	let { data } = $props<{ data: { session: unknown; profile: unknown } }>();

	const features = [
		{ key: 'feature_shop', icon: '🛍️' },
		{ key: 'feature_whatsapp', icon: '💬' },
		{ key: 'feature_pickup', icon: '📦' },
		{ key: 'feature_products', icon: '📋' },
		{ key: 'feature_qr', icon: '📲' },
		{ key: 'feature_bilingual', icon: '🌐' }
	];

	const howSteps = [
		{ key: 'how_step1', icon: '📝' },
		{ key: 'how_step2', icon: '✅' },
		{ key: 'how_step3', icon: '🛍️' },
		{ key: 'how_step4', icon: '💬' }
	];

	const faqs = ['faq_1', 'faq_2', 'faq_3', 'faq_4'];
</script>

<svelte:head>
	<title>Vazix — {$t('landing.hero_title')} {$t('landing.hero_subtitle')}</title>
	<meta name="description" content={$t('landing.hero_description')} />
</svelte:head>

<!-- Navbar -->
<nav class="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
	<div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
		<a href="/"><img src="/logo.png" alt="Vazix" class="h-9 w-auto" /></a>
		<div class="flex items-center gap-3">
			<button
				onclick={() => setLang($lang === 'ar' ? 'en' : 'ar')}
				class="text-sm font-medium text-gray-600 hover:text-indigo-600 transition border border-gray-200 px-3 py-1.5 rounded-lg"
			>
				{$lang === 'ar' ? 'EN' : 'عربي'}
			</button>
			{#if data?.session}
				<a
					href="/dashboard"
					class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
				>
					{$t('nav.dashboard')}
				</a>
			{:else}
				<a
					href="/login"
					class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
				>
					{$t('nav.login')}
				</a>
			{/if}
		</div>
	</div>
</nav>

<!-- Hero -->
<section class="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-24 px-4">
	<div class="max-w-4xl mx-auto text-center">
		<div class="inline-block bg-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
			🎉 {$t('landing.hero_badge')}
		</div>
		<h1 class="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
			{$t('landing.hero_title')}
			<span class="text-indigo-600">{$t('landing.hero_subtitle')}</span>
		</h1>
		<p class="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
			{$t('landing.hero_description')}
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a
				href="/register"
				class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition shadow-lg shadow-indigo-200"
			>
				{$t('landing.cta_register')}
			</a>
			<a
				href="/login"
				class="bg-white border border-gray-200 hover:border-indigo-300 text-gray-700 font-semibold px-8 py-4 rounded-2xl text-lg transition"
			>
				{$t('nav.login')}
			</a>
		</div>
	</div>
</section>

<!-- Features -->
<section class="py-20 px-4 bg-white">
	<div class="max-w-6xl mx-auto">
		<h2 class="text-3xl font-bold text-center text-gray-900 mb-12">{$t('landing.features_title')}</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each features as f}
				<div class="bg-slate-50 rounded-2xl p-6 hover:shadow-md transition">
					<div class="text-3xl mb-3">{f.icon}</div>
					<h3 class="font-bold text-gray-900 mb-1">{$t(`landing.${f.key}_title`)}</h3>
					<p class="text-gray-500 text-sm">{$t(`landing.${f.key}_desc`)}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- How it works -->
<section class="py-20 px-4 bg-gradient-to-br from-indigo-50 to-white">
	<div class="max-w-4xl mx-auto">
		<h2 class="text-3xl font-bold text-center text-gray-900 mb-12">{$t('landing.how_title')}</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each howSteps as step, i}
				<div class="text-center">
					<div class="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-indigo-200">
						{step.icon}
					</div>
					<div class="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1">Step {i + 1}</div>
					<h3 class="font-bold text-gray-900 mb-1">{$t(`landing.${step.key}`)}</h3>
					<p class="text-gray-500 text-sm">{$t(`landing.${step.key}_desc`)}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- CTA Banner -->
<section class="py-16 px-4 bg-indigo-600">
	<div class="max-w-3xl mx-auto text-center">
		<h2 class="text-3xl font-bold text-white mb-3">{$t('landing.cta_banner_title')}</h2>
		<p class="text-indigo-200 mb-8">{$t('landing.cta_banner_desc')}</p>
		<a
			href="/register"
			class="inline-block bg-white hover:bg-indigo-50 text-indigo-700 font-bold px-8 py-4 rounded-2xl text-lg transition shadow-lg"
		>
			{$t('landing.cta_register')}
		</a>
	</div>
</section>

<!-- FAQ -->
<section class="py-20 px-4 bg-slate-50">
	<div class="max-w-2xl mx-auto">
		<h2 class="text-3xl font-bold text-center text-gray-900 mb-10">{$t('landing.faq_title')}</h2>
		<div class="space-y-4">
			{#each faqs as faq}
				<details class="bg-white rounded-2xl p-5 shadow-sm group">
					<summary class="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
						{$t(`landing.${faq}_q`)}
						<span class="text-indigo-400 text-xl group-open:rotate-45 transition-transform">+</span>
					</summary>
					<p class="text-gray-500 text-sm mt-3">{$t(`landing.${faq}_a`)}</p>
				</details>
			{/each}
		</div>
	</div>
</section>

<!-- Footer -->
<footer class="bg-gray-900 text-gray-400 py-10 px-4 text-center">
	<div class="mb-2"><img src="/logo.png" alt="Vazix" class="h-10 w-auto mx-auto brightness-0 invert" /></div>
	<p class="text-sm mb-1">{$t('landing.footer_tagline')}</p>
	<p class="text-xs mt-4">© {new Date().getFullYear()} Vazix. {$t('landing.footer_rights')}</p>
</footer>

