<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	let listEl: HTMLUListElement | null = null;
	let items: HTMLElement[] = [];
	let overlays: (HTMLElement | null)[] = [];
	let tiltAngles: number[] = [];

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

	const MAX_TILT_DEG = 2; // maximum absolute tilt (deg)
	const MIN_TILT_DEG = 0.6; // minimum absolute tilt (deg)
	const MAX_OVERLAY = 0.35; // max overlay opacity when fully “fallen back”

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

			const t = (1 - scale) / (1 - MIN_SCALE);

			// Subtle random tilt per card, scaled by t
			const tilt = (tiltAngles[index] ?? 0) * t;

			// Apply transform
			item.style.transform = `translateY(${base}px) scale(${scale}) rotate(${tilt}deg)`;

			// Shadow overlay: intensifies with t
			const overlay = overlays[index];
			if (overlay) {
				overlay.style.opacity = String(Math.min(MAX_OVERLAY, Math.max(0, t * MAX_OVERLAY)));
			}
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

		// Overlay nodes (added in CardStackItem markup)
		overlays = items.map((el) => el.querySelector<HTMLElement>('.js-tilt-overlay'));

		// Stable-enough random tilt per item (small left/right)
		tiltAngles = items.map(() => {
			const sign = Math.random() < 0.5 ? -1 : 1;
			const mag = MIN_TILT_DEG + Math.random() * (MAX_TILT_DEG - MIN_TILT_DEG);
			return sign * mag;
		});

		const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

		computeMetrics();
		applyTransforms();

		if (reduceMotion) return;

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

<section
	class="relative isolate grid min-h-screen gap-[clamp(3rem,7vw,6rem)] bg-black text-white [--stack-gap:clamp(3rem,6vw,5rem)] max-[50rem]:px-[clamp(1rem,5vw,2rem)]"
>
	<ul class="m-0 grid list-none p-0 [counter-reset:cardstack]" bind:this={listEl} role="list">
		<slot />
	</ul>
</section>
