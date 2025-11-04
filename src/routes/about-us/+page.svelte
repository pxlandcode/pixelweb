<script lang="ts">
	import asset from '$lib/images/asset.jpg';
	import ecommerce from '$lib/images/ecommerce.png';
	import meetingRoom from '$lib/images/meeting-room.jpg';
	import workLife from '$lib/images/work-life.jpg';
	import { Button } from '@pixelcode_/blocks/components';
	import { ScrollGallery } from '$lib/components';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import karaoke from '$lib/images/scrollgallery/karaoke.jpg';
	import workhard from '$lib/images/scrollgallery/workhard.jpg';
	import AnimatedHeadline from '$components/animated-headline/AnimatedHeadline.svelte';
	import DiscordCulture from '$components/discord-culture/DiscordCulture.svelte';
	import RollingText from '$components/rolling-text/RollingText.svelte';
	import peopleAndCultureLogoUrl from '$lib/assets/peopleandculturelogo.svg?url';

	const galleryImages = [
		{ src: workhard, alt: 'Focused work', text: 'Getting things done' },
		{ src: asset, alt: 'Our office', text: 'Pixel&Code Headquarters' },
		{ src: ecommerce, alt: 'E-commerce project', text: 'E-commerce project' },
		{ src: meetingRoom, alt: 'Meeting room', text: 'Collaborative meetings' },
		{ src: workLife, alt: 'Work life balance', text: 'Work life balance' },

		{ src: karaoke, alt: 'Singing Karaoke', text: 'Karaoke Night' }
	];

	const galleryTitle = 'We work hard but there is more to this workplace than just hard work.';

	const stats = [
		{ value: '12+', label: 'Years in business' },
		{ value: '200+', label: 'Projects delivered' },
		{ value: '50+', label: 'Happy clients' },
		{ value: '25+', label: 'Team members' }
	];

	const culturePillars = [
		{
			title: 'Continuous Learning',
			description:
				'We invest in skills, tools, and curiosity. Every project is a chance to grow individually and as a team.'
		},
		{
			title: 'Transparent Communication',
			description:
				'We work out loud, share context generously, and solve problems together. No hidden agendas.'
		},
		{
			title: 'Ownership & Impact',
			description:
				'We trust you to lead, make decisions, and shape outcomes that matter for clients and the business.'
		}
	];
</script>

<svelte:head>
	<title>About Us - Join Our Team | Pixelcode</title>
</svelte:head>

<main class="flex min-h-screen flex-col bg-background text-[#f5f5f5]">
	<!-- Hero Section -->
	<section class="first-fold relative flex min-h-screen flex-col overflow-hidden bg-background">
		<div
			class="first-fold__content relative z-10 flex h-full flex-1 flex-col justify-center gap-10 px-6 pt-24 pb-16 md:px-24 md:pt-32"
		>
			<div class="first-fold__hero flex w-full flex-col items-center gap-6">
				<HeroSection
					eyebrow="WE VALUE"
					description="And we are always looking for curious people who want to grow with us."
					brandText="People & Culture"
					brandLogo={peopleAndCultureLogoUrl}
					workStatements={[]}
					cultureStatements={[]}
				/>
				<div class="flex transform-gpu justify-center pt-2">
					<Button size="lg" variant="primary" href="/#contact">
						<RollingText>Get in touch</RollingText>
					</Button>
				</div>
			</div>
		</div>
		<div class="first-fold__marquee relative z-20 w-full bg-background">
			<ul
				class="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-center gap-8 border-t border-white/10 px-6 py-8 text-center text-xs tracking-[0.35em] text-white/60 uppercase md:flex-nowrap md:gap-16 md:px-12 md:text-sm"
				role="list"
				aria-label="Team statistics"
			>
				{#each stats as stat}
					<li class="flex flex-col items-center gap-1">
						<span class="text-3xl font-semibold tracking-normal text-white md:text-4xl">
							{stat.value}
						</span>
						<span>{stat.label}</span>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<!-- Scroll Gallery Section -->
	<ScrollGallery images={galleryImages} title={galleryTitle} />

	<div class="mt-[-200px]">
		<AnimatedHeadline text="And our Discord is always buzzing." />
		<DiscordCulture />
	</div>

	<section
		id="culture"
		class="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-24 md:px-12 lg:px-20"
	>
		<div class="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
			<div class="flex flex-col gap-5">
				<p class="text-xs font-semibold tracking-[0.35em] text-primary/70 uppercase">How we work</p>
				<h2 class="text-3xl font-semibold text-white md:text-4xl">
					We look for teammates who love to learn out loud.
				</h2>
				<p class="text-lg leading-relaxed text-[#d4d4d8]">
					Our projects span early-stage ventures and enterprise product teams. The thread that
					connects them is a hunger for thoughtful collaboration, clarity in strategy, and a bias
					toward action.
				</p>
			</div>

			<div class="grid gap-6">
				{#each culturePillars as pillar}
					<article
						class="rounded-3xl border border-white/5 bg-white/[0.02] p-6 shadow-[0_25px_60px_rgba(8,8,18,0.45)]"
					>
						<h3 class="text-xl font-semibold text-white">{pillar.title}</h3>
						<p class="mt-2 text-[#cbd5f5]">{pillar.description}</p>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- Closing CTA -->
	<section
		class="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-24 text-center md:px-12 lg:px-20"
	>
		<h2 class="text-4xl font-semibold text-white md:text-5xl">
			Ready to build something amazing together?
		</h2>
		<p class="text-lg leading-relaxed text-[#d4d4d8]">
			Let's talk about how you can join our team and make an impact.
		</p>
		<div class="flex justify-center">
			<Button href="/#contact">Start the conversation</Button>
		</div>
	</section>
</main>
