<script lang="ts">
	export let imageSrc: string;
	export let title: string; // large white text over the image
	export let subtitle: string = ''; // optional, smaller line under the title
	export let parallax = 0.25; // 0–1 (how much the image moves while scrolling)
</script>

<!-- Wrapper -->
<section
	class="image-headline relative isolate h-dvh w-full overflow-hidden bg-black"
	style={`--parallax-strength: ${parallax};`}
>
	<!-- Parallax image -->
	<div
		class="parallax-image absolute transform-gpu will-change-transform"
		style={`background-image:url('${imageSrc}'); background-size:cover; background-position:center;`}
		aria-hidden="true"
	/>

	<div class="pointer-events-none absolute inset-0 bg-background/50" aria-hidden="true" />

	<div class="relative z-10 mx-auto max-w-6xl px-6 py-6">
		<h2 class="m-0 max-w-200 text-4xl leading-tight font-bold text-white sm:text-5xl md:text-6xl">
			{title}
		</h2>
		{#if subtitle}
			<p class="mt-4 max-w-3xl text-lg leading-relaxed text-white/90">
				{subtitle}
			</p>
		{/if}
	</div>
</section>

<style>
	.image-headline {
		--parallax-strength: 0.35;
		--parallax-scale: 1;
		--parallax-distance: calc(clamp(0, var(--parallax-strength), 1) * 22rem);
	}

	.parallax-image {
		position: absolute;
		top: -12%;
		bottom: -12%;
		left: -12%;
		right: -12%;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
		transform: translate3d(0, calc(var(--parallax-distance) * -0.35), 0)
			scale(var(--parallax-scale));
	}

	@media (max-width: 640px) {
		.parallax-image {
			top: -18%;
			bottom: -18%;
			left: -18%;
			right: -18%;
		}
	}

	@supports (animation-timeline: auto) {
		.image-headline {
			view-timeline-name: --headline;
			view-timeline-axis: block;
		}

		.parallax-image {
			animation-name: image-parallax;
			animation-timing-function: linear;
			animation-duration: 1ms; /* duration is driven by animation range */
			animation-fill-mode: both;
			animation-timeline: --headline;
			animation-range: entry 0% exit 100%;
		}

		@keyframes image-parallax {
			from {
				transform: translate3d(0, calc(var(--parallax-distance) * -0.65), 0)
					scale(var(--parallax-scale));
			}
			to {
				transform: translate3d(0, calc(var(--parallax-distance) * 0.45), 0)
					scale(var(--parallax-scale));
			}
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.parallax-image {
			animation: none;
			transform: scale(var(--parallax-scale));
		}
	}
</style>
