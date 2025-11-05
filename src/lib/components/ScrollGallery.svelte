<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	type GalleryImage = {
		src: string;
		alt: string;
		text?: string;
		srcset?: string;
		fallbackSrc?: string;
	};

	export let images: GalleryImage[] = [];
	export let minHeight = '240vh';
	export let title = 'We love hanging out together long after the laptops close.';

	const LAYER_1_COUNT = 6;
	const LAYER_2_COUNT = 6;
	const LAYER_3_COUNT = 2;
	const TOTAL_REQUIRED = LAYER_1_COUNT + LAYER_2_COUNT + LAYER_3_COUNT + 1;
	const layerImageSizes = '(min-width: 1024px) 18vw, (min-width: 640px) 32vw, 80vw';
	const centerImageSizes = '(min-width: 1024px) 60vw, 100vw';

	let normalizedImages: GalleryImage[] = [];
	let layer1Images: GalleryImage[] = [];
	let layer2Images: GalleryImage[] = [];
	let layer3Images: GalleryImage[] = [];
	let centerImage: GalleryImage | undefined;
	let hasImages = false;

	let sectionEl: HTMLElement | null = null;
	let observer: IntersectionObserver | null = null;
	let galleryVisible = !browser;

	const computeNormalizedImages = (source: GalleryImage[]) => {
		const list = Array.isArray(source) ? source : [];
		if (!list.length) return [];
		if (list.length >= TOTAL_REQUIRED) return list.slice(0, TOTAL_REQUIRED);
		return Array.from({ length: TOTAL_REQUIRED }, (_, index) => list[index % list.length]);
	};

	function handleImageError(event: Event, fallback?: string) {
		if (!fallback) return;
		const element = event.currentTarget as HTMLImageElement | null;
		if (!element || element.dataset.fallbackApplied === 'true') return;
		element.src = fallback;
		element.removeAttribute('srcset');
		element.dataset.fallbackApplied = 'true';
	}

	function activateGallery() {
		galleryVisible = true;
		if (observer) {
			observer.disconnect();
			observer = null;
		}
	}

	onMount(() => {
		if (!browser || galleryVisible) {
			return;
		}

		if ('IntersectionObserver' in globalThis) {
			observer = new IntersectionObserver(
				(entries) => {
					if (entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) {
						activateGallery();
					}
				},
				{ rootMargin: '200px 0px' }
			);

			if (sectionEl) {
				observer.observe(sectionEl);
			}
		} else {
			activateGallery();
		}

		return () => {
			if (observer) {
				observer.disconnect();
				observer = null;
			}
		};
	});

	$: normalizedImages = computeNormalizedImages(images);
	$: layer1Images = normalizedImages.slice(0, LAYER_1_COUNT);
	$: layer2Images = normalizedImages.slice(LAYER_1_COUNT, LAYER_1_COUNT + LAYER_2_COUNT);
	$: layer3Images = normalizedImages.slice(LAYER_1_COUNT + LAYER_2_COUNT, TOTAL_REQUIRED - 1);
	$: centerImage = normalizedImages.length
		? normalizedImages[normalizedImages.length - 1]
		: undefined;
	$: hasImages = Boolean(centerImage);
	$: if (observer && sectionEl && !galleryVisible) {
		observer.disconnect();
		observer.observe(sectionEl);
	}
</script>

<section class="scroll-gallery" style:--min-height={minHeight} bind:this={sectionEl}>
	<div class="content">
		{#if galleryVisible && hasImages && centerImage}
			<div class="grid">
				<!-- Layer 1: outer columns -->
				<div class="layer">
					{#each layer1Images as image}
						<div>
							<img
								src={image.src}
								alt={image.alt}
								loading="lazy"
								srcset={image.srcset}
								sizes={image.srcset ? layerImageSizes : undefined}
								on:error={(event) => handleImageError(event, image.fallbackSrc)}
							/>
							{#if image.text}
								<p class="caption text-primary">{image.text}</p>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Layer 2: middle columns -->
				<div class="layer">
					{#each layer2Images as image}
						<div>
							<img
								src={image.src}
								alt={image.alt}
								loading="lazy"
								srcset={image.srcset}
								sizes={image.srcset ? layerImageSizes : undefined}
								on:error={(event) => handleImageError(event, image.fallbackSrc)}
							/>
							{#if image.text}
								<p class="caption text-primary">{image.text}</p>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Layer 3: top and bottom center -->
				<div class="layer">
					{#each layer3Images as image}
						<div>
							<img
								src={image.src}
								alt={image.alt}
								loading="lazy"
								srcset={image.srcset}
								sizes={image.srcset ? layerImageSizes : undefined}
								on:error={(event) => handleImageError(event, image.fallbackSrc)}
							/>
							{#if image.text}
								<p class="caption text-primary">{image.text}</p>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Center scaler image -->
				<div class="scaler">
					<img
						src={centerImage.src}
						alt={centerImage.alt}
						loading="lazy"
						srcset={centerImage.srcset}
						sizes={centerImage.srcset ? centerImageSizes : undefined}
						on:error={(event) => handleImageError(event, centerImage.fallbackSrc)}
					/>
					{#if title}
						<div class="scaler__overlay">
							<div class="scaler__overlay-inner relative z-10 mx-auto max-w-6xl px-6 py-6">
								<h2
									class="scaler__headline m-0 mt-10 max-w-200 text-4xl leading-tight font-bold text-white sm:text-5xl md:text-6xl"
								>
									<span class="scaler__headline-text">{title}</span>
								</h2>
							</div>
						</div>
					{/if}
					{#if centerImage.text}
						<p class="caption text-primary">{centerImage.text}</p>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	.scroll-gallery {
		position: relative;
		min-height: var(--min-height, 240vh);
		--gap: clamp(10px, 3vw, 40px);
		--gutter: 2rem;
		--grid-padding: clamp(2rem, 4vw, 4rem); /* Padding around the final grid */
	}

	@media (max-width: 600px) {
		.scroll-gallery {
			--gutter: 1rem;
			--grid-padding: clamp(1rem, 3vw, 2rem);
		}
	}

	.content {
		min-height: 100vh;
		width: 100vw;
		display: flex;
		place-items: center;
		align-content: center;
		position: sticky;
		top: 0;
		overflow: hidden;
	}

	.grid {
		--offset: 0;
		width: min(1600px, calc(100vw - (2 * var(--grid-padding))));
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		grid-template-rows: repeat(3, auto);
		gap: var(--gap);
		margin: 0 auto;
		align-content: center;
		position: absolute;
		top: 50%;
		left: 50%;
		translate: -50% -50%;
		padding: var(--grid-padding);
	}

	@media (max-width: 600px) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
			--offset: -1;
		}

		.grid > div:nth-of-type(1) {
			display: none;
		}
	}

	.grid > .layer {
		display: grid;
		grid-column: 1 / -1;
		grid-row: 1 / -1;
		grid-template-columns: subgrid;
		grid-template-rows: subgrid;
	}

	/* Polaroid wrapper for grid images */
	.grid > .layer > div {
		background: white;
		padding: clamp(0.5rem, 1vw, 0.75rem); /* White frame around image */
		padding-bottom: clamp(0.8rem, 2.5vw, 1rem); /* Larger bottom padding like polaroid */
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(0.35rem, 0.8vw, 0.75rem);
		box-shadow:
			0 4px 6px rgba(0, 0, 0, 0.1),
			0 10px 20px rgba(0, 0, 0, 0.15);
		border-radius: 2px;
		transform: rotate(0deg);
		transition: transform 0.3s ease;
	}

	.grid > .layer > div:hover {
		transform: scale(1.05) rotate(0deg);
	}

	/* Add subtle random rotation to polaroids */
	.grid > .layer > div:nth-child(3n + 1) {
		transform: rotate(-2deg);
	}
	.grid > .layer > div:nth-child(3n + 2) {
		transform: rotate(1.5deg);
	}
	.grid > .layer > div:nth-child(3n + 3) {
		transform: rotate(-1deg);
	}

	/* Layer 1: columns 1 and 5 */
	.grid > div:nth-of-type(1) div:nth-of-type(odd) {
		grid-column: 1;
	}
	.grid > div:nth-of-type(1) div:nth-of-type(even) {
		grid-column: -2;
	}

	/* Layer 2: columns 2 and 4 */
	.grid > div:nth-of-type(2) div:nth-of-type(odd) {
		grid-column: calc(2 + var(--offset));
	}
	.grid > div:nth-of-type(2) div:nth-of-type(even) {
		grid-column: calc(-3 - var(--offset));
	}

	/* Layer 3: column 3 */
	.grid > div:nth-of-type(3) div {
		grid-column: calc(3 + var(--offset));
	}
	.grid > div:nth-of-type(3) div:last-of-type {
		grid-row: -1;
	}

	/* Center scaler */
	.scaler {
		/* Use absolute positioning to center in viewport, not grid */
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 2;
		/* Let the image determine size */
		width: max-content;
		height: max-content;
		background: transparent;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(0.35rem, 0.8vw, 0.75rem);
	}

	.scaler img {
		display: block;
		object-fit: cover;
		border-radius: clamp(0.8rem, 2vw, 1.2rem);
		/* Dimensions controlled by animation */
	}

	.scaler__overlay {
		position: absolute;
		inset: 0;
		display: block;
		pointer-events: none;
		z-index: 1;
	}

	.scaler__overlay-inner {
		width: 100%;
		display: inline-block;
		margin-left: 0;
		margin-right: auto;
	}

	.scaler__headline {
		display: inline-block;
		transform-origin: top left;
	}

	.scaler__headline-text {
		display: inline-block;
		transform-origin: top left;
		transform: scale(1);
		will-change: transform;
	}

	.grid img {
		width: 100%;
		aspect-ratio: 4 / 5;
		object-fit: cover;
		display: block; /* Remove any gaps below image */
		border-radius: 0; /* Remove border radius for polaroid look */
	}

	.caption {
		font-family: var(--font-fave-script);
		font-size: clamp(0.95rem, 1.6vw, 1.35rem);
		line-height: 1.1;
		text-align: center;
		letter-spacing: 0.01em;
		text-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
		transform: rotate(-1deg);
	}

	.grid > .layer > div:nth-child(3n + 2) .caption {
		transform: rotate(0.5deg);
	}

	.grid > .layer > div:nth-child(3n + 3) .caption {
		transform: rotate(-0.3deg);
	}

	/* Scroll animations */
	@keyframes fade {
		0%,
		30% {
			opacity: 0;
		}
	}

	@keyframes reveal {
		0%,
		30% {
			scale: 0;
		}
	}

	@keyframes scale-x {
		0%,
		10% {
			width: 100vw;
		}
		100% {
			/* Final width should match one grid column (accounting for padding and gaps) */
			width: calc((min(1600px, 100vw - (2 * var(--grid-padding))) - (4 * var(--gap))) / 5);
		}
	}

	@keyframes scale-y {
		0%,
		10% {
			height: 100dvh;
		}
		100% {
			/* Final height based on aspect ratio of grid cells */
			height: calc(
				((min(1600px, 100vw - (2 * var(--grid-padding))) - (4 * var(--gap))) / 5) * 1.25
			);
		}
	}

	@keyframes move-to-grid {
		0%,
		10% {
			transform: translate(-50%, -50%);
			padding: 0;
			box-shadow: none;
			border-radius: 0;
			background: transparent;
		}
		100% {
			/* Stay centered - the scaler is already absolutely positioned at center */
			transform: translate(-50%, -50%);
			padding: clamp(0.5rem, 1vw, 0.75rem); /* White frame around image */
			padding-bottom: clamp(0.8rem, 2.5vw, 1rem); /* Larger bottom padding like polaroid */
			box-shadow:
				0 4px 6px rgba(0, 0, 0, 0.1),
				0 10px 20px rgba(0, 0, 0, 0.15);
			border-radius: 2px;
			background: white;
		}
	}

	@keyframes scaler-headline-fade {
		0%,
		10% {
			opacity: 1;
			background-color: color-mix(in oklab, var(--color-background) /* #18191b */ 50%, transparent);
		}
		100% {
			opacity: 0;
			background-color: transparent;
		}
	}

	@keyframes scaler-headline-scale {
		0%,
		10% {
			transform: scale(1);
		}
		100% {
			transform: scale(0.001);
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		@supports (animation-timeline: scroll()) {
			.scroll-gallery {
				view-timeline: --gallery-scroll;
			}

			.scaler {
				animation-name: move-to-grid;
				animation-fill-mode: both;
				animation-timing-function: ease-out;
				animation-timeline: --gallery-scroll;
				animation-range: entry 100% exit -20%;
			}

			.scaler img {
				animation-name: scale-x, scale-y;
				animation-fill-mode: both;
				animation-timing-function: ease-out, ease-out;
				animation-timeline: --gallery-scroll, --gallery-scroll;
				animation-range: entry 100% exit -20%;
			}

			.grid .layer {
				animation-name: fade, reveal;
				animation-fill-mode: both;
				animation-timeline: --gallery-scroll, --gallery-scroll;
				animation-timing-function: ease-out, ease-out;
				animation-range: entry 100% exit 0%;
			}

			.scaler__overlay {
				animation-name: scaler-headline-fade;
				animation-fill-mode: both;
				animation-timing-function: ease-out;
				animation-timeline: --gallery-scroll;
				animation-range: entry 100% exit -20%;
			}

			.scaler__headline-text {
				animation-name: scaler-headline-scale;
				animation-fill-mode: both;
				animation-timing-function: ease-out;
				animation-timeline: --gallery-scroll;
				animation-range: entry 100% exit -20%;
			}

			/* Stagger layers */
			.grid .layer:nth-of-type(2) {
				animation-range: entry 100% exit -10%;
			}

			.grid .layer:nth-of-type(3) {
				animation-range: entry 100% exit -20%;
			}
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scaler img,
		.grid .layer {
			animation: none !important;
		}

		.scaler {
			background: white;
			padding: clamp(0.5rem, 1vw, 0.75rem);
			padding-bottom: clamp(0.8rem, 2.5vw, 1rem);
			box-shadow:
				0 4px 6px rgba(0, 0, 0, 0.1),
				0 10px 20px rgba(0, 0, 0, 0.15);
			border-radius: 2px;
		}

		.scaler__overlay {
			opacity: 1;
		}
	}
</style>
