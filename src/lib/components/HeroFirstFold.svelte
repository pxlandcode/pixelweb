<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { Button } from '@pixelcode_/blocks/components';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import LogoMarquee from '$components/LogoMarquee.svelte';
	import RollingText from '$components/rolling-text/RollingText.svelte';
	import { resetFloatingNavState, setFloatingNavState } from '$lib/stores/floatingNav';
	import { siteHeaderState, updateSiteHeaderState } from '$lib/stores/siteHeader';
	import type { ComponentProps } from 'svelte';

	type HeroSectionProps = ComponentProps<typeof HeroSection>;

	export let logos: string[] = [];
	export let heroProps: Partial<HeroSectionProps> = {};
export let showCta = true;
export let ctaHref = '#contact';
export let ctaLabel = 'Get in touch';
export let buttonVariant: string | undefined = 'primary';
export let buttonSize: string | undefined = 'lg';
	export let parallaxDistance = 280;
	export let parallaxMultiplier = 0.45;
	export let floatThreshold = 96;

	let firstFoldSection: HTMLElement | null = null;
	let heroSectionEl: HTMLDivElement | null = null;
	let marqueeEl: HTMLDivElement | null = null;
	let heroButtonContainer: HTMLDivElement | null = null;

	let scrollY = 0;
	let headerHeight = 0;
	let heroButtonBottom = Number.POSITIVE_INFINITY;
	let firstFoldScrollProgress = 0;
	let heroSectionHeight = 0;
	let marqueeHeight = 0;

	$: headerHeight = $siteHeaderState.height;
	$: headerHideDistance = headerHeight ? headerHeight + 120 : 220;
	$: headerProgress = Math.min(scrollY / headerHideDistance, 1);
	$: parallaxOffset = headerHeight ? headerProgress * headerHeight : headerProgress * 80;
	$: updateSiteHeaderState({ parallaxOffset });
	$: headerFullyHidden =
		headerHeight > 0 ? parallaxOffset >= headerHeight - 4 : headerProgress >= 0.2;
	$: heroButtonShouldFloat = heroButtonBottom <= floatThreshold;
	$: floatingNavActive = headerFullyHidden;
	$: showFloatingCta = floatingNavActive && heroButtonShouldFloat && showCta;
	$: heroButtonHidden = floatingNavActive || !showCta;
	$: heroParallaxLimit = Math.max(
		heroSectionHeight + marqueeHeight * 0.7,
		parallaxDistance
	);
	$: heroParallaxOffset = Math.min(
		firstFoldScrollProgress * parallaxMultiplier,
		heroParallaxLimit
	);
	$: setFloatingNavState({ active: floatingNavActive, showCta: showFloatingCta });
	$: firstFoldMinHeight =
		headerHeight && heroSectionHeight
			? `max(calc(100dvh - ${Math.round(headerHeight)}px), ${heroSectionHeight}px)`
			: heroSectionHeight
				? `${heroSectionHeight}px`
				: '100dvh';

	function recalcMeasurements() {
		if (firstFoldSection) {
			const rect = firstFoldSection.getBoundingClientRect();
			const progress = Math.max(0, Math.min(rect.height, -rect.top));
			firstFoldScrollProgress = progress;
		} else {
			firstFoldScrollProgress = 0;
		}

		if (heroSectionEl) {
			heroSectionHeight = heroSectionEl.offsetHeight;
		} else {
			heroSectionHeight = 0;
		}

		if (marqueeEl) {
			marqueeHeight = marqueeEl.offsetHeight;
		} else {
			marqueeHeight = 0;
		}

		if (heroButtonContainer) {
			const rect = heroButtonContainer.getBoundingClientRect();
			heroButtonBottom = rect.bottom;
		} else {
			heroButtonBottom = Number.POSITIVE_INFINITY;
		}
	}

	function handleScroll() {
		scrollY = window.scrollY || 0;
		recalcMeasurements();
	}

	function handleResize() {
		recalcMeasurements();
	}

	onMount(async () => {
		await tick();
		recalcMeasurements();
		scrollY = window.scrollY || 0;
	});

	onDestroy(() => {
		resetFloatingNavState();
		updateSiteHeaderState({ parallaxOffset: 0 });
	});
</script>

<svelte:window on:scroll={handleScroll} on:resize={handleResize} />

<section
	class="first-fold relative flex min-h-screen flex-col overflow-hidden"
	style:min-height={firstFoldMinHeight}
	bind:this={firstFoldSection}
>
	<div
		class="first-fold__content relative z-10 flex h-full flex-1 flex-col justify-center gap-10"
		style:transform={`translate3d(0, ${heroParallaxOffset}px, 0)`}
	>
		<div class="first-fold__hero flex w-full flex-col items-center gap-6" bind:this={heroSectionEl}>
			<HeroSection {...heroProps} />
			{#if showCta}
				<div
					class="flex transform-gpu justify-center pt-2 transition-all duration-200 ease-in-out"
					bind:this={heroButtonContainer}
					class:opacity-0={heroButtonHidden}
					class:translate-y-8={heroButtonHidden}
					class:pointer-events-none={heroButtonHidden}
				>
					<Button
						size={buttonSize}
						variant={buttonVariant}
						href={ctaHref}
						aria-hidden={heroButtonHidden ? 'true' : undefined}
						tabindex={heroButtonHidden ? -1 : undefined}
					>
						<RollingText>{ctaLabel}</RollingText>
					</Button>
				</div>
			{/if}
		</div>
	</div>
	<div class="first-fold__marquee relative z-20 w-full bg-background" bind:this={marqueeEl}>
		<LogoMarquee {logos} />
	</div>
</section>
