<script lang="ts">
	import { Button } from '@pixelcode_/blocks/components';
	import { ScrollGallery } from '$lib/components';
	import HeroFirstFold from '$lib/components/HeroFirstFold.svelte';
	import { galleryImages } from '$lib/images/manifest';
	import AnimatedHeadline from '$components/animated-headline/AnimatedHeadline.svelte';
	import DiscordCulture from '$components/discord-culture/DiscordCulture.svelte';
	import * as cultureLogos from '$lib/assets/culture';
	import peopleAndCultureLogoUrl from '$lib/assets/peopleandculturelogo.svg?url';
	import { contactModal } from '$lib/stores/contactModal';
	import NeonSign from '$lib/components/NeonSign.svelte';

	const galleryTitle = 'We work hard but there is more to this workplace than just hard work.';

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

	const logos = Object.values(cultureLogos).sort();

	const heroSectionProps = {
		eyebrow: 'WE VALUE',
		description: 'And we are always looking for curious people who want to grow with us.',
		brandText: 'People & Culture',
		brandLogo: peopleAndCultureLogoUrl,
		workStatements: [],
		cultureStatements: []
	};
</script>

<svelte:head>
	<title>About Us - Join Our Team | Pixelcode</title>
</svelte:head>

<main class="flex min-h-screen flex-col bg-background text-[#f5f5f5]">
	<HeroFirstFold {logos} heroProps={heroSectionProps} />

	<!-- Scroll Gallery Section -->
	<ScrollGallery images={galleryImages} title={galleryTitle} />

	<AnimatedHeadline
		text="And our Discord is always buzzing."
		minHeight="clamp(120vh, 150vh + 4vw, 180vh)"
		stickyMinHeight="clamp(15vh, 20vh, 90vh)"
		stickAt="50vh"
	/>
	<DiscordCulture
		minHeight="clamp(130vh, 160vh + 4vw, 190vh)"
		paddingTop="min(8vh, 5rem)"
		paddingBottom="min(8vh, 5rem)"
	/>
	<AnimatedHeadline
		text="People. Culture. & Code."
		minHeight="clamp(130vh, 165vh + 4vw, 200vh)"
		stickyMinHeight="clamp(65vh, 80vh, 90vh)"
		stickAt="50vh"
	/>

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
		class="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 py-24 text-center md:px-12 lg:px-20"
	>
		<div
			class="pointer-events-none absolute inset-0 z-0 flex items-center justify-end"
			aria-hidden="true"
		>
			<NeonSign
				decorative
				className="relative right-[-12%] opacity-55 mix-blend-screen"
				size="clamp(14rem, 38vw, 28rem)"
			/>
		</div>

		<div class="relative z-10 flex flex-col items-center gap-6">
			<p class="text-xs font-semibold tracking-[0.35em] text-primary/70 uppercase">
				The office glow
			</p>
			<h2 class="text-4xl font-semibold text-white md:text-5xl">
				Ready to build something amazing together?
			</h2>
			<p class="max-w-2xl text-lg leading-relaxed text-[#d4d4d8]">
				Let's talk about how you can join our team and make an impact.
			</p>
			<div class="flex justify-center">
				<Button
					href="/#contact"
					onclick={(e) => {
						e.preventDefault();
						contactModal.open();
					}}>Start the conversation</Button
				>
			</div>
		</div>
	</section>
</main>
