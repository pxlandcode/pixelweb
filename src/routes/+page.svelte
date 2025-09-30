<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import Cardstack from '$lib/components/Cardstack.svelte';
	import CardstackItem from '$lib/components/CardstackItem.svelte';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import LogoMarquee from '$lib/components/LogoMarquee.svelte';

	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import pixelLogoUrl from '$lib/assets/pixelcodelogo.svg?url';

	import { Button, Icon } from '@pixelcode_/blocks/components';
	import IconPixelCode from '$lib/icons/IconPixelCode.svelte';
	import { navLinks } from '$lib/navlinks';

	const logoImports = import.meta.glob('../lib/assets/logos/*.svg', {
		query: '?url',
		import: 'default',
		eager: true
	});

	const discoveredLogos = Object.values(logoImports) as string[];

	const logos = (discoveredLogos.length ? [...discoveredLogos].sort() : []) satisfies string[];

	type CardstackEntry = {
		eyebrow: string;
		title: string;
		description: string;
		bullets?: string[];
		link?: { href: string; label: string };
	};

	const cardstackEntries: CardstackEntry[] = [
		{
			eyebrow: 'Discovery',
			title: 'Align around the outcome before we touch the code',
			description:
				"We uncover the real problem through workshops, customer interviews, and rapid validation so we know we're investing in the right solution.",
			bullets: [
				'Problem framing sessions with your core stakeholders',
				'Clickable prototypes to test product value early',
				'Roadmaps grounded in measurable business impact'
			]
		},
		{
			eyebrow: 'Design',
			title: 'Design journeys that feel effortless and on-brand',
			description:
				'Our designers co-create with your team to craft accessible, production-ready interfaces that your customers actually enjoy using.',
			bullets: [
				'Hands-on design sprints with real user feedback loops',
				'Robust design systems that scale across products',
				'Micro-interactions that bring your brand to life'
			]
		},
		{
			eyebrow: 'Engineering',
			title: 'Ship stable builds on a cadence you can trust',
			description:
				'We blend modern stacks with pragmatic engineering so releases stay predictable, maintainable, and ready for whatever comes next.',
			bullets: [
				'CI/CD pipelines with automated quality gates',
				'Modular architectures that adapt as you grow',
				'Performance budgets baked into every sprint'
			]
		},
		{
			eyebrow: 'Partnership',
			title: 'Extend your team with people who own the outcomes',
			description:
				'We stay plugged in after launch with product coaching, analytics reviews, and roadmap support so the wins keep compounding.',
			bullets: [
				'Embedded squads that collaborate as true partners',
				'Monthly product reviews with actionable next steps',
				'Post-launch optimisation backed by usage data'
			],
			link: { href: '#contact', label: 'Talk with our team' }
		}
	];

	const PixelCodeLucideIcon = IconPixelCode as unknown as (typeof import('lucide-svelte'))['Icon'];

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
	$: headerOpacity = Math.max(0, 1 - headerProgress);
	$: headerFullyHidden = headerProgress >= 0.95;
	$: heroButtonShouldFloat = heroButtonBottom <= 96;
	$: floatingNavActive = headerFullyHidden;
	$: showFloatingCta = floatingNavActive && heroButtonShouldFloat;
	$: heroButtonHidden = floatingNavActive && heroButtonShouldFloat;
	$: heroParallaxLimit = Math.max(heroSectionHeight + marqueeHeight * 0.7, HERO_PARALLAX_DISTANCE);
	$: heroParallaxOffset = Math.min(
		firstFoldScrollProgress * HERO_PARALLAX_MULTIPLIER,
		heroParallaxLimit
	);
	$: heroOpacity = Math.max(0, 1 - scrollY / (HERO_PARALLAX_DISTANCE * 1.3));

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
</script>

<svelte:window on:scroll={handleScroll} on:resize={handleResize} />

{#if floatingNavActive}
	<div
		class="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-row justify-end gap-5 overflow-hidden px-4 pt-5 md:px-16"
	>
		<div
			class="pointer-events-auto flex items-center gap-3"
			transition:fly={{ y: 50, duration: 220, delay: 50 }}
		>
			<Button
				size="md"
				variant="primary"
				href="#contact"
				class="border border-white/20 transition-transform duration-200"
			>
				Get in touch
			</Button>
		</div>
		<div
			class="pointer-events-auto flex items-center gap-3"
			transition:fly={{ y: 50, duration: 220 }}
		>
			<Button
				href="/"
				size="md"
				variant="ghost"
				class="w-10 rounded-full bg-white p-0 text-primary shadow-sm hover:bg-white/90 focus-visible:outline-white"
				aria-label="Pixel & Code"
			>
				<Icon icon={PixelCodeLucideIcon} size="md" class="text-primary" />
			</Button>
		</div>
	</div>
{/if}

<main class="flex min-h-screen flex-col bg-background text-[#f0f0f0]">
	<section
		class="first-fold relative flex min-h-screen flex-col overflow-hidden"
		bind:this={firstFoldSection}
	>
		<div
			class="first-fold__header sticky top-0 z-40 w-full border-b border-white/10 bg-background/80 backdrop-blur-lg transition-opacity duration-150 ease-out"
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
					class="flex justify-center pt-2 transition-all duration-200 ease-out"
					bind:this={heroButtonContainer}
					class:opacity-0={heroButtonHidden}
					class:-translate-y-2={heroButtonHidden}
					class:pointer-events-none={heroButtonHidden}
				>
					<Button
						size="lg"
						variant="primary"
						href="#contact"
						aria-hidden={heroButtonHidden ? 'true' : undefined}
						tabindex={heroButtonHidden ? -1 : undefined}
					>
						Get in touch
					</Button>
				</div>
			</div>
		</div>
		<div class="first-fold__marquee relative z-20 w-full bg-background" bind:this={marqueeEl}>
			<LogoMarquee {logos} />
		</div>
	</section>

	<Cardstack
		eyebrow="How we partner"
		heading="Ship digital experiences that feel tailor-made"
		description="From fuzzy ideas to production-ready releases, our product squads cover the full lifecycle so you can focus on the next big bet."
	>
		{#each cardstackEntries as entry (entry.title)}
			<CardstackItem
				title={entry.title}
				eyebrow={entry.eyebrow}
				description={entry.description}
				link={entry.link}
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
</main>
