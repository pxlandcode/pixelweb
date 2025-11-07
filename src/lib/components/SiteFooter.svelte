<script lang="ts">
	import { RollingText } from '$components/rolling-text';
	import type { NavLink } from '$types';
	import worldclassUrl from '$lib/assets/worldclass.svg?url';
	import InteractiveBackground from './backgrounds/InteractiveBackground.svelte';
	import { page } from '$app/stores';
	import { contactModal } from '$lib/stores/contactModal';

	type Props = {
		links?: NavLink[];
	};

	let { links = [] }: Props = $props();

	function handleLinkClick(e: MouseEvent, href: string) {
		if (href === '#contact') {
			e.preventDefault();
			contactModal.open();
			return;
		}

		// Check if it's an internal anchor link (starts with /#)
		if (href.startsWith('/#')) {
			const targetId = href.slice(2); // Remove the '/#'
			const currentPath = $page.url.pathname;

			// If we're on the home page, smooth scroll to the element
			if (currentPath === '/') {
				e.preventDefault();
				const targetElement = document.getElementById(targetId);
				if (targetElement) {
					targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			}
			// If on another page, SvelteKit will navigate and jump to the anchor
		}
	}
</script>

<footer class="relative border-t border-white/10 bg-background text-[#f0f0f0]">
	<InteractiveBackground squareColor="rgba(255,255,255,0.9)" pathColor="#F1674A" />
	<div
		class="mx-auto flex w-full flex-col gap-8 px-4 py-12 md:flex-row md:justify-between md:gap-16 md:px-16 md:py-16"
	>
		<figure class="flex w-full justify-center md:w-auto md:justify-start">
			<img
				src={worldclassUrl}
				alt="Worldclass Tech, Worldclass People"
				class="max-h-[300px] w-full object-contain md:max-h-[300px]"
				loading="lazy"
			/>
		</figure>

		<div class="flex w-full flex-col justify-between gap-8 md:flex-1 md:gap-16">
			<div class="flex w-full flex-col gap-8 md:flex-row">
				<nav class="flex-1 md:pl-20">
					<ul
						class="flex flex-col flex-wrap justify-start gap-x-8 gap-y-3 text-left font-medium tracking-[0.04em] text-white/70 uppercase md:justify-center md:gap-y-4 md:text-sm"
					>
						{#each links as { label, href }}
							<li>
								<a
									class="group inline-flex items-center transition-colors hover:text-white focus-visible:text-white"
									{href}
									onclick={(e) => handleLinkClick(e, href)}
								>
									<RollingText text={label} size="3xl" />
								</a>
							</li>
						{/each}
					</ul>
				</nav>

				<div
					class="flex w-full max-w-xs flex-col items-start gap-4 text-left text-sm text-white/70 md:items-end md:text-left"
				>
					<p class="w-full text-left text-base font-medium text-white">Why Pixel&Code?</p>

					<p class="text-sm leading-relaxed md:text-base">
						Pixel&Code was founded with the goal of revolutionizing and simplifying the tech
						consulting industry. Our mission is to bring together a world class team of the most
						competent individuals in our field and offer them unparalleled opportunities for
						personal and professional growth
					</p>
					<!-- <p class="text-base font-medium text-white">
						Let's build something users can't stop talking about.
					</p>
					<p>
						We partner with teams of all sizes to ship standout products with measurable impact.
					</p> -->
					<!-- <a
						class="group inline-flex items-center gap-2 font-medium tracking-[0.08em] text-white uppercase transition-colors hover:text-[#f35b3f] focus-visible:text-[#f35b3f]"
						href={ctaHref}
					>
						<RollingText text={ctaLabel} size="sm" />
						<span aria-hidden="true" class="text-base">&rarr;</span>
					</a> -->
					<div class="flex h-full w-full flex-col justify-end gap-1 pt-6 text-left md:pt-10">
						<a
							class="text-sm tracking-[0.08em] text-white/70 uppercase transition-colors hover:text-primary focus-visible:text-primary md:text-base"
							href="https://maps.app.goo.gl/L9eSZFmUp4ZVzMYz6"
							><RollingText size="sm" text="Tegnergatan 34" /></a
						>
						<a
							class="text-sm tracking-[0.08em] text-white/70 uppercase transition-colors hover:text-primary focus-visible:text-primary md:text-base"
							href="mailto:hello@pixelcode.se"
							><RollingText size="sm" text="hello@pixelcode.se" /></a
						>
						<a
							href="tel:+46706450003"
							class="text-sm tracking-[0.08em] text-white/70 uppercase transition-colors hover:text-primary focus-visible:text-primary md:text-base"
						>
							<RollingText size="sm" text="+46 70-645 00 03" />
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</footer>
