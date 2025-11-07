<script lang="ts">
	import { soloImages } from '$lib/images/manifest';

	const leftImage = soloImages.ivoGladShuffle;
	const rightImage = soloImages.gang;

	const bodyTextPart1 =
		"with lots of freedom and the strength of trusted partners. Our work spans banking, insurance, the public sector, and growing ventures. What connects it all is curiosity and the drive to make things work better, not just look better. Here, you'll find space to learn, experiment, and evolve.";

	const bodyTextPart2 =
		"We keep things transparent, from pay to process, so everyone knows where they stand and what we're building toward.";
</script>

<section class="relative w-full bg-background text-white">
	<div class="mx-auto max-w-7xl px-6 py-16 md:py-20 lg:py-24">
		<!-- Main headline with animation -->
		<h2
			class="headline-motion m-0 mx-auto max-w-3xl text-left text-5xl leading-tight font-semibold
             whitespace-pre-line text-white sm:text-5xl md:text-6xl lg:text-[3.5rem]"
		>
			Pixel&Code_ began as a simple idea. A place where good people and meaningful work meet.
		</h2>

		<!-- Sticky section with images and text -->
		<div class="sticky-section-wrapper">
			<div class="sticky-section-content">
				<!-- Images section -->
				<div
					class="mt-20 grid gap-6 md:mt-28 md:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)] md:items-start md:pl-12 lg:pl-20"
				>
					<img
						src={leftImage.src}
						srcset={leftImage.srcset}
						alt={leftImage.alt}
						class="image-left aspect-[3/4] w-full max-w-xs border border-white/5 object-cover shadow-lg"
						loading="lazy"
					/>
					<img
						src={rightImage.src}
						srcset={rightImage.srcset}
						alt={rightImage.alt}
						class="image-right aspect-video w-full border border-white/5 object-cover object-top shadow-lg"
						loading="lazy"
					/>
				</div>

				<!-- Bottom text section with scroll reveal -->
				<div
					class="mt-16 grid gap-8 md:mt-20 md:grid-cols-[minmax(0,0.25fr)_minmax(0,1fr)] md:items-start"
				>
					<p class="label-text text-sm font-semibold tracking-[0.35em] text-primary uppercase"></p>
					<div class="body-text-container space-y-6 text-base leading-relaxed md:text-lg">
						<p class="body-text font-regular">
							<span class="font-semibold text-primary">And now we're a small company </span>
							<span class="tab-space"></span>{#each bodyTextPart1.split('') as char, i}<span
									class="char"
									style="animation-delay: {i * 0.002}s">{char}</span
								>{/each}
						</p>
						<p class="body-text font-regular">
							{#each bodyTextPart2.split('') as char, i}<span
									class="char"
									style="animation-delay: {(bodyTextPart1.length + i) * 0.002}s">{char}</span
								>{/each}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	:global(:root) {
		--about-motion-ease: cubic-bezier(0.16, 1, 0.3, 1);
	}

	/* Headline animation - rises up on scroll (matches ImageFeaturePair) */
	.headline-motion {
		--headline-shift: clamp(5rem, 12vw, 8rem);
		translate: 0 var(--headline-shift);
		animation: headline-rise 1.4s var(--about-motion-ease) forwards;
		animation-delay: 0.1s;
		will-change: translate;
	}

	/* Use scroll-driven animation when supported */
	@supports (animation-timeline: view()) {
		.headline-motion {
			animation-delay: 0s;
			animation-timeline: view(block);
			animation-range: entry 70% contain 40%;
		}
	}

	/* Images animation with scroll support */
	.image-left,
	.image-right {
		--image-distance: clamp(4rem, 10vw, 8rem);
		translate: 0 var(--image-distance);
		animation: image-pull 1.8s var(--about-motion-ease) forwards;
		will-change: translate;
		view-timeline-name: --image;
		view-timeline-axis: block;
	}

	.image-left {
		animation-delay: 0.2s;
	}

	.image-right {
		animation-delay: 0.6s;
	}

	@supports (animation-timeline: view()) {
		.image-left,
		.image-right {
			animation-delay: 0s;
			animation-timeline: --image;
		}

		.image-left {
			animation-range: entry 40% contain 25%;
		}

		.image-right {
			animation-range: entry 70% contain 45%;
		}
	}

	/* Label text animation */
	.label-text {
		--label-distance: clamp(3rem, 8vw, 6rem);
		translate: 0 var(--label-distance);
		animation: label-pull 1.4s var(--about-motion-ease) forwards;
		animation-delay: 0.6s;
		will-change: translate;
	}

	/* Sticky scroll wrapper for entire section (images + text) */
	.sticky-section-wrapper {
		min-height: 200vh;
		position: relative;
	}

	.sticky-section-content {
		position: sticky;
		top: 10vh;
		padding-bottom: 2rem;
	}

	/* Body text container */
	.body-text-container {
		view-timeline-name: --body-text;
		view-timeline-axis: block;
	}

	.body-text {
		display: block;
	}

	/* Tab space after orange label */
	.tab-space {
		display: inline-block;
		width: 10ch;
	}

	/* Individual characters - start gray and animate to white */
	.char {
		color: rgb(255 255 255 / 0.3);
		animation: char-reveal 0.4s var(--about-motion-ease) forwards;
		animation-timeline: --body-text;
		animation-range: contain 10% contain 90%;
	}

	/* Fallback for browsers without scroll-driven animations */
	@supports not (animation-timeline: view()) {
		.char {
			animation-timeline: auto;
		}
	}

	@keyframes char-reveal {
		from {
			color: rgb(255 255 255 / 0.3);
		}
		to {
			color: rgb(255 255 255 / 1);
		}
	}

	@keyframes headline-rise {
		from {
			translate: 0 var(--headline-shift);
		}
		to {
			translate: 0;
		}
	}

	@keyframes image-pull {
		from {
			translate: 0 var(--image-distance);
		}
		to {
			translate: 0;
		}
	}

	@keyframes label-pull {
		from {
			translate: 0 var(--label-distance);
		}
		to {
			translate: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.headline-motion,
		.image-left,
		.image-right,
		.label-text,
		.char {
			animation: none;
			translate: none;
		}

		.char {
			color: rgb(255 255 255 / 1);
		}
	}
</style>
