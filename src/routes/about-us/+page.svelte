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
	import AboutSection from '$components/AboutSection.svelte';
	import RollingText from '$components/rolling-text/RollingText.svelte';

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
		text="People. Culture. & Code."
		minHeight="clamp(130vh, 165vh + 4vw, 200vh)"
		stickyMinHeight="clamp(65vh, 80vh, 90vh)"
		stickAt="50vh"
	/>
	<AboutSection />
	<AnimatedHeadline
		text="And our Discord is always buzzing."
		minHeight="clamp(120vh, 150vh + 4vw, 180vh)"
		stickyMinHeight="clamp(15vh, 60vh, 90vh)"
		stickAt="50vh"
	/>
	<DiscordCulture
		minHeight="clamp(130vh, 160vh + 4vw, 190vh)"
		paddingTop="min(8vh, 5rem)"
		paddingBottom="min(8vh, 5rem)"
	/>

	<AnimatedHeadline
		text="We're growing, one good person at a time!"
		minHeight="clamp(140vh, 170vh + 4vw, 180vh)"
		stickyMinHeight="clamp(50vh, 60vh, 70vh)"
		stickAt="50vh"
	/>

	<!-- Closing CTA -->
	<section
		class="relative mx-auto flex w-full flex-col items-center gap-8 overflow-x-clip px-6 pb-60 text-center md:px-12 lg:px-20"
	>
		<div
			class="pointer-events-none absolute inset-0 z-0 flex items-center justify-end"
			aria-hidden="true"
		>
			<NeonSign
				decorative
				className="relative opacity-55 mix-blend-screen mb-50"
				size="clamp(14rem, 28vw, 28rem)"
			/>
		</div>

		<div class="relative z-10 flex flex-col items-center gap-6">
			<h2 class="max-w-180 text-left text-4xl font-semibold text-white md:text-5xl">
				Sounds like a place where you’d thrive? <br />We’d love to hear from you!
			</h2>
			<p class="max-w-2xl text-lg leading-relaxed text-[#d4d4d8]">
				And the good part is, we are only a phone call away and coffee’s on us!
			</p>
			<div class="flex justify-center">
				<Button
					href="/#contact"
					onclick={(e) => {
						e.preventDefault();
						contactModal.open();
					}}
				>
					<RollingText>Start the conversation</RollingText>
				</Button>
			</div>
		</div>
	</section>
</main>
