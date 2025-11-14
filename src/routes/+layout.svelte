<script lang="ts">
	import '../app.css';
	import { fly } from 'svelte/transition';
	import { onDestroy, onMount } from 'svelte';
	import favicon from '$lib/assets/and.svg';
	import CurtainMenu from '$components/CurtainMenu.svelte';
	import SiteHeader from '$components/SiteHeader.svelte';
	import SiteFooter from '$components/SiteFooter.svelte';
	import { ContactPostcard } from '$lib/components';
	import LaunchCountdownOverlay from '$lib/components/LaunchCountdownOverlay.svelte';
	import { Button, Icon } from '@pixelcode_/blocks/components';
	import IconPixelCode from '$lib/icons/IconPixelCode.svelte';
	import pixelLogoUrl from '$lib/assets/pixelcodelogo.svg?url';
	import { navLinks } from '$lib/navlinks';
	import { curtainMenu } from '$lib/stores/curtainMenu';
	import { contactModal } from '$lib/stores/contactModal';
	import {
		floatingNavState,
		resetFloatingNavState,
		setFloatingNavState
	} from '$lib/stores/floatingNav';
	import { siteHeaderState, updateSiteHeaderState } from '$lib/stores/siteHeader';
	import RollingText from '$components/rolling-text/RollingText.svelte';
	import Lenis from 'lenis';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { siteMeta, withMetaDefaults } from '$lib/seo';

	const LAUNCH_COUNTDOWN_TARGET = '2025-11-18T17:00:00+01:00';

	let { children } = $props();

	let headerHeight = 0;
	let currentParallaxOffset = 0;
	let isHomeRoute = get(page).url.pathname === '/';
	let headerWrapper: HTMLDivElement | null = null;
	let headerResizeObserver: ResizeObserver | null = null;
	let headerResizeHandler: (() => void) | null = null;
	let scrollHandler: (() => void) | null = null;

	const updateFloatingNavFromLayout = () => {
		if (isHomeRoute || typeof window === 'undefined') {
			return;
		}
		const hideDistance = headerHeight ? headerHeight + 120 : 220;
		const scrollY = window.scrollY || 0;
		const headerProgress = Math.min(scrollY / hideDistance, 1);
		const parallaxOffset = headerHeight
			? Math.min(headerProgress * headerHeight, headerHeight)
			: Math.min(headerProgress * 80, 80);
		if (Math.abs(parallaxOffset - currentParallaxOffset) > 0.25) {
			updateSiteHeaderState({ parallaxOffset });
		}
		const headerFullyHidden =
			headerHeight > 0 ? parallaxOffset >= headerHeight - 4 : headerProgress >= 0.95;
		setFloatingNavState({ active: headerFullyHidden, showCta: false });
	};

	const unsubscribeHeader = siteHeaderState.subscribe((state) => {
		// Keep layout-aware fallback nav behaviour in sync with latest measurements.
		headerHeight = state.height;
		currentParallaxOffset = state.parallaxOffset;
		if (!isHomeRoute) {
			queueMicrotask(updateFloatingNavFromLayout);
		}
	});
	const unsubscribePage = page.subscribe(($page) => {
		isHomeRoute = $page.url.pathname === '/';
		if (isHomeRoute) {
			// Allow the home page to take over the floating nav behaviour.
			return;
		}
		// Reset CTA visibility when entering non-home routes.
		resetFloatingNavState();
		updateSiteHeaderState({ parallaxOffset: 0 });
		queueMicrotask(updateFloatingNavFromLayout);
	});

	const PixelCodeLucideIcon = IconPixelCode as unknown as (typeof import('lucide-svelte'))['Icon'];
	const resolvedMeta = $derived(withMetaDefaults($page.data?.meta, $page.url.pathname));
	const jsonLdEntries = $derived(
		resolvedMeta.jsonLd
			? Array.isArray(resolvedMeta.jsonLd)
				? resolvedMeta.jsonLd
				: [resolvedMeta.jsonLd]
			: []
	);

	let lenis: Lenis | undefined;
	let rafId: number | null = null;

	export const disableSmoothScroll = () => lenis?.stop();
	export const enableSmoothScroll = () => lenis?.start();

	const syncHeaderMetrics = () => {
		if (!headerWrapper) {
			return;
		}
		updateSiteHeaderState({ height: headerWrapper.offsetHeight });
	};

	onMount(() => {
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual';
		}

		lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			smoothWheel: true
		});

		const raf = (time: number) => {
			lenis?.raf(time);
			rafId = requestAnimationFrame(raf);
		};

		rafId = requestAnimationFrame(raf);

		syncHeaderMetrics();

		if (typeof ResizeObserver !== 'undefined' && headerWrapper) {
			headerResizeObserver = new ResizeObserver(() => syncHeaderMetrics());
			headerResizeObserver.observe(headerWrapper);
		}

		headerResizeHandler = () => syncHeaderMetrics();
		window.addEventListener('resize', headerResizeHandler);

		scrollHandler = () => updateFloatingNavFromLayout();
		window.addEventListener('scroll', scrollHandler, { passive: true });
	});

	onDestroy(() => {
		lenis?.destroy();
		lenis = undefined;

		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}

		if (headerResizeObserver) {
			headerResizeObserver.disconnect();
			headerResizeObserver = null;
		}

		if (headerResizeHandler) {
			window.removeEventListener('resize', headerResizeHandler);
			headerResizeHandler = null;
		}

		if (scrollHandler) {
			window.removeEventListener('scroll', scrollHandler);
			scrollHandler = null;
		}

		unsubscribeHeader();
		unsubscribePage();
	});
</script>

<svelte:head>
	<title>{resolvedMeta.title}</title>
	<meta name="description" content={resolvedMeta.description} />
	<meta name="robots" content={resolvedMeta.noindex ? 'noindex,nofollow' : 'index,follow'} />
	<link rel="canonical" href={resolvedMeta.canonical} />
	<meta property="og:site_name" content={siteMeta.name} />
	<meta property="og:title" content={resolvedMeta.title} />
	<meta property="og:description" content={resolvedMeta.description} />
	<meta property="og:url" content={resolvedMeta.canonical} />
	<meta property="og:type" content={resolvedMeta.type} />
	{#if resolvedMeta.ogImage}
		<meta property="og:image" content={resolvedMeta.ogImage} />
	{/if}
	<meta name="twitter:card" content={resolvedMeta.twitterCard} />
	<meta name="twitter:title" content={resolvedMeta.title} />
	<meta name="twitter:description" content={resolvedMeta.description} />
	{#if resolvedMeta.ogImage}
		<meta name="twitter:image" content={resolvedMeta.ogImage} />
	{/if}
	<meta name="theme-color" content="#0f172a" />
	<link rel="icon" href={favicon} />
	{#if jsonLdEntries.length}
		{#each jsonLdEntries as schema}
			<script type="application/ld+json">
{JSON.stringify(schema)}
			</script>
		{/each}
	{/if}
</svelte:head>

<CurtainMenu links={navLinks} logoSrc={pixelLogoUrl} />

{#if !$page.url.pathname.startsWith('/internal')}
	<LaunchCountdownOverlay targetIso={LAUNCH_COUNTDOWN_TARGET} />
{/if}

{#if !$page.url.pathname.startsWith('/internal')}
	<div
		class="first-fold__header sticky top-0 z-40 w-full backdrop-blur-lg transition-opacity duration-150 ease-out"
		bind:this={headerWrapper}
		style:transform={`translate3d(0, ${-$siteHeaderState.parallaxOffset}px, 0)`}
	>
		<SiteHeader links={navLinks} logoSrc={pixelLogoUrl} />
	</div>

	<div
		class="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-row justify-end gap-5 overflow-hidden px-4 pt-5 md:px-16"
	>
		{#if $floatingNavState.active}
			<div
				class="pointer-events-auto flex items-center gap-3"
				transition:fly={{ y: 50, duration: 220, delay: 50 }}
			>
				<Button
					size="md"
					variant="primary"
					onclick={contactModal.open}
					class="border border-white/20 transition-transform duration-200"
				>
					<RollingText>Get in touch</RollingText>
				</Button>
			</div>
		{/if}

		<div
			class="pointer-events-auto flex items-center gap-3 md:hidden"
			class:md:block={$floatingNavState.active}
		>
			<Button
				class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-background/20 bg-white text-primary  transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
				aria-label="Open main menu"
				aria-expanded={$curtainMenu ? 'true' : 'false'}
				aria-controls="curtain-menu"
				onclick={curtainMenu.open}
			>
				<RollingText>
					<Icon icon={PixelCodeLucideIcon} size="md" class="text-primary" />
				</RollingText>
			</Button>
		</div>

		{#if $floatingNavState.active}
			<div
				class="pointer-events-auto hidden items-center gap-3 md:flex"
				transition:fly={{ y: 50, duration: 220 }}
			>
				<Button
					class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-background/20 bg-white text-primary  transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
					aria-label="Open main menu"
					aria-expanded={$curtainMenu ? 'true' : 'false'}
					aria-controls="curtain-menu"
					onclick={curtainMenu.open}
				>
					<RollingText>
						<Icon icon={PixelCodeLucideIcon} size="md" class="text-primary" />
					</RollingText>
				</Button>
			</div>
		{/if}
	</div>
{/if}

{@render children?.()}
{#if !$page.url.pathname.startsWith('/internal')}
	<SiteFooter links={navLinks} />
{/if}

<ContactPostcard />
