<script lang="ts">
	import {
		Accordion,
		Alert,
		Badge,
		Button,
		Icon,
		Card,
		FormControl,
		TextArea
	} from '@pixelcode_/blocks/components';
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import IconPixelCode from '$lib/icons/IconPixelCode.svelte';

	const heroSlides = [
		{
			src: 'https://pixelcode.se/wp-content/uploads/2023/10/grupp_ute_Ivo_Danny_1.jpeg',
			alt: 'Team hangout in the sun'
		},
		{
			src: 'https://pixelcode.se/wp-content/uploads/2023/10/Oliver_Pierre_1.jpeg',
			alt: 'Oliver and Pierre at the office'
		},
		{
			src: 'https://pixelcode.se/wp-content/uploads/2023/10/Azra_terrass_vision_1.jpeg',
			alt: 'Azra sharing product vision on the terrace'
		},
		{
			src: 'https://pixelcode.se/wp-content/uploads/2023/10/Pierre_fokus_terrass_1.jpeg',
			alt: 'Pierre focused on the onboarding kit'
		},
		{
			src: 'https://pixelcode.se/wp-content/uploads/2023/10/Nicklas_Jocke_1.jpeg',
			alt: 'Nicklas and Joakim talking strategy'
		},
		{
			src: 'https://pixelcode.se/wp-content/uploads/2023/10/terrass_Pierre_Ivo_1.jpeg',
			alt: 'Pierre and Ivo collaborating outdoors'
		}
	];

	const heroParagraphs = [
		"Welcome to Pixel&Code and this preboarding express! We're so thrilled to have you on board. Our aim is to integrate you into the team, starting right now. This page outlines your journey from the day of your contract signing to your start date.",
		'Our employees are our greatest asset and we are committed to create a workplace that inspires and offers competitive compensation, success and well-being. We encourage open communication, teamwork, and mutual respect. We prioritize work-life balance and we foster a culture of professional development, innovation and creativity.',
		"Before we start, if you haven't already done so, please take a moment to fill out this form with your basic information."
	];

	type TimelineStep = {
		title: string;
		subtitle: string;
		description: string[];
	};

	const timelineSteps: TimelineStep[] = [
		{
			title: '1. Get started',
			subtitle: 'Things we can do right away.',
			description: [
				'We want you to become a part of the team as soon as possible. Access to your email, Discord, Microsoft 365 account and more will be provided within a couple of weeks.',
				'We will create your first Pixel&Code CV for you so that we are ready when an exciting client reaches out.',
				"You also have the opportunity to be paired with a buddy. This Pixel&Code insider is available as your personal guide if you choose to use them. They're here to lend a hand, answer questions, and support you in a way that feels comfortable."
			]
		},
		{
			title: '2. Meet the team',
			subtitle: 'You will get invited to events.',
			description: [
				'You will get invited to various social events. This is an opportunity for you to form early connections, learn from others, and start feeling like part of the team.',
				"We're excited to introduce you to all of us. Remember, while we encourage participation, all of the activities are optional."
			]
		},
		{
			title: '3. Get involved',
			subtitle: 'Get a head start.',
			description: [
				"Hopefully you'll hear more about possible assignments that could be relevant to you before your first day. You might even have the opportunity to do an interview.",
				'We always include you in our dialogues with clients regarding possible assignments. It is important that the assignment and client culture feels right and fun.'
			]
		},
		{
			title: '4. Onboarding',
			subtitle: 'Your first day — woho!',
			description: [
				'On your first day we walk through everything you need to know. Details may vary a little depending on assignments, but the core is the same.',
				'If you start on a customer assignment day one, we plan the details with you to make it as smooth as possible. Oh, and lunch is on us!'
			]
		}
	];

	const resources = [
		{
			title: 'Microsoft 365 (email etc)',
			description: [
				'You get your very own Microsoft 365 license with Outlook, Teams, Word, PowerPoint and Excel.',
				'Email address: firstname.lastname@pixelcode.se. Username: your email address.',
				'Default password will be sent separately. Change it when you log in for the first time.'
			],
			link: { label: 'https://office.com', href: 'https://office.com/' }
		},
		{
			title: 'Discord',
			description: [
				'Discord is our primary tool for day-to-day communication.',
				'You will be invited to our server within a couple of weeks.',
				"Our server: https://discord.gg/BSjy9EAj — come say hi when you're inside."
			],
			link: { label: 'Join our Discord', href: 'https://discord.gg/BSjy9EAj' }
		},
		{
			title: 'Our social media',
			description: [
				'We currently focus on LinkedIn. Follow us to stay in the loop and help boost the team.'
			],
			link: {
				label: 'LinkedIn.com/company/pixelandcode',
				href: 'https://www.linkedin.com/company/pixelandcode'
			}
		},
		{
			title: 'Telephony (Telefon och mobilabonnemang)',
			description: [
				'Our partner in mobile telephony, for both phones and subscriptions, is Comcenter.',
				'They will help you with new contracts, transferring an existing number, or anything else you need. Reach out before purchasing so we can guide you on preferred stores and agreements.'
			],
			contact: {
				email: 'Robert@comcenter.nu',
				phone: '08 692 43 01'
			}
		}
	];

	const faqItems = [
		{
			question: 'When will I get access to my email and Discord?',
			answer:
				"You'll get access to your work email and other tools like Discord and Microsoft 365 as soon as possible, but it will be within a few weeks from your signing date."
		},
		{
			question: 'Who will be my point of contact during the preboarding process?',
			answer:
				'Your main points of contact are your buddy and your hiring manager. They will guide and support you every step of the way.'
		},
		{
			question: 'What kind of information do I need to provide in the personal information form?',
			answer:
				'We need the basics needed to create your staff card. This includes bank account details, emergency contact, Social Security Number and similar essentials.'
		},
		{
			question: "What happens if I can't attend a social event?",
			answer:
				'All activities are optional. We understand everyone has different commitments and schedules, and we schedule several events so everyone has opportunities to join when they can.'
		},
		{
			question: 'Who will be my buddy and how will they support me?',
			answer:
				'We offer a buddy based on your experience and profile, someone who can provide valuable support and insights. Use the relationship how you feel comfortable. We even suggest buddy lunches (our treat) as a relaxed way to get to know each other.'
		},
		{
			question: 'What kind of tasks might I be involved in before my first day?',
			answer:
				'Besides social events and chatting with future colleagues, we include you in our client dialogues regarding potential assignments. It is important that you find the assignment and client culture engaging and enjoyable.'
		},
		{
			question: 'What should I expect on my first day?',
			answer:
				'We make sure you feel welcome and set up for success. We guide you through system access, time reporting, expense registration, and more. We also make the day enjoyable and treat you to a relaxed lunch.'
		},
		{
			question: 'How does it work with computers, phones, and other tools when I start?',
			answer:
				'We value individual choices. If you have great hardware already, feel free to keep using it. If you are missing something, you can purchase it and expense it against your budget. Contact us before purchasing so we can guide you.'
		},
		{
			question: 'How does it work with mobile subscriptions?',
			answer:
				'You can continue using your existing plan and expense it monthly. Our partner can also help you find a new plan linked to the company. Email Robert@comcenter.nu or call 08 692 43 01 for support.'
		},
		{
			question: 'How about education and courses?',
			answer:
				'It depends on your compensation model. The flexible model gives you a personal budget to use as you see fit. The fixed model includes an annual SEK 12,000 education budget.'
		},
		{
			question: 'Who can I contact if I have questions about the handling of my personal info?',
			answer:
				"If you have any questions about how we handle your personal information, contact your hiring manager. We're here to help."
		}
	];

	const economyDetails = [
		{
			title: 'General questions regarding expenses & invoices',
			body: [
				'If you have questions, contact your hiring manager first.',
				'Our economy team helps with expenses, invoices and all financial nuts and bolts.',
				'Email: pixelcode@customer.kleer.se · Phone: 08 400 260 40.',
				'Invoices can be sent to pixelcode@invoice.kleer.se. Make sure your name is clearly stated so we know who did what.'
			]
		},
		{
			title: 'Expenses',
			body: [
				'Digital receipts from websites, email or apps can be emailed to kvitton@expense.kleer.se from your Pixel&Code email address.',
				'You can also upload receipts directly in PE via drag and drop.',
				'Paper receipts can be photographed in the PE app and do not need to be saved afterward.'
			]
		}
	];

	const companyInfo = {
		name: 'Pixel&Code AB',
		address: ['Tegnérgatan 34', '113 59 Stockholm'],
		orgNumber: '559420-6400',
		email: 'hello@pixelcode.se'
	};

	const contactPeople = [
		{
			name: 'Ivo Lesz Svedberg',
			phone: '073 041 22 00',
			email: 'ivo.lesz@pixelcode.se'
		},
		{
			name: 'Nicklas Arleij',
			phone: '070 645 00 03',
			email: 'nicklas.arleij@pixelcode.se'
		}
	];

	const imagePairs = [
		[
			{
				src: 'https://pixelcode.se/wp-content/uploads/2023/01/hero_2_2-1024x585.jpg',
				alt: 'Team moments in our first office'
			},
			{
				src: 'https://pixelcode.se/wp-content/uploads/2023/10/Oliver_Bill_1.jpeg',
				alt: 'Oliver and Bill preparing equipment'
			}
		],
		[
			{
				src: 'https://pixelcode.se/wp-content/uploads/2023/10/Azra_skratt_1.jpeg',
				alt: 'Azra sharing feedback'
			},
			{
				src: 'https://pixelcode.se/wp-content/uploads/2023/10/Nicklas_Orjan_1.jpeg',
				alt: 'Nicklas and Örjan planning the next event'
			}
		]
	];

	const heroFormUrl = 'mailto:hello@pixelcode.se?subject=Preboarding%20basic%20information';
	const feedbackMailto =
		'mailto:hello@pixelcode.se?subject=Pixel%20%26%20Code%20preboarding%20feedback';

	let activeSlide = $state(0);
	let slideInterval: ReturnType<typeof setInterval> | null = null;
	let feedbackMessage = $state('');

	onMount(() => {
		if (heroSlides.length <= 1) return;
		slideInterval = setInterval(() => {
			activeSlide = (activeSlide + 1) % heroSlides.length;
		}, 6000);
	});

	onDestroy(() => {
		if (slideInterval) {
			clearInterval(slideInterval);
		}
	});
	const unauthorized = $derived($page.url.searchParams.get('unauthorized'));
	const feedbackHref = $derived(
		`${feedbackMailto}&body=${encodeURIComponent(feedbackMessage ?? '')}`
	);
	const PixelCodeLucideIcon = IconPixelCode as unknown as (typeof import('lucide-svelte'))['Icon'];
</script>

<svelte:head>
	<title>Pixel&Code — Preboarding</title>
</svelte:head>

<div class="min-h-screen bg-white pb-24 text-text">
	<section
		class="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-black"
	>
		{#each heroSlides as slide, index}
			<div
				class={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ${
					index === activeSlide ? 'opacity-100' : 'opacity-0'
				}`}
				style={`background-image: linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0.75)), url('${slide.src}')`}
				role="img"
				aria-label={slide.alt}
			></div>
		{/each}

		<div class="relative z-10 mx-auto flex max-w-5xl flex-col gap-6 px-6 text-white">
			<Badge variant="info" size="xs" class="w-fit tracking-[0.3em] text-white uppercase"
				>Preboarding express</Badge
			>
			<div class="space-y-4">
				<h1 class="text-3xl font-semibold sm:text-5xl">Welcome to the team</h1>
				<div class="space-y-4 text-base text-white/90 sm:text-lg">
					{#each heroParagraphs as copy, idx}
						<p class={idx === heroParagraphs.length - 1 ? 'font-medium text-white' : ''}>{copy}</p>
					{/each}
				</div>
			</div>

			<div class="flex flex-wrap gap-4">
				<Button
					variant="primary"
					size="md"
					href={heroFormUrl}
					class="bg-primary text-white hover:bg-[#ff765a]"
				>
					Your basic information
				</Button>
				<Button
					variant="ghost"
					size="md"
					href="https://www.linkedin.com/company/pixelandcode"
					target="_blank"
					rel="noopener noreferrer"
					class="border border-white/60 bg-transparent text-white hover:bg-white/10"
				>
					LinkedIn
				</Button>
			</div>
		</div>
	</section>

	{#if unauthorized}
		<div class="mx-auto w-full max-w-6xl px-4 pt-12 sm:px-6 lg:px-8">
			<Alert
				variant="warning"
				size="sm"
				class="border border-amber-100 bg-amber-50/90 text-amber-900 backdrop-blur"
			>
				<p class="text-sm">
					You do not have permission to open that admin area. This preboarding space is always here
					for you instead.
				</p>
			</Alert>
		</div>
	{/if}

	<section class="bg-[#0f0f11] text-white">
		<div class="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-20 sm:px-6 lg:px-8">
			<header
				class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
				transition:fly={{ y: 40, duration: 350 }}
			>
				<div class="space-y-2">
					<p class="text-sm tracking-[0.35em] text-white/60 uppercase">Timeline</p>
					<h2 class="text-3xl font-semibold sm:text-4xl">What happens now?</h2>
					<p class="text-base text-white/80">
						We start integrating you today. Follow the steps to know exactly what's next before day
						one.
					</p>
				</div>
				<Icon icon={PixelCodeLucideIcon} class="h-20 w-20 text-white/70 md:h-28 md:w-28" />
			</header>

			<div class="space-y-6">
				{#each timelineSteps as step, index}
					<div class="flex flex-col items-center gap-6">
						{#if index === 0}
							<div class="flex flex-col items-center">
								<div class="h-3 w-3 bg-primary"></div>

								<div
									class="h-12 border-r-4 border-dashed border-primary"
									style="border-image: repeating-linear-gradient(to bottom, #f35b3f 0, #f35b3f 4px, transparent 4px, transparent 8px) 1"
								></div>
								<div
									class="size-0 border-t-[10px] border-r-[8px] border-l-[8px] border-t-primary border-r-transparent border-l-transparent"
								></div>
							</div>
						{/if}
						<article
							class="w-full border border-primary bg-[#151619]/85 p-6 backdrop-blur"
							transition:fly={{ y: 40, duration: 350, delay: 120 * (index + 1) }}
						>
							<div class="flex flex-wrap items-center justify-between gap-3">
								<h3 class="text-xl font-semibold">{step.title}</h3>
								<p class="text-xs tracking-wide text-white/70 uppercase">
									{step.subtitle}
								</p>
							</div>
							<ul class="mt-4 space-y-3 text-sm text-white/85">
								{#each step.description as paragraph}
									<li>{paragraph}</li>
								{/each}
							</ul>
						</article>

						{#if index < timelineSteps.length - 1}
							<div class="flex flex-col items-center">
								<div
									class="h-6 border-r-4 border-dashed border-primary"
									style="border-image: repeating-linear-gradient(to bottom, #f35b3f 0, #f35b3f 4px, transparent 4px, transparent 8px) 1"
								></div>
								<Icon icon={PixelCodeLucideIcon} class="mt-1 mb-2 text-primary" size="md" />
								<div
									class="h-6 border-r-4 border-dashed border-primary"
									style="border-image: repeating-linear-gradient(to bottom, #f35b3f 0, #f35b3f 4px, transparent 4px, transparent 8px) 1"
								></div>
								<div
									class="size-0 border-t-[10px] border-r-[8px] border-l-[8px] border-t-primary border-r-transparent border-l-transparent"
								></div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</section>
	<section class="bg-background text-white">
		<div class="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-20 sm:px-6 lg:px-8">
			<section class="space-y-8">
				<header class="space-y-2">
					<p class="text-sm tracking-[0.35em] text-white/60 uppercase">Resources</p>
					<h2 class="text-3xl font-semibold text-white">The basic resources</h2>
					<p class="text-base text-white/70">
						The essentials you need to plug in quickly. Expand a topic to see the nitty-gritty
						details.
					</p>
				</header>

				<Card
					class="overflow-hidden border border-white/10 bg-white/5 p-0 text-white backdrop-blur-xl"
				>
					{#each resources as resource, index}
						<Accordion
							label={resource.title}
							open={index === 0}
							class="text-left text-white"
							content-classes="border-t border-white/5 bg-white/5 px-4 pb-5"
						>
							<div class="space-y-3 px-4 py-4 text-sm text-white/80">
								{#each resource.description as detail}
									<p>{detail}</p>
								{/each}

								{#if resource.contact}
									<div
										class="rounded-lg border border-white/10 bg-white/5 p-3 text-xs tracking-[0.3em] text-white/60 uppercase"
									>
										<p>Email: {resource.contact.email}</p>
										<p>Phone: {resource.contact.phone}</p>
									</div>
								{/if}

								{#if resource.link}
									<Button
										variant="ghost"
										href={resource.link.href}
										target="_blank"
										rel="noopener noreferrer"
										class="w-fit border border-white/20 bg-white/10 text-sm text-white hover:bg-white/20"
									>
										{resource.link.label}
									</Button>
								{/if}
							</div>
						</Accordion>
					{/each}
				</Card>
			</section>

			<section class="grid gap-8 lg:grid-cols-[2fr,3fr] lg:items-center">
				<div
					class="space-y-4 rounded-3xl border border-white/10 bg-[#111216]/80 p-6 shadow-2xl shadow-black/40 backdrop-blur"
				>
					<p class="text-sm tracking-[0.35em] text-white/60 uppercase">Who we are</p>
					<h2 class="text-3xl font-semibold">Why Pixel&Code exists</h2>
					<p class="text-base text-white/75">
						Pixel&Code was founded to revolutionize and simplify the tech consulting industry. Our
						mission is to bring together a world-class team and offer unparalleled opportunities for
						personal and professional growth.
					</p>
					<p class="text-base text-white/75">
						We believe inspired employees create inspired clients, and together we can deliver
						world-class results. Competitive compensation, meaningful benefits and a truly inspiring
						work environment are the pillars we build on.
					</p>
				</div>
				<div
					class="overflow-hidden rounded-3xl border border-white/10 bg-[#0b0c10] shadow-2xl shadow-black/40"
				>
					<img
						src="https://pixelcode.se/wp-content/uploads/2023/01/hero_2_2-1024x585.jpg"
						alt="Team collaborating in the lounge"
						class="h-full w-full object-cover opacity-90 transition duration-500 hover:scale-105"
						loading="lazy"
					/>
				</div>
			</section>

			<section class="space-y-6">
				<header>
					<p class="text-sm tracking-[0.35em] text-white/60 uppercase">FAQ</p>
					<h2 class="text-3xl font-semibold">Questions we often get</h2>
				</header>
				<Card class="border border-white/10 bg-white/5 p-0 text-white backdrop-blur-xl">
					{#each faqItems as item}
						<Accordion
							label={item.question}
							class="text-left text-white"
							content-classes="border-t border-white/5 bg-white/5 px-4 pb-4"
						>
							<p class="px-4 py-4 text-sm text-white/80">{item.answer}</p>
						</Accordion>
					{/each}
				</Card>
			</section>

			{#each imagePairs as pair}
				<section class="grid gap-4 md:grid-cols-2">
					{#each pair as image}
						<div
							class="overflow-hidden rounded-3xl border border-white/10 bg-[#0b0c10] shadow-2xl shadow-black/40"
						>
							<img
								src={image.src}
								alt={image.alt}
								class="h-full w-full object-cover transition duration-500 hover:scale-105"
								loading="lazy"
							/>
						</div>
					{/each}
				</section>
			{/each}

			<section class="space-y-4 text-white/75">
				<p class="text-sm tracking-[0.35em] text-white/60 uppercase">Economy</p>
				<h2 class="text-3xl font-semibold text-white">
					Only the essentials, the rest arrives during onboarding.
				</h2>
			</section>

			<section class="grid gap-6 md:grid-cols-2">
				{#each economyDetails as note}
					<Card class="border border-white/10 bg-[#111216]/80 p-6 text-white backdrop-blur-xl">
						<h3 class="text-xl font-semibold">{note.title}</h3>
						<ul class="mt-4 space-y-3 text-sm text-white/75">
							{#each note.body as bullet}
								<li class="flex gap-2">
									<span class="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
									<span>{bullet}</span>
								</li>
							{/each}
						</ul>
					</Card>
				{/each}
			</section>

			<section class="space-y-6">
				<header class="space-y-2">
					<p class="text-sm tracking-[0.35em] text-white/60 uppercase">
						General contact information
					</p>
					<h2 class="text-3xl font-semibold">Need help? Reach out anytime.</h2>
				</header>

				<div class="grid gap-6 md:grid-cols-2">
					<Card class="border border-white/10 bg-[#111216]/80 p-6 text-white backdrop-blur-xl">
						<h3 class="text-xl font-semibold">{companyInfo.name}</h3>
						<div class="mt-3 space-y-2 text-sm text-white/75">
							{#each companyInfo.address as line}
								<p>{line}</p>
							{/each}
							<p>Org nr: {companyInfo.orgNumber}</p>
							<p>Email: {companyInfo.email}</p>
						</div>
						<Button
							variant="ghost"
							href="mailto:hello@pixelcode.se"
							class="mt-4 w-fit border border-white/20 bg-white/10 text-white hover:bg-white/20"
						>
							Email us
						</Button>
					</Card>

					<Card class="border border-white/10 bg-[#111216]/80 p-6 text-white backdrop-blur-xl">
						<h3 class="text-xl font-semibold">People team</h3>
						<div class="mt-4 space-y-4">
							{#each contactPeople as person}
								<div class="space-y-1 text-sm text-white/75">
									<p class="font-semibold text-white">{person.name}</p>
									<p>Phone: {person.phone}</p>
									<p>Email: {person.email}</p>
								</div>
							{/each}
						</div>
					</Card>
				</div>
			</section>

			<section class="grid gap-6 lg:grid-cols-2">
				<Card class="border border-white/10 bg-[#111216]/80 p-6 text-white backdrop-blur-xl">
					<h3 class="text-2xl font-semibold">Feedback makes us stronger</h3>
					<p class="mt-2 text-sm text-white/75">
						Missing something? Share feedback and help us improve this experience for the next
						teammate.
					</p>
					<form class="mt-4 space-y-4">
						<FormControl
							label="How can this preboarding page get better?"
							class="text-sm text-white/70"
						>
							<TextArea
								name="feedback"
								rows={5}
								bind:value={feedbackMessage}
								placeholder="Missing something? Let us know!"
								class="border border-white/10 bg-white/5 text-white placeholder:text-white/50"
							/>
						</FormControl>
						<Button
							variant="primary"
							href={feedbackHref}
							class="bg-primary text-white hover:bg-[#ff765a]"
						>
							Send feedback
						</Button>
					</form>
				</Card>

				<Card class="border border-white/10 bg-[#111216]/80 p-6 text-white backdrop-blur-xl">
					<div class="space-y-3">
						<p class="text-sm tracking-[0.35em] text-white/60 uppercase">
							With a license to be awesome
						</p>
						<h3 class="text-2xl font-semibold">We are here to support your journey.</h3>
						<p class="text-sm text-white/75">
							Stay connected with us on LinkedIn for news, events and glimpses into life at
							Pixel&Code.
						</p>
						<Button
							variant="ghost"
							href="https://www.linkedin.com/company/pixelandcode"
							target="_blank"
							rel="noopener noreferrer"
							class="w-fit border border-white/20 bg-white/10 text-white hover:bg-white/20"
						>
							LinkedIn
						</Button>
					</div>
				</Card>
			</section>

			<footer
				class="flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-white/60 md:flex-row md:items-center md:justify-between"
			>
				<p>© 2025 Pixel&Code AB – All rights reserved.</p>
				<a
					class="text-white hover:text-primary"
					href="https://pixelcode.se/privacy/"
					target="_blank"
					rel="noopener noreferrer">Privacy policy</a
				>
			</footer>
		</div>
	</section>
</div>

<style>
	:global(.preboard-section) {
		position: relative;
		background-color: #0f0f11;
		transition: background-color 0.6s ease;
	}

	:global(.preboard-section--alt) {
		background-color: white;
		color: #0f0f11;
	}

	@supports (animation-timeline: view()) {
		:global(.preboard-section) {
			animation: sectionDark 1ms linear both;
			animation-timeline: view();
			animation-range: entry 0% exit 100%;
		}

		:global(.preboard-section--alt) {
			animation-name: sectionLight;
		}

		@keyframes sectionDark {
			0%,
			100% {
				background-color: #0f0f11;
				color: white;
			}
			50% {
				background-color: #0f0f11;
				color: white;
			}
		}

		@keyframes sectionLight {
			0% {
				background-color: #0f0f11;
				color: white;
			}
			35%,
			65% {
				background-color: white;
				color: #0f0f11;
			}
			100% {
				background-color: #0f0f11;
				color: white;
			}
		}
	}

	:global(.timeline-card) {
		opacity: 0;
		transform: translateY(40px);
		transition:
			opacity 0.4s ease,
			transform 0.4s ease;
	}

	:global(.timeline-connector),
	:global(.timeline-arrow) {
		opacity: 0;
		transform: translateY(20px);
		transition:
			opacity 0.4s ease,
			transform 0.4s ease;
	}

	@supports not (animation-timeline: view()) {
		:global(.timeline-card),
		:global(.timeline-connector),
		:global(.timeline-arrow) {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@supports (animation-timeline: view()) {
		:global(.timeline-card) {
			animation: cardReveal 1ms ease-out both;
			animation-timeline: view();
			animation-range: entry 0% exit 40%;
		}

		:global(.timeline-connector),
		:global(.timeline-arrow) {
			animation: connectorReveal 1ms ease-out both;
			animation-timeline: view();
			animation-range: entry 0% exit 30%;
		}
	}

	@keyframes cardReveal {
		from {
			opacity: 0;
			transform: translateY(40px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes connectorReveal {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
