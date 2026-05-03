<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';

	let { slug } = $props<{ slug: string }>();

	const url = `https://vazix.app/shop/${slug}`;
	let dataUrl = $state('');
	let copied = $state(false);

	onMount(async () => {
		dataUrl = await QRCode.toDataURL(url, { width: 200, margin: 2 });
	});

	async function copyLink() {
		await navigator.clipboard.writeText(url);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function downloadQR() {
		const a = document.createElement('a');
		a.href = dataUrl;
		a.download = `vazix-${slug}-qr.png`;
		a.click();
	}
</script>

<div class="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
	{#if dataUrl}
		<img src={dataUrl} alt="QR Code for {slug}" class="w-36 h-36" />
	{:else}
		<div class="w-36 h-36 bg-gray-100 rounded-xl animate-pulse"></div>
	{/if}
	<div class="text-xs text-gray-400 break-all text-center">{url}</div>
	<div class="flex gap-2">
		<button
			onclick={copyLink}
			class="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
		>
			{copied ? '✓ Copied' : '📋 Copy link'}
		</button>
		<button
			onclick={downloadQR}
			disabled={!dataUrl}
			class="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
		>
			⬇️ Download QR
		</button>
	</div>
</div>
