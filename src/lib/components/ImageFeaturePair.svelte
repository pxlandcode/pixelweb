<script lang="ts">
	export let leftTop: string = '6rem'; // desktop visual offset for left block
	export let rightTop: string = '18rem'; // desktop visual offset for right block

	export let leadTitle: string;

	export let leftTitle: string;
	export let leftBody: string;
	export let leftImageSrc: string;

	export let rightTitle: string;
	export let rightBody: string;
	export let rightImageSrc: string;
</script>

<section class="relative w-full bg-background text-white">
	<div class="mx-auto max-w-7xl px-6 py-16 md:py-20 lg:py-24">
		<!-- Centered headline on top -->
		<h2
			class="headline-motion m-0 mx-auto max-w-3xl text-left text-5xl leading-tight font-bold
             whitespace-pre-line text-white sm:text-5xl md:text-6xl lg:text-[3.5rem]"
		>
			{leadTitle}
		</h2>

		<div
			class="relative mt-10 grid gap-10 md:mt-16 md:grid-cols-2 md:gap-12"
			style="
        --left-offset: {leftTop};
        --right-offset: {rightTop};
        /* ensure the section reserves space for the translated content on md+ */
        padding-bottom: max(var(--left-offset), var(--right-offset));
      "
		>
			<!-- LEFT feature -->
			<div
				class="feature feature--left grid gap-4 md:[transform:translateY(var(--left-offset))] md:will-change-transform"
			>
				<div class="feature__content max-w-[30rem]">
					<h3 class="feature__title m-0 text-sm font-semibold tracking-tight">{leftTitle}</h3>
					<p class="feature__body mt-2 text-[0.9rem] leading-relaxed text-white/80">{leftBody}</p>
				</div>
				<img src={leftImageSrc} alt="" class="feature__image block w-full object-cover" />
			</div>

			<!-- RIGHT feature -->
			<div
				class="feature feature--right grid gap-4 md:[transform:translateY(var(--right-offset))] md:will-change-transform"
			>
				<div class="feature__content max-w-[30rem]">
					<h3 class="feature__title m-0 text-sm font-semibold tracking-tight">{rightTitle}</h3>
					<p class="feature__body mt-2 text-[0.9rem] leading-relaxed text-white/80">{rightBody}</p>
				</div>
				<img src={rightImageSrc} alt="" class="feature__image block w-full object-cover" />
			</div>
		</div>
	</div>
</section>

<style>
	:global(:root) {
		--feature-motion-ease: cubic-bezier(0.22, 1, 0.36, 1);
	}

	.headline-motion {
		--headline-shift: clamp(3rem, 8vw, 5rem);
		opacity: 0;
		translate: 0 var(--headline-shift);
		animation: headline-rise 0.9s var(--feature-motion-ease) forwards;
		animation-delay: 0.15s;
		will-change: opacity, translate;
	}

	.feature {
		--feature-column-delay: 0s;
		--feature-distance: clamp(2.5rem, 7vw, 5.5rem);
		view-timeline-name: --feature;
		view-timeline-axis: block;
	}

	.feature--right {
		--feature-column-delay: 0.5s;
	}

	.feature__title,
	.feature__body,
	.feature__image {
		opacity: 0;
		translate: 0 var(--feature-distance);
		animation: feature-pull 0.9s var(--feature-motion-ease) forwards;
		animation-delay: calc(var(--feature-column-delay) + var(--feature-stagger));
		will-change: opacity, translate;
	}

	.feature__title {
		--feature-stagger: 0s;
	}

	.feature__body {
		--feature-stagger: 0.12s;
	}

	.feature__image {
		--feature-stagger: 0.24s;
	}

	@supports (animation-timeline: view()) {
		.headline-motion {
			animation-delay: 0s;
			animation-timeline: view(block);
			animation-range: entry 70% contain 40%;
		}

		.feature__title,
		.feature__body,
		.feature__image {
			animation-timeline: --feature;
			animation-range: entry 68% contain 45%;
		}

		.feature--right .feature__title,
		.feature--right .feature__body,
		.feature--right .feature__image {
			animation-range: entry 60% contain 40%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.headline-motion,
		.feature__title,
		.feature__body,
		.feature__image {
			animation: none;
			opacity: 1;
			translate: none;
		}
	}

	@keyframes headline-rise {
		from {
			opacity: 0;
			translate: 0 var(--headline-shift);
		}

		to {
			opacity: 1;
			translate: 0;
		}
	}

	@keyframes feature-pull {
		from {
			opacity: 0;
			translate: 0 var(--feature-distance);
		}

		to {
			opacity: 1;
			translate: 0;
		}
	}
</style>
