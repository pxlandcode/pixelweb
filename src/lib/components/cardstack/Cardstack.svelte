<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { fetchCases } from '$lib/services/api/caseService';
	import type { CaseRecord } from '$lib/types';
	import CardstackItem from './CardstackItem.svelte';

	type CardstackProps = {
		id?: string;
	};

	let { id = '' } = $props<CardstackProps>();

	let cases: CaseRecord[] = $state([]);
	let isLoading = $state(true);
	let loadError = $state<string | null>(null);

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

	function teardownObservers() {
		stopScrollListener();

		if (resizeAttached) {
			window.removeEventListener('resize', handleResize);
			resizeAttached = false;
		}

		intersectionObserver?.disconnect();
		intersectionObserver = null;

		resizeObserver?.disconnect();
		resizeObserver = null;

		items = [];
		overlays = [];
		tiltAngles = [];
		cardHeights = [];
		stickyStartPoints = [];
		baseTranslations = [];
		frameRequested = false;
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

	let reduceMotion = false;

	const initializeStack = () => {
		if (!listEl) return;

		items = Array.from(listEl.querySelectorAll<HTMLElement>('.js-stack-cards__item'));
		if (!items.length) {
			return;
		}

		overlays = items.map((el) => el.querySelector<HTMLElement>('.js-tilt-overlay'));

		tiltAngles = items.map(() => {
			const sign = Math.random() < 0.5 ? -1 : 1;
			const mag = MIN_TILT_DEG + Math.random() * (MAX_TILT_DEG - MIN_TILT_DEG);
			return sign * mag;
		});

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
	};

	const loadCases = async () => {
		isLoading = true;
		loadError = null;

		try {
			const result = await fetchCases();
			// Filter for only published cases that should be shown on main page
			// Sort by display order (ascending)
			cases = result
				.filter((c) => c.status === 'published' && c.showOnMainPage === true)
				.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
		} catch (error) {
			console.error('[Cardstack] Failed to load cases', error);
			loadError = 'We were unable to load case studies.';
		} finally {
			isLoading = false;
		}
	};

	$effect(() => {
		const caseCount = cases.length;
		void tick().then(() => {
			if (typeof window === 'undefined') return;
			if (!listEl) return;

			teardownObservers();

			if (!caseCount) {
				return;
			}

			initializeStack();
		});
	});

	onMount(() => {
		if (typeof window === 'undefined') {
			return () => undefined;
		}

		reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

		void loadCases();

		return () => {
			teardownObservers();
		};
	});

	onDestroy(() => {
		if (typeof window === 'undefined') {
			return;
		}
		teardownObservers();
	});
</script>

<section
	id={id || undefined}
	class="relative isolate grid min-h-screen gap-[clamp(3rem,7vw,6rem)] bg-background text-white [--stack-gap:clamp(3rem,6vw,5rem)]"
>
	{#if loadError}
		<div class="rounded-lg border border-white/10 bg-white/5 p-6 text-sm text-white/80">
			{loadError}
		</div>
	{:else}
		<ul class="m-0 grid list-none p-0 [counter-reset:cardstack]" bind:this={listEl} role="list">
			{#if cases.length}
				{#each cases as entry, index (entry.id)}
					<CardstackItem
						counter={index + 1}
						title={entry.title}
						eyebrow={entry.eyebrow ?? undefined}
						description={entry.description ?? undefined}
						img={entry.img ?? undefined}
						imgAlt={entry.imgAlt ?? undefined}
						imagePosition={entry.imagePosition ?? undefined}
						bullets={entry.bullets ?? undefined}
						bodyHtml={entry.bodyHtml ?? undefined}
					/>
				{/each}
			{:else if isLoading}
				<li class="flex min-h-[12rem] items-center justify-center text-sm text-white/70">
					Loading case studies…
				</li>
			{:else}
				<li class="flex min-h-[12rem] items-center justify-center text-sm text-white/70">
					Case studies will appear here soon.
				</li>
			{/if}
		</ul>
	{/if}
</section>
