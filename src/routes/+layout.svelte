<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { initLang } from '$lib/i18n';

	let { children } = $props();

	onMount(() => {
		initLang();
	});
</script>

{@render children()}
