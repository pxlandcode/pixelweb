<script lang="ts">
	import Cardstack from '$lib/components/Cardstack.svelte';
	import CardstackItem from '$lib/components/CardstackItem.svelte';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import LogoMarquee from '$lib/components/LogoMarquee.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import pixelLogoUrl from '$lib/assets/pixelcodelogo.svg?url';
	import type { NavLink } from '$types';
	import { Button } from '@pixelcode_/blocks/components';

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
</script>

<main class="flex min-h-screen flex-col bg-[#0f0f11] text-[#f0f0f0]">
	<section class="first-fold flex min-h-screen flex-col">
		<SiteHeader links={navLinks} logoSrc={pixelLogoUrl} />
		<div class="first-fold__content flex h-full flex-1 flex-col justify-center gap-10">
			<div class="first-fold__hero flex w-full flex-col items-center gap-6">
				<HeroSection brandLogo={pixelLogoUrl} />
				<div class="flex justify-center pt-2">
					<Button size="lg" variant="primary" href="#contact">Get in touch</Button>
				</div>
			</div>
		</div>
		<div class="first-fold__marquee w-full">
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
