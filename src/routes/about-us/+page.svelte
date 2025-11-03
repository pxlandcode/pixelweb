<script lang="ts">
	import asset from '$lib/images/asset.jpg';
	import ecommerce from '$lib/images/ecommerce.png';
	import meetingRoom from '$lib/images/meeting-room.jpg';
	import workLife from '$lib/images/work-life.jpg';
	import { Button } from '@pixelcode_/blocks/components';
	import { ScrollGallery } from '$lib/components';
	import karaoke from '$lib/images/scrollgallery/karaoke.jpg';
	import workhard from '$lib/images/scrollgallery/workhard.jpg';
	import AnimatedHeadline from '$components/animated-headline/AnimatedHeadline.svelte';
	import DiscordCulture from '$components/discord-culture/DiscordCulture.svelte';

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
	<section
		class="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 bg-background px-6 pt-24 pb-24 text-center text-white md:px-12 lg:px-20 lg:pt-32 lg:pb-28"
	>
		<div
			class="inline-flex items-center gap-3 rounded-full border border-white/20 px-5 py-2 text-xs font-semibold tracking-[0.35em] uppercase"
		>
			<span class="inline-block h-2 w-2 rounded-full border border-white/60"></span>
			<span>About</span>
		</div>

		<h1 class="text-4xl leading-[1.05] font-semibold text-balance md:text-6xl lg:text-7xl">
			<span class="block font-bold">Revolutionizing B2B Marketing</span>
			<span
				class="mt-4 block text-5xl font-normal italic md:text-[64px]"
				style="font-family: var(--font-fave-script);"
			>
				since 2019
			</span>
		</h1>

		<p class="max-w-2xl text-lg leading-relaxed">
			Pixel&amp;Code is home to 25 passionate specialists with expertise across strategy, design,
			and engineering—partners who bring clarity and momentum to every engagement.
		</p>

		<div
			class="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-end sm:gap-10"
		>
			<div class="hidden sm:block sm:translate-y-6">
				<img
					src={workLife}
					alt="Pixel&Code teammates celebrating a launch"
					class="aspect-[4/5] w-40 rounded-[1.75rem] border border-white/10 object-cover"
				/>
			</div>

			<div class="mx-auto w-full max-w-md">
				<img
					src={asset}
					alt="Inside the Pixel&Code studio"
					class="aspect-[4/3] w-full rounded-[2.5rem] border border-white/10 object-cover"
				/>
			</div>

			<div class="hidden sm:block sm:translate-y-6">
				<img
					src={meetingRoom}
					alt="Collaborative workshop in progress"
					class="aspect-[4/5] w-40 rounded-[1.75rem] border border-white/10 object-cover"
				/>
			</div>
		</div>

		<p class="max-w-xl text-base">
			We collaborate across disciplines to transform ambitious ideas into measurable results for
			each client we support.
		</p>

		<a href="#culture" class="inline-flex items-center gap-3 text-sm font-semibold">
			<span>Discover more</span>
			<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="h-5 w-5 stroke-current">
				<path d="M12 5v14m0 0-5-5m5 5 5-5" stroke-width="1.8" stroke-linecap="round" />
			</svg>
		</a>
	</section>

	<!-- Stats Section -->
	<section class="mx-auto w-full max-w-7xl px-6 py-16 md:px-12 lg:px-20">
		<ul
			class="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12"
			role="list"
			aria-label="Company statistics"
		>
			{#each stats as stat}
				<li class="flex flex-col gap-2 text-center">
					<span class="text-4xl font-bold text-primary md:text-5xl">{stat.value}</span>
					<span class="text-sm text-[#a1a1aa] md:text-base">{stat.label}</span>
				</li>
			{/each}
		</ul>
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
