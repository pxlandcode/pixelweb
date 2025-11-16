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
	import RollingText from '$components/rolling-text/RollingText.svelte';
	import IconPixelCode from '$lib/icons/IconPixelCode.svelte';
	import { soloImages } from '$lib/images/manifest';
	import worldclassUrl from '$lib/assets/worldclass.svg?url';
	import type { ImageId } from '$lib/images/definitions';
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import type { PageData } from './$types';
	import * as messages from '$lib/paraglide/messages';

	type Language = 'sv' | 'en';
	type MessageFn = (args?: Record<string, unknown>, options?: { locale?: Language }) => string;

	const heroSlideSpecs = [
		{ imageId: 'forrestPixel', altMessage: messages.preboard_hero_slide_1_alt },
		{ imageId: 'oliverShuffle', altMessage: messages.preboard_hero_slide_2_alt },
		{ imageId: 'pixelChristmas', altMessage: messages.preboard_hero_slide_3_alt },
		{ imageId: 'workHard', altMessage: messages.preboard_hero_slide_4_alt },
		{ imageId: 'weArePixel', altMessage: messages.preboard_hero_slide_5_alt },
		{ imageId: 'linusFrisbee', altMessage: messages.preboard_hero_slide_6_alt }
	] satisfies ReadonlyArray<{ imageId: ImageId; altMessage: MessageFn }>;

	const galleryImageSpecs = [
		[
			{ imageId: 'onboardDanny', altMessage: messages.preboard_gallery_image_1_alt },
			{ imageId: 'oliverAzraDiscussion', altMessage: messages.preboard_gallery_image_2_alt }
		],
		[
			{ imageId: 'pixelEating', altMessage: messages.preboard_gallery_image_3_alt },
			{ imageId: 'feelingsShuffle', altMessage: messages.preboard_gallery_image_4_alt }
		]
	] satisfies ReadonlyArray<ReadonlyArray<{ imageId: ImageId; altMessage: MessageFn }>>;

	const timelineStepsConfig = [
		{
			title: messages.preboard_timeline_step_1_title,
			subtitle: messages.preboard_timeline_step_1_subtitle,
			description: [
				messages.preboard_timeline_step_1_desc_1,
				messages.preboard_timeline_step_1_desc_2,
				messages.preboard_timeline_step_1_desc_3
			]
		},
		{
			title: messages.preboard_timeline_step_2_title,
			subtitle: messages.preboard_timeline_step_2_subtitle,
			description: [
				messages.preboard_timeline_step_2_desc_1,
				messages.preboard_timeline_step_2_desc_2
			]
		},
		{
			title: messages.preboard_timeline_step_3_title,
			subtitle: messages.preboard_timeline_step_3_subtitle,
			description: [
				messages.preboard_timeline_step_3_desc_1,
				messages.preboard_timeline_step_3_desc_2
			]
		},
		{
			title: messages.preboard_timeline_step_4_title,
			subtitle: messages.preboard_timeline_step_4_subtitle,
			description: [
				messages.preboard_timeline_step_4_desc_1,
				messages.preboard_timeline_step_4_desc_2
			]
		}
	];

	type ResourceConfig = {
		title: MessageFn;
		description: MessageFn[];
		link?: { href: string; label?: string; labelMessage?: MessageFn };
		contact?: { email: string; phone: string };
	};

	const resourceConfig: ResourceConfig[] = [
		{
			title: messages.preboard_resource_m365_title,
			description: [
				messages.preboard_resource_m365_desc_1,
				messages.preboard_resource_m365_desc_2,
				messages.preboard_resource_m365_desc_3
			],
			link: { label: 'https://office.com', href: 'https://office.com/' }
		},
		{
			title: messages.preboard_resource_discord_title,
			description: [
				messages.preboard_resource_discord_desc_1,
				messages.preboard_resource_discord_desc_2,
				messages.preboard_resource_discord_desc_3
			],
			link: {
				href: 'https://discord.gg/BSjy9EAj',
				labelMessage: messages.preboard_resource_discord_link_label
			}
		},
		{
			title: messages.preboard_resource_social_title,
			description: [messages.preboard_resource_social_desc_1],
			link: {
				label: 'LinkedIn.com/company/pixelandcode',
				href: 'https://www.linkedin.com/company/pixelandcode'
			}
		},
		{
			title: messages.preboard_resource_telephony_title,
			description: [
				messages.preboard_resource_telephony_desc_1,
				messages.preboard_resource_telephony_desc_2
			],
			contact: {
				email: 'Robert@comcenter.nu',
				phone: '08 692 43 01'
			}
		}
	];

	const faqConfig = [
		{ question: messages.preboard_faq_1_question, answer: messages.preboard_faq_1_answer },
		{ question: messages.preboard_faq_2_question, answer: messages.preboard_faq_2_answer },
		{ question: messages.preboard_faq_3_question, answer: messages.preboard_faq_3_answer },
		{ question: messages.preboard_faq_4_question, answer: messages.preboard_faq_4_answer },
		{ question: messages.preboard_faq_5_question, answer: messages.preboard_faq_5_answer },
		{ question: messages.preboard_faq_6_question, answer: messages.preboard_faq_6_answer },
		{ question: messages.preboard_faq_7_question, answer: messages.preboard_faq_7_answer },
		{ question: messages.preboard_faq_8_question, answer: messages.preboard_faq_8_answer },
		{ question: messages.preboard_faq_9_question, answer: messages.preboard_faq_9_answer },
		{ question: messages.preboard_faq_10_question, answer: messages.preboard_faq_10_answer },
		{ question: messages.preboard_faq_11_question, answer: messages.preboard_faq_11_answer }
	];

	const economyConfig = [
		{
			title: messages.preboard_economy_general_title,
			body: [
				messages.preboard_economy_general_line_1,
				messages.preboard_economy_general_line_2,
				messages.preboard_economy_general_line_3,
				messages.preboard_economy_general_line_4
			]
		},
		{
			title: messages.preboard_economy_expenses_title,
			body: [
				messages.preboard_economy_expenses_line_1,
				messages.preboard_economy_expenses_line_2,
				messages.preboard_economy_expenses_line_3
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

	const heroFormUrl = 'mailto:hello@pixelcode.se?subject=Preboarding%20basic%20information';
	const feedbackMailto =
		'mailto:hello@pixelcode.se?subject=Pixel%20%26%20Code%20preboarding%20feedback';

	let activeSlide = $state(0);
	let slideInterval: ReturnType<typeof setInterval> | null = null;
	let feedbackMessage = $state('');

	const { data } = $props<{ data: PageData }>();
	let language: Language = $state(data.lang);
	const unauthorized = $derived(Boolean(data.unauthorized));

	const localeOptions = $derived({ locale: language });

	const heroSlides = $derived(
		heroSlideSpecs
			.map(({ imageId, altMessage }) => {
				const asset = soloImages[imageId];
				if (!asset) return null;
				return { src: asset.src, alt: altMessage({}, localeOptions) };
			})
			.filter((slide): slide is { src: string; alt: string } =>
				Boolean(slide && typeof slide.src === 'string')
			)
	);

	const imagePairs = $derived(
		galleryImageSpecs
			.map((pair) =>
				pair
					.map(({ imageId, altMessage }) => {
						const asset = soloImages[imageId];
						if (!asset) return null;
						return { src: asset.src, alt: altMessage({}, localeOptions) };
					})
					.filter((image): image is { src: string; alt: string } =>
						Boolean(image && typeof image.src === 'string')
					)
			)
			.filter((pair) => pair.length)
	);

	const timelineSteps = $derived(
		timelineStepsConfig.map((step) => ({
			title: step.title({}, localeOptions),
			subtitle: step.subtitle({}, localeOptions),
			description: step.description.map((item) => item({}, localeOptions))
		}))
	);

	const resources = $derived(
		resourceConfig.map((resource) => ({
			title: resource.title({}, localeOptions),
			description: resource.description.map((item) => item({}, localeOptions)),
			link: resource.link
				? {
						href: resource.link.href,
						label: resource.link.labelMessage
							? resource.link.labelMessage({}, localeOptions)
							: (resource.link.label ?? '')
					}
				: undefined,
			contact: resource.contact
		}))
	);

	const faqItems = $derived(
		faqConfig.map((item) => ({
			question: item.question({}, localeOptions),
			answer: item.answer({}, localeOptions)
		}))
	);

	const economyDetails = $derived(
		economyConfig.map((item) => ({
			title: item.title({}, localeOptions),
			body: item.body.map((line) => line({}, localeOptions))
		}))
	);

	const heroParagraphs = $derived([
		messages.preboard_hero_paragraph_1({}, localeOptions),
		messages.preboard_hero_paragraph_2({}, localeOptions),
		messages.preboard_hero_paragraph_3({}, localeOptions)
	]);

	const pageTitle = $derived(messages.preboard_page_title({}, localeOptions));
	const heroBadge = $derived(messages.preboard_hero_badge({}, localeOptions));
	const heroTitle = $derived(messages.preboard_hero_title({}, localeOptions));
	const heroPrimaryCta = $derived(messages.preboard_hero_primary_cta({}, localeOptions));
	const heroSecondaryCta = $derived(messages.preboard_hero_secondary_cta({}, localeOptions));
	const alertCopy = $derived(messages.preboard_alert_message({}, localeOptions));
	const timelineLabel = $derived(messages.preboard_timeline_label({}, localeOptions));
	const timelineHeader = $derived(messages.preboard_timeline_title({}, localeOptions));
	const timelineIntro = $derived(messages.preboard_timeline_intro({}, localeOptions));
	const resourcesLabel = $derived(messages.preboard_resources_label({}, localeOptions));
	const resourcesTitle = $derived(messages.preboard_resources_title({}, localeOptions));
	const resourcesIntro = $derived(messages.preboard_resources_intro({}, localeOptions));
	const storyLabel = $derived(messages.preboard_story_label({}, localeOptions));
	const storyTitle = $derived(messages.preboard_story_title({}, localeOptions));
	const storyParagraphs = $derived([
		messages.preboard_story_paragraph_1({}, localeOptions),
		messages.preboard_story_paragraph_2({}, localeOptions)
	]);
	const storyImageAlt = $derived(messages.preboard_story_image_alt({}, localeOptions));
	const faqLabel = $derived(messages.preboard_faq_label({}, localeOptions));
	const faqTitle = $derived(messages.preboard_faq_title({}, localeOptions));
	const economyLabel = $derived(messages.preboard_economy_label({}, localeOptions));
	const economyTitle = $derived(messages.preboard_economy_title({}, localeOptions));
	const contactLabel = $derived(messages.preboard_contact_label({}, localeOptions));
	const contactTitle = $derived(messages.preboard_contact_title({}, localeOptions));
	const contactButton = $derived(messages.preboard_contact_button({}, localeOptions));
	const contactPeopleTitle = $derived(messages.preboard_contact_people_title({}, localeOptions));
	const emailLabel = $derived(messages.preboard_label_email({}, localeOptions));
	const phoneLabel = $derived(messages.preboard_label_phone({}, localeOptions));
	const orgLabel = $derived(messages.preboard_label_org({}, localeOptions));
	const feedbackTitleCopy = $derived(messages.preboard_feedback_title({}, localeOptions));
	const feedbackDescription = $derived(messages.preboard_feedback_description({}, localeOptions));
	const feedbackLabelCopy = $derived(messages.preboard_feedback_label({}, localeOptions));
	const feedbackPlaceholder = $derived(messages.preboard_feedback_placeholder({}, localeOptions));
	const feedbackCta = $derived(messages.preboard_feedback_cta({}, localeOptions));
	const linkedinLabel = $derived(messages.preboard_linkedin_label({}, localeOptions));
	const linkedinTitle = $derived(messages.preboard_linkedin_title({}, localeOptions));
	const linkedinDescription = $derived(messages.preboard_linkedin_description({}, localeOptions));
	const linkedinCta = $derived(messages.preboard_linkedin_cta({}, localeOptions));
	const footerNotice = $derived(messages.preboard_footer_notice({}, localeOptions));
	const footerPrivacy = $derived(messages.preboard_footer_privacy({}, localeOptions));
	const languageToggleAria = $derived(messages.preboard_language_toggle_sr({}, localeOptions));
	const languageCode = $derived(language.toUpperCase());
	const nextLanguage = $derived((language === 'sv' ? 'en' : 'sv') as Language);
	const toggleBackgroundClass = $derived(
		language === 'sv'
			? 'bg-[#003b8e] hover:bg-[#0a4eb5]'
			: 'bg-white hover:bg-white/90 border border-[#002f92]'
	);
	const toggleIconColor = $derived(language === 'sv' ? 'text-[#ffd200]' : 'text-[#003dff]');
	const toggleTextColor = $derived(language === 'sv' ? 'text-[#ffd200]' : 'text-[#ff003c]');

	const feedbackHref = $derived(
		`${feedbackMailto}&body=${encodeURIComponent(feedbackMessage ?? '')}`
	);

	const PixelCodeLucideIcon = IconPixelCode as unknown as (typeof import('lucide-svelte'))['Icon'];

	function switchLanguage(next: Language) {
		if (language === next) return;
		language = next;
		if (browser) {
			const url = new URL(window.location.href);
			url.searchParams.set('lang', next);
			window.history.replaceState({}, '', `${url.pathname}${url.search}`);
		}
	}

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
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<div class="min-h-screen bg-white pb-24 text-text">
	<section
		class="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-background"
	>
		<button
			type="button"
			class={`group absolute top-6 right-6 z-20 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-white transition ${toggleBackgroundClass} cursor-pointer`}
			aria-label={languageToggleAria}
			on:click={() => switchLanguage(nextLanguage)}
		>
			<RollingText>
				<Icon icon={PixelCodeLucideIcon} size="md" class={`${toggleIconColor}`} />
			</RollingText>
			<span class={`text-sm font-semibold tracking-[0.4em] uppercase ${toggleTextColor}`}
				>{languageCode}</span
			>
		</button>
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
			<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<Badge variant="info" size="xs" class="w-fit tracking-[0.3em] text-white uppercase">
					{heroBadge}
				</Badge>
			</div>
			<div class="space-y-4">
				<h1 class="text-3xl font-semibold sm:text-5xl">{heroTitle}</h1>
				<div class="space-y-4 text-base text-white/90 sm:text-lg">
					{#each heroParagraphs as copy, idx}
						<p class={idx === heroParagraphs.length - 1 ? 'font-semibold text-white' : ''}>
							{copy}
						</p>
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
					{heroPrimaryCta}
				</Button>
				<Button
					variant="ghost"
					size="md"
					href="https://www.linkedin.com/company/pixelandcode"
					target="_blank"
					rel="noopener noreferrer"
					class="border border-white/60 bg-transparent text-white hover:bg-white/10"
				>
					{heroSecondaryCta}
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
				<p class="text-sm">{alertCopy}</p>
			</Alert>
		</div>
	{/if}

	<section class="bg-background text-white">
		<div class="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-20 sm:px-6 lg:px-8">
			<header
				class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
				transition:fly={{ y: 40, duration: 350 }}
			>
				<div class="space-y-2">
					<p class="text-sm tracking-[0.35em] text-white/60 uppercase">{timelineLabel}</p>
					<h2 class="text-3xl font-semibold sm:text-4xl">{timelineHeader}</h2>
					<p class="text-base text-white/80">{timelineIntro}</p>
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
								<p class="text-xs tracking-wide text-white/70 uppercase">{step.subtitle}</p>
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
					<p class="text-sm tracking-[0.35em] text-white/60 uppercase">{resourcesLabel}</p>
					<h2 class="text-3xl font-semibold text-white">{resourcesTitle}</h2>
					<p class="text-base text-white/70">{resourcesIntro}</p>
				</header>

				<Card
					class="overflow-hidden border border-white/10 bg-white/5 p-0 text-white backdrop-blur-xl"
				>
					{#each resources as resource, index}
						<Accordion
							label={resource.title}
							open={index === 0}
							class="text-left text-white"
							content-classes="border-t border-white/5 bg-white/5 px-4"
						>
							<div class="space-y-3 px-4 py-4 text-sm text-white/80">
								{#each resource.description as detail}
									<p>{detail}</p>
								{/each}

								{#if resource.contact}
									<div
										class="rounded-lg border border-white/10 bg-white/5 p-3 text-xs tracking-[0.3em] text-white/60 uppercase"
									>
										<p>{emailLabel}: {resource.contact.email}</p>
										<p>{phoneLabel}: {resource.contact.phone}</p>
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
					<p class="text-sm tracking-[0.35em] text-white/60 uppercase">{storyLabel}</p>
					<h2 class="text-3xl font-semibold">{storyTitle}</h2>
					{#each storyParagraphs as paragraph}
						<p class="text-base text-white/75">{paragraph}</p>
					{/each}
				</div>
				<div>
					<img
						src={worldclassUrl}
						alt={storyImageAlt}
						class="h-full w-full object-contain p-6 transition duration-500 hover:scale-105"
						loading="lazy"
					/>
				</div>
			</section>

			<section class="space-y-6">
				<header>
					<p class="text-sm tracking-[0.35em] text-white/60 uppercase">{faqLabel}</p>
					<h2 class="text-3xl font-semibold">{faqTitle}</h2>
				</header>
				<Card class="border border-white/10 bg-white/5 p-0 text-white backdrop-blur-xl">
					{#each faqItems as item}
						<Accordion
							label={item.question}
							class="text-left text-white"
							content-classes="border-t border-white/5 bg-white/5 px-4 "
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
				<p class="text-sm tracking-[0.35em] text-white/60 uppercase">{economyLabel}</p>
				<h2 class="text-3xl font-semibold text-white">{economyTitle}</h2>
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
					<p class="text-sm tracking-[0.35em] text-white/60 uppercase">{contactLabel}</p>
					<h2 class="text-3xl font-semibold">{contactTitle}</h2>
				</header>

				<div class="grid gap-6 md:grid-cols-2">
					<Card class="border border-white/10 bg-[#111216]/80 p-6 text-white backdrop-blur-xl">
						<h3 class="text-xl font-semibold">{companyInfo.name}</h3>
						<div class="mt-3 space-y-2 text-sm text-white/75">
							{#each companyInfo.address as line}
								<p>{line}</p>
							{/each}
							<p>{orgLabel}: {companyInfo.orgNumber}</p>
							<p>{emailLabel}: {companyInfo.email}</p>
						</div>
						<Button
							variant="ghost"
							href="mailto:hello@pixelcode.se"
							class="mt-4 w-fit border border-white/20 bg-white/10 text-white hover:bg-white/20"
						>
							{contactButton}
						</Button>
					</Card>

					<Card class="border border-white/10 bg-[#111216]/80 p-6 text-white backdrop-blur-xl">
						<h3 class="text-xl font-semibold">{contactPeopleTitle}</h3>
						<div class="mt-4 space-y-4">
							{#each contactPeople as person}
								<div class="space-y-1 text-sm text-white/75">
									<p class="font-semibold text-white">{person.name}</p>
									<p>{phoneLabel}: {person.phone}</p>
									<p>{emailLabel}: {person.email}</p>
								</div>
							{/each}
						</div>
					</Card>
				</div>
			</section>

			<section class="grid gap-6 lg:grid-cols-2">
				<Card class="border border-white/10 bg-[#111216]/80 p-6 text-white backdrop-blur-xl">
					<h3 class="text-2xl font-semibold">{feedbackTitleCopy}</h3>
					<p class="mt-2 text-sm text-white/75">{feedbackDescription}</p>
					<form class="mt-4 space-y-4">
						<FormControl label={feedbackLabelCopy} class="text-sm text-white/70">
							<TextArea
								name="feedback"
								rows={5}
								bind:value={feedbackMessage}
								placeholder={feedbackPlaceholder}
								class="border border-white/10 bg-white/5 text-white placeholder:text-white/50"
							/>
						</FormControl>
						<Button
							variant="primary"
							href={feedbackHref}
							class="bg-primary text-white hover:bg-[#ff765a]"
						>
							{feedbackCta}
						</Button>
					</form>
				</Card>

				<Card class="border border-white/10 bg-[#111216]/80 p-6 text-white backdrop-blur-xl">
					<div class="space-y-3">
						<p class="text-sm tracking-[0.35em] text-white/60 uppercase">{linkedinLabel}</p>
						<h3 class="text-2xl font-semibold">{linkedinTitle}</h3>
						<p class="text-sm text-white/75">{linkedinDescription}</p>
						<Button
							variant="ghost"
							href="https://www.linkedin.com/company/pixelandcode"
							target="_blank"
							rel="noopener noreferrer"
							class="w-fit border border-white/20 bg-white/10 text-white hover:bg-white/20"
						>
							{linkedinCta}
						</Button>
					</div>
				</Card>
			</section>

			<footer
				class="flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-white/60 md:flex-row md:items-center md:justify-between"
			>
				<p>{footerNotice}</p>
				<a
					class="text-white hover:text-primary"
					href="https://pixelcode.se/privacy/"
					target="_blank"
					rel="noopener noreferrer"
				>
					{footerPrivacy}
				</a>
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
