<script lang="ts">
	import { RollingText } from '$components/rolling-text';
	import type { NavLink } from '$types';
	import footerImageUrl from '$lib/assets/footerimage.svg?url';
	type Props = {
		links?: NavLink[];
	};

	let { links = [] }: Props = $props();
</script>

<footer class="border-t border-white/10 bg-background text-[#f0f0f0]">
	<div
		class="mx-auto flex w-full flex-col gap-12 px-6 py-16 md:flex-row md:justify-between md:gap-16 md:px-16"
	>
		<figure class="flex w-full justify-center md:w-auto md:justify-start">
			<img
				src={footerImageUrl}
				alt="Pixel & Code logomark"
				class="max-h-[450px] w-full object-contain"
				loading="lazy"
			/>
		</figure>

		<div class="flex w-full flex-col justify-between gap-12 md:flex-1 md:gap-16">
			<div class="md: flex w-full flex-row">
				<nav class="flex-1 pl-20">
					<ul
						class="flex flex-col flex-wrap justify-center gap-x-8 gap-y-4 text-left font-medium tracking-[0.04em] text-white/70 uppercase md:justify-center md:text-sm"
					>
						{#each links as { label, href }}
							<li>
								<a
									class="group inline-flex items-center transition-colors hover:text-white focus-visible:text-white"
									{href}
								>
									<RollingText text={label} size="3xl" />
								</a>
							</li>
						{/each}
					</ul>
				</nav>

				<div
					class="flex w-full max-w-xs flex-col items-center gap-4 text-center text-sm text-white/70 md:items-end md:text-left"
				>
					<p class="w-full text-left text-base font-medium text-white">Why Pixel&Code?</p>

					<p>
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
					<div class="flex h-full w-full flex-col justify-end pt-10 text-left">
						<a
							class="tracking-[0.08em] text-white/70 uppercase transition-colors hover:text-primary focus-visible:text-primary"
							href="https://maps.app.goo.gl/L9eSZFmUp4ZVzMYz6"
							><RollingText size="sm" text="Tegnergatan 34" /></a
						>
						<a
							class="tracking-[0.08em] text-white/70 uppercase transition-colors hover:text-primary focus-visible:text-primary"
							href="mailto:hello@pixelcode.se"
							><RollingText size="sm" text="hello@pixelcode.se" /></a
						>
						<a
							href="tel:+46763407237"
							class="tracking-[0.08em] text-white/70 uppercase transition-colors hover:text-primary focus-visible:text-primary"
						>
							<RollingText size="sm" text="+46 76 340 72 37" />
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</footer>
