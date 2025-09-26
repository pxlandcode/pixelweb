<script lang="ts">
	import HeroSection from '$lib/components/HeroSection.svelte';
	import LogoMarquee from '$lib/components/LogoMarquee.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import pixelLogoUrl from '$lib/assets/pixelcodelogo.svg?url';
	import type { NavLink } from '$types';

	const navLinks: NavLink[] = [
		{ label: 'For companies', href: '#' },
		{ label: 'Join the team', href: '#' },
		{ label: 'For developers', href: '#' },
		{ label: 'Web shop', href: '#' },
		{ label: 'Contact', href: '#' }
	];

	const logoImports = import.meta.glob('../lib/assets/logos/*.svg', {
		query: '?url',
		import: 'default',
		eager: true
	});

	const discoveredLogos = Object.values(logoImports) as string[];

	const logos = (discoveredLogos.length ? [...discoveredLogos].sort() : []) satisfies string[];
</script>

<main class="flex min-h-screen flex-col bg-[#0f0f11] text-[#f0f0f0]">
	<SiteHeader links={navLinks} logoSrc={pixelLogoUrl} />
	<HeroSection brandLogo={pixelLogoUrl} />
	<LogoMarquee {logos} />
</main>
