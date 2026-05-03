<script lang="ts">
	import { enhance } from '$app/forms';
	import { t, isRTL } from '$lib/i18n';

	let { form, data } = $props<{
		form: { error?: string } | null;
		data: { profile: { full_name?: string; whatsapp_number?: string; city?: string } | null };
	}>();

	let loading = $state(false);
</script>

<svelte:head>
	<title>Vazix — {$t('onboarding.title')}</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<img src="/logo.png" alt="Vazix" class="h-12 w-auto mx-auto" />
		</div>

		<div class="bg-white rounded-2xl shadow-lg p-8">
			<h1 class="text-2xl font-bold text-gray-900 mb-1">{$t('onboarding.title')}</h1>
			<p class="text-gray-500 text-sm mb-6">{$t('onboarding.subtitle')}</p>

			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
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
						value={data.profile?.full_name ?? ''}
						placeholder={$t('onboarding.full_name_placeholder')}
						class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
						value={data.profile?.whatsapp_number ?? ''}
						placeholder={$t('onboarding.whatsapp_placeholder')}
						class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
						dir="ltr"
						required
					/>
				</div>

				<div>
					<label for="city" class="block text-sm font-medium text-gray-700 mb-1">
						{$t('onboarding.city_label')}
					</label>
					<input
						id="city"
						name="city"
						type="text"
						value={data.profile?.city ?? ''}
						placeholder={$t('onboarding.city_placeholder')}
						class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
						required
					/>
				</div>

				{#if form?.error}
					<p class="text-red-500 text-sm">{$t(`onboarding.${form.error}`)}</p>
				{/if}

				<button
					type="submit"
					disabled={loading}
					class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
				>
					{loading ? $t('onboarding.saving') : $t('onboarding.save_button')}
				</button>
			</form>
		</div>
	</div>
</div>
