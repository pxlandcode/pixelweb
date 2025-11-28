<script lang="ts">
	import type { ResumeData, LocalizedText } from '$lib/types/resume';
	import { soloImages } from '$lib/images/manifest';
	import pixelcodeLogoDark from '$lib/assets/pixelcodelogodark.svg?url';

	type ImageResource = (typeof soloImages)[keyof typeof soloImages];
	type Language = 'sv' | 'en';

	let {
		data,
		image,
		language = 'sv'
	}: {
		data: ResumeData;
		image?: ImageResource;
		language?: Language;
	} = $props();

	// Helper to resolve localized text
	const t = (text: LocalizedText | undefined): string => {
		if (!text) return '';
		if (typeof text === 'string') return text;
		return text[language] ?? text.sv ?? '';
	};

	// Format date for display (e.g., "Jan 2020")
	const formatDate = (dateString: string | null | undefined): string => {
		if (!dateString) return language === 'sv' ? 'Nuvarande' : 'Present';
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return dateString;
		const month = date.toLocaleDateString(language === 'sv' ? 'sv-SE' : 'en-US', {
			month: 'short'
		});
		const year = date.getFullYear();
		return `${month} ${year}`;
	};

	// Toggle language
	const toggleLanguage = () => {
		language = language === 'sv' ? 'en' : 'sv';
	};
</script>

<div class="resume-print-page relative bg-white p-10 text-slate-900 shadow-sm">
	<!-- Language Toggle -->
	<div class="absolute top-4 right-4 z-10 print:hidden">
		<button
			type="button"
			class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
			onclick={toggleLanguage}
		>
			<span class={language === 'sv' ? 'font-bold text-indigo-600' : 'text-slate-500'}>SV</span>
			<span class="text-slate-300">/</span>
			<span class={language === 'en' ? 'font-bold text-indigo-600' : 'text-slate-500'}>EN</span>
		</button>
	</div>

	<!-- Header Section -->
	<div class="header-top">
		<!-- Brand -->
		<div class="header-brand mb-6 text-center">
			<img src={pixelcodeLogoDark} alt="Pixel & Code" class="mx-auto h-8" />
			<p
				class="-mt-1 -rotate-10 text-2xl text-primary"
				style="font-family: 'Fave Script', cursive;"
			>
				proudly presents
			</p>
		</div>

		<!-- Two Column Layout (matching ConsultantProfile) -->
		<div class="header-grid grid flex-1 grid-cols-1 gap-8 md:grid-cols-[180px_1fr]">
			<!-- Left Column: Image + Skills + Contact -->
			<div class="consultant-profile">
				<!-- Profile Image (matching ConsultantProfile.svelte) -->
				<div
					class="relative aspect-square w-full flex-shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white"
				>
					{#if image}
						<img
							src={image.src}
							srcset={image.srcset}
							alt={data.name || 'Profile'}
							class="h-full w-full object-cover object-center"
							loading="lazy"
							decoding="async"
						/>
					{:else}
						<div
							class="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-400"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-20 w-20"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
								/>
							</svg>
						</div>
					{/if}
				</div>

				<!-- Example Skills (pills that wrap) -->
				{#if data.exampleSkills.length > 0}
					<div class="flex-shrink-0 rounded-md bg-slate-50 p-4">
						<p class="mb-3 text-xs font-semibold tracking-wide text-slate-700 uppercase">
							{language === 'sv' ? 'Exempel på färdigheter' : 'Examples of skills'}
						</p>
						<div class="flex flex-wrap gap-1">
							{#each data.exampleSkills as skill}
								<span class="rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-700">{skill}</span>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Contact (matching ConsultantProfile.svelte) -->
				{#if data.contacts.length > 0}
					<div class="flex-shrink-0 space-y-3 rounded-md bg-slate-50 p-4">
						{#each data.contacts as contact}
							<div class="space-y-1">
								<p class="text-xs font-semibold tracking-wide text-slate-600 uppercase">
									{language === 'sv' ? 'Kontakt' : 'Contact'}
								</p>
								<div class="space-y-2 text-sm text-slate-800">
									<div class="leading-tight">
										<p class="text-sm font-medium">{contact.name}</p>
										{#if contact.phone}<p class="text-xs text-slate-600">{contact.phone}</p>{/if}
										{#if contact.email}<p class="text-xs text-slate-600">{contact.email}</p>{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Right Column: Name + Summary + Highlighted Experience -->
			<div class="space-y-6">
				<!-- Name and Title -->
				<div>
					{#if data.name}
						<h1 class="mb-2 text-4xl font-bold text-slate-900">{data.name}</h1>
					{/if}
					<h2 class="text-xl font-medium text-slate-700">{t(data.title)}</h2>
				</div>

				<!-- Summary -->
				<div class="text-sm leading-relaxed text-slate-700">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html t(data.summary)}
				</div>

				<!-- Highlighted Experience (matching HighlightedExperience.svelte) -->
				{#if data.highlightedExperiences.length > 0}
					<div class="space-y-4">
						<h3 class="pt-4 text-base font-bold tracking-wide text-slate-900 uppercase">
							{language === 'sv' ? 'Utvald Erfarenhet' : 'Highlighted Experience'}
						</h3>

						{#each data.highlightedExperiences as exp}
							<div class="space-y-3">
								<div>
									<p class="text-sm font-semibold text-slate-900">{exp.company}</p>
									<p class="text-sm text-slate-700 italic">{t(exp.role)}</p>
								</div>
								<div class="experience-description text-sm leading-relaxed text-slate-700">
									<!-- eslint-disable-next-line svelte/no-at-html-tags -->
									{@html t(exp.description)}
								</div>
								{#if exp.technologies.length > 0}
									<div class="space-y-1">
										<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
											Technologies
										</p>
										<div class="flex flex-wrap gap-2">
											{#each exp.technologies as tech}
												<span class="rounded bg-slate-100 px-3 py-1 text-xs text-slate-800"
													>{tech}</span
												>
											{/each}
										</div>
									</div>
								{/if}
								{#if exp.testimonial}
									<blockquote
										class="border-l-2 border-orange-400 pl-3 text-sm text-slate-600 italic"
									>
										{t(exp.testimonial)}
									</blockquote>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Previous Experience Section (matching ExperienceSection + ExperienceItem) -->
	{#if data.experiences.length > 0}
		<section class="resume-print-section mt-8">
			<!-- Section Header with dividers (matching ExperienceSection.svelte) -->
			<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
				<h2 class="text-base font-bold text-slate-900 uppercase">
					{language === 'sv' ? 'Tidigare Erfarenheter' : 'Previous Experience'}
				</h2>
				<div class="flex items-center">
					<div class="h-px w-full bg-orange-500"></div>
				</div>
				<div class="flex items-center">
					<div class="h-px flex-1 bg-slate-300"></div>
				</div>
			</div>

			<div class="mt-4 space-y-6">
				{#each data.experiences as exp}
					<!-- Experience Item (matching ExperienceItem.svelte) -->
					<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
						<!-- Column 1: Empty -->
						<div></div>

						<!-- Column 2: Period, Company, Location -->
						<div class="space-y-1">
							<p class="text-sm font-semibold text-slate-900">
								<span class="whitespace-nowrap">{formatDate(exp.startDate)}</span>
								{#if exp.endDate}
									<span> - </span>
									<span class="whitespace-nowrap">{formatDate(exp.endDate)}</span>
								{/if}
							</p>
							<p class="text-sm font-semibold text-slate-900">{exp.company}</p>
							{#if exp.location}
								<p class="text-sm text-slate-700">{t(exp.location)}</p>
							{/if}
						</div>

						<!-- Column 3: Role, Description, Technologies -->
						<div class="space-y-3">
							<h3 class="text-base font-bold break-words hyphens-auto text-slate-900" lang="en">
								{t(exp.role)}
							</h3>
							<div
								class="text-sm leading-relaxed break-words hyphens-auto text-slate-700"
								lang="en"
							>
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html t(exp.description)}
							</div>
							{#if exp.technologies.length > 0}
								<div class="flex flex-wrap gap-2">
									{#each exp.technologies as tech}
										<span class="rounded bg-slate-100 px-3 py-1 text-xs text-slate-800">{tech}</span
										>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Skills Section (matching SkillsCategorized with pills for techniques/methods) -->
	{#if data.techniques.length > 0 || data.methods.length > 0}
		<section class="resume-print-section mt-8">
			<!-- Section Header with dividers -->
			<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
				<h2 class="text-base font-bold text-slate-900 uppercase">
					{language === 'sv' ? 'Kompetenser' : 'Skills'}
				</h2>
				<div class="flex items-center">
					<div class="h-px w-full bg-orange-500"></div>
				</div>
				<div class="flex items-center">
					<div class="h-px flex-1 bg-slate-300"></div>
				</div>
			</div>

			<div class="mt-4 space-y-4">
				{#if data.techniques.length > 0}
					<!-- Techniques Row (matching SkillsCategorized with skipFirstColumn) -->
					<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
						<div></div>
						<p class="pt-1 text-xs font-bold tracking-wide text-slate-700 uppercase">
							{language === 'sv' ? 'Tekniker' : 'Techniques'}
						</p>
						<div class="flex flex-wrap gap-2">
							{#each data.techniques as tech}
								<span class="rounded bg-slate-100 px-3 py-1 text-xs text-slate-800">{tech}</span>
							{/each}
						</div>
					</div>
				{/if}

				{#if data.methods.length > 0}
					<!-- Methods Row -->
					<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
						<div></div>
						<p class="pt-1 text-xs font-bold tracking-wide text-slate-700 uppercase">
							{language === 'sv' ? 'Metoder' : 'Methods'}
						</p>
						<div class="flex flex-wrap gap-2">
							{#each data.methods as method}
								<span class="rounded bg-slate-100 px-3 py-1 text-xs text-slate-800">{method}</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</section>
	{/if}

	<!-- Other Section (Languages, Education, Portfolio - matching SkillsCategorized) -->
	{#if data.languages.length > 0 || data.education.length > 0 || (data.portfolio && data.portfolio.length > 0)}
		<section class="resume-print-section mt-8">
			<!-- Section Header with dividers -->
			<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
				<h2 class="text-base font-bold text-slate-900 uppercase">
					{language === 'sv' ? 'Övrigt' : 'Other'}
				</h2>
				<div class="flex items-center">
					<div class="h-px w-full bg-orange-500"></div>
				</div>
				<div class="flex items-center">
					<div class="h-px flex-1 bg-slate-300"></div>
				</div>
			</div>

			<div class="mt-4 space-y-4">
				{#if data.languages.length > 0}
					<!-- Languages Row (matching SkillsCategorized isLanguage) -->
					<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
						<div></div>
						<p class="pt-1 text-xs font-bold tracking-wide text-slate-700 uppercase">
							{language === 'sv' ? 'Språk' : 'Languages'}
						</p>
						<div class="flex flex-col gap-1 text-sm text-slate-800">
							{#each data.languages as lang}
								<p>
									<span class="font-bold">{t(lang.label)}</span>: {t(lang.value)}
								</p>
							{/each}
						</div>
					</div>
				{/if}

				{#if data.education.length > 0}
					<!-- Education Row (matching SkillsCategorized isEducation) -->
					<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
						<div></div>
						<p class="pt-1 text-xs font-bold tracking-wide text-slate-700 uppercase">
							{language === 'sv' ? 'Utbildning' : 'Education'}
						</p>
						<div class="flex flex-col gap-1 text-sm text-slate-800">
							{#each data.education as edu}
								<p>
									<span class="font-semibold">{edu.label}</span>
									{#if t(edu.value)}<span>: {t(edu.value)}</span>{/if}
								</p>
							{/each}
						</div>
					</div>
				{/if}

				{#if data.portfolio && data.portfolio.length > 0}
					<!-- Portfolio Row (matching SkillsCategorized isPortfolio) -->
					<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
						<div></div>
						<p class="pt-1 text-xs font-bold tracking-wide text-slate-700 uppercase">Portfolio</p>
						<div class="flex flex-wrap gap-2 text-sm text-slate-800">
							{#each data.portfolio as url}
								<a
									href={url}
									target="_blank"
									rel="noopener noreferrer"
									class="underline decoration-slate-400 underline-offset-2 hover:decoration-slate-700"
									>{url}</a
								>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</section>
	{/if}

	<!-- Footer -->
	{#if data.footerNote}
		<div class="mt-8 border-t border-slate-200 pt-4 text-center text-sm text-slate-500 italic">
			{t(data.footerNote)}
		</div>
	{/if}
</div>

<style>
	.consultant-profile {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	:global(.experience-description blockquote) {
		border-left-width: 2px;
		border-color: rgb(251 146 60);
		padding-left: 0.75rem;
		font-size: 0.875rem;
		color: rgb(51 65 85);
		font-style: italic;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
		position: relative;
	}
	:global(.experience-description blockquote::before) {
		content: '"';
	}
	:global(.experience-description blockquote::after) {
		content: '"';
	}
</style>
