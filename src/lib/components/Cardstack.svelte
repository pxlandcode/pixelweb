<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	export let eyebrow: string | undefined = undefined;
	export let heading: string | undefined = undefined;
	export let description: string | undefined = undefined;

	let listEl: HTMLUListElement | null = null;
	let items: HTMLElement[] = [];
	let intersectionObserver: IntersectionObserver | null = null;
	let resizeObserver: ResizeObserver | null = null;
	let scrollCleanup: (() => void) | null = null;
	let resizeAttached = false;
	let frameRequested = false;

	let stickyOffset = 0;
	let cardHeight = 0;
	let cardHeights: number[] = [];
	let gap = 24;
	let stickyStartPoints: number[] = [];
	let baseTranslations: number[] = [];

	const SHRINK_FACTOR = 0.05;
	const MIN_SCALE = 0.9;

	function computeMetrics() {
		if (!listEl || !items.length) return;
		const scrollY = window.scrollY;
		const firstItem = items[0];
		const listStyles = getComputedStyle(listEl);
		const itemStyles = getComputedStyle(firstItem);

		const gapValue = parseFloat(listStyles.getPropertyValue('--stack-gap'));
		const marginFallback = parseFloat(itemStyles.marginBottom);
		gap = Number.isNaN(gapValue) ? (Number.isNaN(marginFallback) ? 24 : marginFallback) : gapValue;

		stickyOffset = parseFloat(itemStyles.top) || 0;
		cardHeights = items.map((item) => item.getBoundingClientRect().height);
		cardHeight = cardHeights[0] ?? 0;

		stickyStartPoints = items.map((item) => {
			const rect = item.getBoundingClientRect();
			return rect.top + scrollY - stickyOffset;
		});

		baseTranslations = items.map((_, index) => gap * index);
	}

	function applyTransforms() {
		if (!items.length) return;
		const scrollY = window.scrollY;
		items.forEach((item, index) => {
			const base = baseTranslations[index] ?? 0;
			const start = stickyStartPoints[index] ?? 0;
			const progress = Math.max(0, scrollY - start);
			const height = cardHeights[index] ?? cardHeight;
			const scaleReduction = (progress * SHRINK_FACTOR) / Math.max(height, 1);
			const scale = Math.max(MIN_SCALE, 1 - scaleReduction);
			item.style.transform = `translateY(${base}px) scale(${scale})`;
		});
	}

	function handleScroll() {
		if (frameRequested) return;
		frameRequested = true;
		window.requestAnimationFrame(() => {
			frameRequested = false;
			applyTransforms();
		});
	}

	function startScrollListener() {
		if (scrollCleanup) return;
		window.addEventListener('scroll', handleScroll, { passive: true });
		scrollCleanup = () => window.removeEventListener('scroll', handleScroll);
	}

	function stopScrollListener() {
		if (!scrollCleanup) return;
		scrollCleanup();
		scrollCleanup = null;
	}

	function handleIntersect(entries: IntersectionObserverEntry[]) {
		const entry = entries[0];
		if (!entry) return;
		if (entry.isIntersecting) {
			computeMetrics();
			applyTransforms();
			startScrollListener();
		} else {
			stopScrollListener();
		}
	}

	function handleResize() {
		computeMetrics();
		applyTransforms();
	}

	onMount(() => {
		if (!listEl) return;
		if (typeof window === 'undefined') return;

		items = Array.from(listEl.querySelectorAll<HTMLElement>('.js-stack-cards__item'));
		if (!items.length) return;

		const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

		computeMetrics();
		applyTransforms();

		if (reduceMotion) {
			return;
		}

		window.addEventListener('resize', handleResize);
		resizeAttached = true;

		if ('IntersectionObserver' in window) {
			intersectionObserver = new IntersectionObserver(handleIntersect, { threshold: 0 });
			intersectionObserver.observe(listEl);
		} else {
			startScrollListener();
		}

		if (typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver(() => {
				computeMetrics();
				applyTransforms();
			});
			items.forEach((item) => resizeObserver?.observe(item));
		}
	});

	onDestroy(() => {
		stopScrollListener();
		if (resizeAttached) {
			window.removeEventListener('resize', handleResize);
		}
		intersectionObserver?.disconnect();
		resizeObserver?.disconnect();
	});
</script>

<section class="cardstack cardstack--has-exit">
	{#if eyebrow || heading || description}
		<div class="cardstack__intro">
			{#if eyebrow}
				<p class="cardstack__eyebrow">{eyebrow}</p>
			{/if}
			{#if heading}
				<h2 class="cardstack__heading">{heading}</h2>
			{/if}
			{#if description}
				<p class="cardstack__description">{description}</p>
			{/if}
		</div>
	{/if}
	<ul class="stack-cards js-stack-cards" bind:this={listEl} role="list">
		<slot />
	</ul>
</section>

<style>
	.cardstack {
		--stack-top-offset: clamp(2.5rem, 7vw, 4.5rem);
		--stack-gap: clamp(3rem, 6vw, 5rem);
		position: relative;
		isolation: isolate;
		background: linear-gradient(180deg, #f7f8fc 0%, #f1f2f8 90%);
		color: #11131d;
		display: grid;
		gap: clamp(3rem, 7vw, 6rem);
		margin: 0;
		padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.5rem, 6vw, 5rem) clamp(7rem, 11vw, 10rem);
		min-height: 100vh;
	}

	.cardstack::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: clamp(-10rem, -14vw, -6rem);
		height: clamp(5rem, 14vw, 11rem);
		background: linear-gradient(
			180deg,
			rgba(15, 15, 17, 0) 0%,
			rgba(15, 15, 17, 0.65) 60%,
			#0f0f11 100%
		);
		pointer-events: none;
		opacity: 0;
		transition: opacity 240ms ease-out;
	}

	.cardstack--has-exit::after {
		opacity: 1;
	}

	.cardstack__intro,
	.stack-cards {
		margin-inline: auto;
		width: min(100%, 70rem);
	}

	.cardstack__intro {
		display: grid;
		gap: clamp(1.25rem, 2.5vw, 2rem);
		text-align: center;
	}

	.cardstack__eyebrow {
		color: #4f56ff;
		font-size: 0.9rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.cardstack__heading {
		font-size: clamp(2.25rem, 5vw, 3.75rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.1;
		margin: 0;
	}

	.cardstack__description {
		color: #3b3d4a;
		font-size: clamp(1.05rem, 2vw, 1.25rem);
		line-height: 1.7;
		margin: 0 auto;
		max-width: 45rem;
	}

	.stack-cards {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--stack-gap);
		counter-reset: cardstack;
	}

	@media (max-width: 50rem) {
		.cardstack {
			padding-inline: clamp(1rem, 5vw, 2rem);
		}

		.cardstack__intro,
		.stack-cards {
			width: 100%;
		}
	}
</style>
