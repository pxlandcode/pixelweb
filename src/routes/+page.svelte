<script lang="ts">
        import { onDestroy, onMount, tick } from 'svelte';
        import Cardstack from '$lib/components/Cardstack.svelte';
        import CardstackItem from '$lib/components/CardstackItem.svelte';
        import HeroSection from '$lib/components/HeroSection.svelte';
        import LogoMarquee from '$lib/components/LogoMarquee.svelte';
        import type { ActionData } from './$types';

	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import pixelLogoUrl from '$lib/assets/pixelcodelogo.svg?url';

	import { Button } from '@pixelcode_/blocks/components';
	import { navLinks } from '$lib/navlinks';
	import { resetFloatingNavState, setFloatingNavState } from '$lib/stores/floatingNav';
	import RollingText from '$components/rolling-text/RollingText.svelte';
	import { cardstackEntries } from '$lib/mockdata';
	import ImageHeadline from '$components/ImageHeadline.svelte';
	import ImageFeaturePair from '$components/ImageFeaturePair.svelte';

	import asset from '$lib/images/asset.jpg';
	import workLife from '$lib/images/work-life.jpg';
	import meetingRoom from '$lib/images/meeting-room.jpg';

	const logoImports = import.meta.glob('../lib/assets/logos/*.svg', {
		query: '?url',
		import: 'default',
		eager: true
	});

	const cards = cardstackEntries;

	const discoveredLogos = Object.values(logoImports) as string[];

	const logos = (discoveredLogos.length ? [...discoveredLogos].sort() : []) satisfies string[];

	let headerWrapper: HTMLDivElement | null = null;
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

	const HERO_PARALLAX_DISTANCE = 280;
	const HERO_PARALLAX_MULTIPLIER = 0.45;

	$: headerHideDistance = headerHeight ? headerHeight + 120 : 220;
	$: headerProgress = Math.min(scrollY / headerHideDistance, 1);
	$: parallaxOffset = headerHeight ? headerProgress * headerHeight : headerProgress * 80;
	$: headerFullyHidden = headerProgress >= 0.2;
	$: heroButtonShouldFloat = heroButtonBottom <= 96;
	$: floatingNavActive = headerFullyHidden;
	$: showFloatingCta = floatingNavActive && heroButtonShouldFloat;
	$: heroButtonHidden = floatingNavActive;
	$: heroParallaxLimit = Math.max(heroSectionHeight + marqueeHeight * 0.7, HERO_PARALLAX_DISTANCE);
	$: heroParallaxOffset = Math.min(
		firstFoldScrollProgress * HERO_PARALLAX_MULTIPLIER,
		heroParallaxLimit
	);
	$: setFloatingNavState({ active: floatingNavActive, showCta: showFloatingCta });

	function recalcMeasurements() {
		if (headerWrapper) {
			headerHeight = headerWrapper.offsetHeight;
		}
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
	});
	const leadTitle =
		"We don't believe in making things complicated.\nWe strive for simplicity, and focus on results.";

	const leftTitle = 'Work-life balance';
	const leftBody =
		'We prioritize work-life balance and we foster a culture of professional development, innovation and creativity, encouraging our employees to continuously build their skills, think outside the box and bring new ideas to the table.';
	const rightTitle = 'Our greatest asset';
	const rightBody =
		'Our employees are our greatest asset and we are committed to create a workplace that inspires and offers competitive compensation, success and well-being.';

        const bannerTitle =
                'We design, build and support digital products that create real business value.';

        export let form: ActionData | undefined;

        $: leadValues = form?.values ?? { website_url: '', email: '' };
</script>

<svelte:window on:scroll={handleScroll} on:resize={handleResize} />

<main class="flex min-h-screen flex-col bg-background text-[#f0f0f0]">
	<section
		class="first-fold relative flex min-h-screen flex-col overflow-hidden"
		bind:this={firstFoldSection}
	>
		<div
			class="first-fold__header sticky top-0 z-40 w-full backdrop-blur-lg transition-opacity duration-150 ease-out"
			bind:this={headerWrapper}
			style:transform={`translate3d(0, ${-parallaxOffset}px, 0)`}
		>
			<SiteHeader links={navLinks} logoSrc={pixelLogoUrl} />
		</div>
		<div
			class="first-fold__content relative z-10 flex h-full flex-1 flex-col justify-center gap-10"
			style:transform={`translate3d(0, ${heroParallaxOffset}px, 0)`}
		>
			<div
				class="first-fold__hero flex w-full flex-col items-center gap-6"
				bind:this={heroSectionEl}
			>
				<HeroSection brandLogo={pixelLogoUrl} />
				<div
					class="flex transform-gpu justify-center pt-2 transition-all duration-200 ease-in-out"
					bind:this={heroButtonContainer}
					class:opacity-0={heroButtonHidden}
					class:translate-y-8={heroButtonHidden}
					class:pointer-events-none={heroButtonHidden}
				>
					<Button
						size="lg"
						variant="primary"
						href="#contact"
						aria-hidden={heroButtonHidden ? 'true' : undefined}
						tabindex={heroButtonHidden ? -1 : undefined}
					>
						<RollingText>Get in touch</RollingText>
					</Button>
				</div>
			</div>
		</div>
		<div class="first-fold__marquee relative z-20 w-full bg-background" bind:this={marqueeEl}>
			<LogoMarquee {logos} />
		</div>
	</section>
	<ImageFeaturePair
		{leadTitle}
		{leftTitle}
		{leftBody}
		leftImageSrc={workLife}
		{rightTitle}
		{rightBody}
		rightImageSrc={asset}
	/>

	<!-- Parallax banner -->
	<ImageHeadline imageSrc={meetingRoom} title={bannerTitle} parallax={0.25} />

        <Cardstack>
                {#each cardstackEntries as entry (entry.title)}
                        <CardstackItem
                                counter={cards.indexOf(entry) + 1}
                                title={entry.title}
				eyebrow={entry.eyebrow}
				description={entry.description}
				link={entry.link}
				img={entry.img}
				imgAlt={entry.imgAlt}
			>
				{#if entry.bullets}
					<ul class="stack-card__list">
						{#each entry.bullets as bullet}
							<li>{bullet}</li>
						{/each}
					</ul>
				{/if}
			</CardstackItem>
                {/each}
        </Cardstack>

        <section
                id="contact"
                class="border-t border-border/60 bg-background px-6 py-16"
        >
                <div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
                        <div class="space-y-2">
                                <h2 class="text-3xl font-semibold text-primary">AI-kompatibilitetsanalys</h2>
                                <p class="text-sm text-muted-fg">
                                        Fyll i din webbplats och e-postadress så återkommer vi med en skräddarsydd analys.
                                </p>
                        </div>
                        <form method="POST" class="space-y-5">
                                {#if form?.error}
                                        <div class="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                                                {form.error}
                                        </div>
                                {/if}
                                {#if form?.success}
                                        <div class="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                                                Tack! Vi hör av oss så snart vi har granskat din sida.
                                        </div>
                                {/if}
                                <label class="flex flex-col gap-1 text-sm text-foreground">
                                        <span>Webbplats (URL)</span>
                                        <input
                                                name="website_url"
                                                type="url"
                                                required
                                                value={leadValues.website_url}
                                                placeholder="https://www.exempel.se"
                                                class="w-full rounded-md border border-border bg-background/60 px-3 py-2 text-base text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                                        />
                                </label>
                                <label class="flex flex-col gap-1 text-sm text-foreground">
                                        <span>E-post</span>
                                        <input
                                                name="email"
                                                type="email"
                                                required
                                                value={leadValues.email}
                                                placeholder="namn@företag.se"
                                                class="w-full rounded-md border border-border bg-background/60 px-3 py-2 text-base text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                                        />
                                </label>
                                <label class="flex items-start gap-2 text-sm text-muted-fg">
                                        <input
                                                type="checkbox"
                                                name="consent"
                                                value="true"
                                                required
                                                class="mt-1 h-4 w-4 rounded border-border bg-background/80 text-primary focus:ring-2 focus:ring-primary/40"
                                        />
                                        <span>
                                                Jag godkänner att Pixelweb kontaktar mig och sparar mina uppgifter för uppföljning.
                                        </span>
                                </label>
                                <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        {#if form?.quota?.remaining !== undefined}
                                                <span class="inline-flex w-fit items-center rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-fg">
                                                        AI-citat kvar idag: {form.quota.remaining}
                                                </span>
                                        {/if}
                                        <button
                                                type="submit"
                                                class="inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-background transition hover:bg-primary/90 sm:w-auto"
                                        >
                                                Analysera
                                        </button>
                                </div>
                        </form>
                </div>
        </section>
</main>
