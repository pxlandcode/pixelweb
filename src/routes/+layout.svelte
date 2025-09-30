<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import SiteFooter from '$components/SiteFooter.svelte';
	import { navLinks } from '$lib/navlinks';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
<SiteFooter links={navLinks} ctaHref="#contact" />
