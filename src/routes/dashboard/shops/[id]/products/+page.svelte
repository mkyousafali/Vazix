<script lang="ts">
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n';

	let { data, form } = $props<{
		data: {
			shop: { id: string; name: string };
			products: Array<Record<string, unknown>>;
		};
		form: { error?: string; success?: boolean; action?: string; productId?: string } | null;
	}>();

	let showCreate = $state(false);
	let editingId = $state<string | null>(null);
	let deletingId = $state<string | null>(null);
	let loadingCreate = $state(false);
	let loadingEdit = $state(false);
	let loadingDelete = $state(false);
</script>

<svelte:head>
	<title>Vazix — {$t('dashboard.products')}</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<a href="/dashboard/shops/{data.shop.id}/edit" class="text-gray-400 hover:text-gray-600">←</a>
		<div>
			<h1 class="text-2xl font-bold text-gray-900">{$t('dashboard.products')}</h1>
			<p class="text-sm text-gray-400">{data.shop.name}</p>
		</div>
		<button
			onclick={() => { showCreate = !showCreate; editingId = null; }}
			class="ms-auto bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
		>
			+ {$t('product_form.create_title')}
		</button>
	</div>

	<!-- Create form -->
	{#if showCreate}
		<div class="bg-white rounded-2xl border border-indigo-100 shadow-sm p-5">
			<h2 class="font-semibold text-gray-900 mb-4">{$t('product_form.create_title')}</h2>
			<form
				method="POST"
				action="?/create"
				enctype="multipart/form-data"
				use:enhance={() => {
					loadingCreate = true;
					return async ({ update }) => {
						await update();
						loadingCreate = false;
						if (form?.success) showCreate = false;
					};
				}}
				class="grid grid-cols-1 sm:grid-cols-2 gap-4"
			>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">{$t('product_form.name_label')} *</label>
					<input name="name" type="text" placeholder={$t('product_form.name_placeholder')} required
						class="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">{$t('product_form.category_label')}</label>
					<input name="category" type="text" placeholder={$t('product_form.category_placeholder')}
						class="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">{$t('product_form.price_label')} *</label>
					<input name="price" type="number" min="0" step="0.01" placeholder="0.00" required
						class="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">{$t('product_form.sort_label')}</label>
					<input name="sort_order" type="number" value="0"
						class="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
				</div>
				<div class="sm:col-span-2">
					<label class="block text-sm font-medium text-gray-700 mb-1">{$t('product_form.description_label')}</label>
					<textarea name="description" rows="2" placeholder={$t('product_form.description_placeholder')}
						class="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"></textarea>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">{$t('product_form.image_label')}</label>
					<input name="image" type="file" accept="image/jpeg,image/png,image/webp"
						class="w-full text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600" />
				</div>
				<div class="flex items-center gap-2">
					<input name="is_active" type="checkbox" checked id="create_active" class="w-4 h-4 text-indigo-600 rounded" />
					<label for="create_active" class="text-sm text-gray-700">{$t('product_form.active_label')}</label>
				</div>
				{#if form?.error && form.action === 'create'}
					<div class="sm:col-span-2">
						<p class="text-red-500 text-sm">{$t(`product_form.${form.error}`)}</p>
					</div>
				{/if}
				<div class="sm:col-span-2 flex gap-3">
					<button type="submit" disabled={loadingCreate}
						class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-xl transition">
						{loadingCreate ? $t('product_form.saving') : $t('product_form.save_button')}
					</button>
					<button type="button" onclick={() => showCreate = false}
						class="text-sm text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-50 border border-gray-200 transition">
						{$t('common.cancel')}
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Products list -->
	{#if data.products.length === 0}
		<div class="bg-white rounded-2xl border border-gray-100 p-12 text-center">
			<div class="text-4xl mb-3">📋</div>
			<p class="text-gray-500">{$t('shop_page.no_products')}</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each data.products as product}
				{@const pid = product.id as string}
				<div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
					<div class="flex items-center gap-4 p-4">
						{#if product.image_url}
							<img src={product.image_url as string} alt={product.name as string} class="w-14 h-14 rounded-xl object-cover shrink-0" />
						{:else}
							<div class="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shrink-0">🛒</div>
						{/if}
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 flex-wrap">
								<span class="font-semibold text-gray-900">{product.name}</span>
								{#if !product.is_active}
									<span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactive</span>
								{:else}
									<span class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
								{/if}
								{#if product.category}
									<span class="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">{product.category}</span>
								{/if}
							</div>
							<div class="text-sm text-gray-500 mt-0.5">{product.price} {$t('common.sar')}</div>
						</div>
						<div class="flex items-center gap-2 shrink-0">
							<button onclick={() => { editingId = editingId === pid ? null : pid; showCreate = false; }}
								class="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
								{$t('common.edit')}
							</button>
							<form method="POST" action="?/delete" use:enhance={() => {
								loadingDelete = true;
								return async ({ update }) => { await update(); loadingDelete = false; };
							}}>
								<input type="hidden" name="product_id" value={pid} />
								<button type="submit"
									onclick={(e) => { if (!confirm($t('product_form.confirm_delete'))) e.preventDefault(); }}
									class="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
									{$t('common.delete')}
								</button>
							</form>
						</div>
					</div>

					<!-- Inline edit form -->
					{#if editingId === pid}
						<div class="border-t border-gray-100 p-4 bg-gray-50">
							<form
								method="POST"
								action="?/update"
								enctype="multipart/form-data"
								use:enhance={() => {
									loadingEdit = true;
									return async ({ update }) => {
										await update();
										loadingEdit = false;
										if (form?.success) editingId = null;
									};
								}}
								class="grid grid-cols-1 sm:grid-cols-2 gap-4"
							>
								<input type="hidden" name="product_id" value={pid} />
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">{$t('product_form.name_label')} *</label>
									<input name="name" type="text" value={product.name as string} required
										class="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white" />
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">{$t('product_form.category_label')}</label>
									<input name="category" type="text" value={(product.category as string) ?? ''}
										class="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white" />
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">{$t('product_form.price_label')} *</label>
									<input name="price" type="number" min="0" step="0.01" value={product.price as number} required
										class="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white" />
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">{$t('product_form.sort_label')}</label>
									<input name="sort_order" type="number" value={product.sort_order as number}
										class="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white" />
								</div>
								<div class="sm:col-span-2">
									<label class="block text-sm font-medium text-gray-700 mb-1">{$t('product_form.description_label')}</label>
									<textarea name="description" rows="2"
										class="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none bg-white"
									>{(product.description as string) ?? ''}</textarea>
								</div>
								<div>
									<label class="block text-sm font-medium text-gray-700 mb-1">{$t('product_form.image_label')}</label>
									<input name="image" type="file" accept="image/jpeg,image/png,image/webp"
										class="w-full text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600" />
								</div>
								<div class="flex items-center gap-2">
									<input name="is_active" type="checkbox" checked={product.is_active as boolean} id="edit_active_{pid}" class="w-4 h-4 text-indigo-600 rounded" />
									<label for="edit_active_{pid}" class="text-sm text-gray-700">{$t('product_form.active_label')}</label>
								</div>
								{#if form?.error && form.action === 'update' && form.productId === pid}
									<div class="sm:col-span-2">
										<p class="text-red-500 text-sm">{$t(`product_form.${form.error}`)}</p>
									</div>
								{/if}
								<div class="sm:col-span-2 flex gap-3">
									<button type="submit" disabled={loadingEdit}
										class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-xl transition">
										{loadingEdit ? $t('product_form.saving') : $t('product_form.save_button')}
									</button>
									<button type="button" onclick={() => editingId = null}
										class="text-sm text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-100 border border-gray-200 transition">
										{$t('common.cancel')}
									</button>
								</div>
							</form>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
