<script lang="ts">
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n';

	let { form } = $props<{ form: { error?: string } | null }>();
	let loading = $state(false);
	let slugValue = $state('');

	function autoSlug(name: string) {
		return name
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '')
			.slice(0, 40);
	}
</script>

<svelte:head>
	<title>Vazix — {$t('shop_form.create_title')}</title>
</svelte:head>

<div class="max-w-2xl space-y-6">
	<div class="flex items-center gap-3">
		<a href="/dashboard/shops" class="text-gray-400 hover:text-gray-600">←</a>
		<h1 class="text-2xl font-bold text-gray-900">{$t('shop_form.create_title')}</h1>
	</div>

	<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
		<form
			method="POST"
			enctype="multipart/form-data"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
			class="space-y-5"
		>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 mb-1">{$t('shop_form.name_label')} *</label>
					<input
						id="name"
						name="name"
						type="text"
						placeholder={$t('shop_form.name_placeholder')}
						oninput={(e) => { slugValue = autoSlug((e.target as HTMLInputElement).value); }}
						class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
						required
					/>
				</div>
				<div>
					<label for="slug" class="block text-sm font-medium text-gray-700 mb-1">{$t('shop_form.slug_label')} *</label>
					<input
						id="slug"
						name="slug"
						type="text"
						bind:value={slugValue}
						placeholder={$t('shop_form.slug_placeholder')}
						class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
						dir="ltr"
						required
					/>
					<p class="text-xs text-gray-400 mt-1">{$t('shop_form.slug_hint', { slug: slugValue || '...' })}</p>
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<div>
					<label for="whatsapp_number" class="block text-sm font-medium text-gray-700 mb-1">{$t('shop_form.whatsapp_label')} *</label>
					<input
						id="whatsapp_number"
						name="whatsapp_number"
						type="tel"
						placeholder={$t('shop_form.whatsapp_placeholder')}
						class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
						dir="ltr"
						required
					/>
				</div>
				<div>
					<label for="city" class="block text-sm font-medium text-gray-700 mb-1">{$t('shop_form.city_label')}</label>
					<input
						id="city"
						name="city"
						type="text"
						placeholder={$t('shop_form.city_placeholder')}
						class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
					/>
				</div>
			</div>

			<div>
				<label for="description" class="block text-sm font-medium text-gray-700 mb-1">{$t('shop_form.description_label')}</label>
				<textarea
					id="description"
					name="description"
					rows="3"
					placeholder={$t('shop_form.description_placeholder')}
					class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
				></textarea>
			</div>

			<div>
				<label for="logo" class="block text-sm font-medium text-gray-700 mb-1">{$t('shop_form.logo_label')}</label>
				<input
					id="logo"
					name="logo"
					type="file"
					accept="image/jpeg,image/png,image/webp"
					class="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
				/>
				<p class="text-xs text-gray-400 mt-1">{$t('shop_form.logo_hint')}</p>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<label class="flex items-center gap-3 cursor-pointer">
					<input name="pickup_enabled" type="checkbox" checked class="w-4 h-4 text-indigo-600 rounded" />
					<span class="text-sm font-medium text-gray-700">{$t('shop_form.pickup_label')}</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer">
					<input name="delivery_enabled" type="checkbox" class="w-4 h-4 text-indigo-600 rounded" />
					<span class="text-sm font-medium text-gray-700">{$t('shop_form.delivery_label')}</span>
				</label>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<div>
					<label for="delivery_fee" class="block text-sm font-medium text-gray-700 mb-1">{$t('shop_form.delivery_fee_label')}</label>
					<input id="delivery_fee" name="delivery_fee" type="number" min="0" step="0.01" value="0"
						class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
				</div>
				<div>
					<label for="minimum_delivery_order" class="block text-sm font-medium text-gray-700 mb-1">{$t('shop_form.min_order_label')}</label>
					<input id="minimum_delivery_order" name="minimum_delivery_order" type="number" min="0" step="0.01" value="0"
						class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
				</div>
			</div>

			{#if form?.error}
				<p class="text-red-500 text-sm">{$t(`shop_form.${form.error}`)}</p>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
			>
				{loading ? $t('shop_form.creating') : $t('shop_form.create_button')}
			</button>
		</form>
	</div>
</div>
