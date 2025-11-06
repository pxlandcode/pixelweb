<script lang="ts">
	import type { NewsPreviewItem } from '$lib/types';
	import { onDestroy, onMount } from 'svelte';

	type FormattedNewsPost = NewsPreviewItem & { displaySummary: string };

	export let posts: NewsPreviewItem[] = [];
	export let error: string | undefined;

	let scrollContainer: HTMLDivElement;
	let observerTarget: HTMLDivElement;
	let isDragging = false;
	let startX = 0;
	let scrollLeft = 0;
	let lastX = 0;
	let lastTime = 0;
	let velocity = 0;
	let animationFrame: number | null = null;
	let isScrolling = false;
	let isLoadingMore = false;
	let hasMore = true;
	let allPosts: NewsPreviewItem[] = [...posts];
	let observer: IntersectionObserver | null = null;
	let imageLoadingStates = new Map<string, boolean>();

	const newsImageSizes = '(min-width: 1024px) 380px, (min-width: 640px) 50vw, 90vw';

	const transformSupabaseImageUrl = (url: string | null | undefined, width = 500): string => {
		if (!url) return '';

		// Transform /storage/v1/object/public/ to /storage/v1/render/image/public/
		// and add width and resize parameters
		const transformed = url.replace(
			'/storage/v1/object/public/',
			'/storage/v1/render/image/public/'
		);

		// Add query parameters if not already present
		if (transformed.includes('?')) {
			return transformed;
		}

		return `${transformed}?width=${width}&height=${width}&resize=cover`;
	};

	const clampText = (value: string | null | undefined, length = 180): string => {
		if (!value) return '';
		const normalized = value.replace(/\s+/g, ' ').trim();
		if (!normalized) return '';
		return normalized.length > length
			? `${normalized.slice(0, length - 1).trimEnd()}…`
			: normalized;
	};

	const formatDate = (value: string | null | undefined): string => {
		if (!value) return '';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return '';
		const day = `${date.getDate()}`.padStart(2, '0');
		const month = `${date.getMonth() + 1}`.padStart(2, '0');
		const year = `${date.getFullYear()}`.slice(-2);
		return `${day}.${month}.${year}`;
	};

	const applyMomentum = () => {
		if (!scrollContainer) return;

		if (Math.abs(velocity) > 0.5) {
			isScrolling = true;
			scrollContainer.scrollLeft -= velocity;

			// Update CSS custom property for parallax direction
			const direction = velocity > 0 ? 1 : -1;
			scrollContainer.style.setProperty('--scroll-direction', direction.toString());

			// Update velocity intensity (0-1 range, capped at velocity 15)
			const intensity = Math.min(Math.abs(velocity) / 15, 1);
			scrollContainer.style.setProperty('--velocity-intensity', intensity.toString());

			velocity *= 0.92;
			animationFrame = requestAnimationFrame(applyMomentum);
		} else {
			velocity = 0;
			isScrolling = false;
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
				animationFrame = null;
			}
		}
	};

	const handleMouseDown = (e: MouseEvent) => {
		if (!scrollContainer) return;

		// Stop any ongoing momentum
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
			animationFrame = null;
		}

		isDragging = true;
		isScrolling = true;
		startX = e.pageX - scrollContainer.offsetLeft;
		scrollLeft = scrollContainer.scrollLeft;
		lastX = e.pageX;
		lastTime = Date.now();
		velocity = 0;
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!isDragging || !scrollContainer) return;

		const x = e.pageX - scrollContainer.offsetLeft;
		const walk = x - startX;
		scrollContainer.scrollLeft = scrollLeft - walk;

		// Calculate velocity and direction for parallax
		const now = Date.now();
		const timeDelta = now - lastTime;

		if (timeDelta > 0) {
			const distance = e.pageX - lastX;
			velocity = (distance / timeDelta) * 16;

			// Set direction based on drag direction
			const direction = distance > 0 ? 1 : -1;
			scrollContainer.style.setProperty('--scroll-direction', direction.toString());
		}

		lastX = e.pageX;
		lastTime = now;
	};

	const handleMouseUp = () => {
		isDragging = false;

		// Apply momentum when releasing - keep isScrolling true
		if (Math.abs(velocity) > 0.1) {
			applyMomentum();
		} else {
			isScrolling = false;
		}
	};

	const handleMouseLeave = () => {
		if (isDragging) {
			isDragging = false;

			// Apply momentum when leaving while dragging
			if (Math.abs(velocity) > 0.1) {
				applyMomentum();
			} else {
				isScrolling = false;
			}
		}
	};

	const loadMorePosts = async () => {
		if (isLoadingMore || !hasMore) return;

		isLoadingMore = true;

		try {
			const offset = allPosts.length;
			const response = await fetch(`/api/news?offset=${offset}&limit=8`);

			if (!response.ok) {
				throw new Error('Failed to load more posts');
			}

			const data = await response.json();

			if (data.posts && data.posts.length > 0) {
				// Mark new posts as loading
				data.posts.forEach((post: NewsPreviewItem) => {
					if (post.coverImageUrl) {
						imageLoadingStates.set(post.id, true);
					}
				});
				allPosts = [...allPosts, ...data.posts];
			}

			// If we got fewer posts than requested, we've reached the end
			if (!data.posts || data.posts.length < 8) {
				hasMore = false;
			}
		} catch (err) {
			console.error('Error loading more posts:', err);
			hasMore = false;
		} finally {
			isLoadingMore = false;
		}
	};

	const handleImageLoad = (postId: string) => {
		imageLoadingStates.set(postId, false);
		imageLoadingStates = imageLoadingStates;
	};

	function handleImageError(event: Event, fallback?: string) {
		const element = event.currentTarget as HTMLImageElement | null;
		if (!element || element.dataset.fallbackApplied === 'true') return;
		if (fallback) {
			element.src = fallback;
			element.removeAttribute('srcset');
			element.dataset.fallbackApplied = 'true';
		}
	}

	onMount(() => {
		if (!observerTarget) return;

		observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry.isIntersecting && !isLoadingMore && hasMore) {
					loadMorePosts();
				}
			},
			{
				root: null,
				rootMargin: '200px',
				threshold: 0.1
			}
		);

		observer.observe(observerTarget);
	});

	onDestroy(() => {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
		}
		if (observer) {
			observer.disconnect();
		}
	});

	const getPublishedTime = (value: string | null | undefined): number => {
		if (!value) return 0;
		const time = new Date(value).getTime();
		return Number.isNaN(time) ? 0 : time;
	};

	$: sortedPosts = [...allPosts].sort(
		(a, b) => getPublishedTime(b.publishedAt) - getPublishedTime(a.publishedAt)
	);
	$: formattedPosts = sortedPosts.map((post) => ({
		...post,
		displaySummary: clampText(post.summary)
	})) satisfies FormattedNewsPost[];
	$: primaryCta = formattedPosts.find((post) => post.href && post.href !== '#');
</script>

<section class="news-section bg-white text-text">
	<div class="mx-auto max-w-7xl px-6 pt-20 pb-4 sm:pt-24">
		<header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div class="space-y-3">
				<p class="text-sm font-medium tracking-[0.3em] text-text/70 uppercase">News</p>
				<h2 class="text-4xl leading-none font-semibold text-text sm:text-5xl">What's New</h2>
			</div>
		</header>
	</div>

	{#if error}
		<div class="mx-auto max-w-7xl px-6">
			<p
				class="mt-8 rounded-2xl border border-background/50 bg-white px-5 py-4 text-sm text-[#703636]"
			>
				{error}
			</p>
		</div>
	{/if}

	{#if formattedPosts.length}
		<div class="relative mt-12 w-full overflow-hidden pb-20">
			<!-- Drag to scroll container -->
			<div
				bind:this={scrollContainer}
				on:mousedown={handleMouseDown}
				on:mousemove={handleMouseMove}
				on:mouseup={handleMouseUp}
				on:mouseleave={handleMouseLeave}
				class="scrollbar-hide flex gap-6 overflow-x-auto px-6 select-none"
				class:cursor-grabbing={isDragging}
				class:cursor-grab={!isDragging}
				class:is-scrolling={isScrolling}
			>
				{#each formattedPosts as post (post.id)}
					<article
						class="group flex max-w-[280px] min-w-[280px] flex-col sm:max-w-[380px] sm:min-w-[380px]"
					>
						<div class="flex h-full flex-col">
							<div class="relative overflow-hidden rounded-lg">
								{#if post.coverImageUrl}
									<!-- Loading skeleton overlay -->
									{#if imageLoadingStates.get(post.id)}
										<div
											class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-primary bg-background text-white"
										>
											<div
												class="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white"
											></div>
											<p class="text-sm font-medium">Loading image...</p>
										</div>
									{/if}
									<img
										src={transformSupabaseImageUrl(post.coverImageUrl)}
										alt={post.coverImageAlt ?? post.title}
										loading="lazy"
										decoding="async"
										draggable="false"
										sizes={newsImageSizes}
										width="380"
										height="380"
										on:load={() => handleImageLoad(post.id)}
										on:error={(event) => handleImageError(event)}
										class="aspect-square w-full object-cover will-change-transform"
										class:opacity-0={imageLoadingStates.get(post.id)}
									/>
								{:else}
									<div
										class="text-s flex aspect-square w-full items-center justify-center bg-background text-sm"
									>
										Image not available
									</div>
								{/if}
							</div>
							<div class="mt-4 flex flex-1 flex-col gap-2">
								{#if post.publishedAt}
									<p class="text-date text-xs text-text/70">
										{formatDate(post.publishedAt)}
									</p>
								{/if}
								{#if post.badge}
									<p class="text-badge text-xs font-semibold tracking-wide text-text/70 uppercase">
										{post.badge}
									</p>
								{/if}
								<h3 class="text-title text-lg leading-tight font-semibold text-text">
									{post.title}
								</h3>
								{#if post.displaySummary}
									<p class="text-summary text-sm leading-relaxed text-text">
										{post.displaySummary}
									</p>
								{/if}
								{#if post.href && post.href !== '#'}
									<a
										href={post.href}
										target={post.href.startsWith('http') ? '_blank' : undefined}
										rel={post.href.startsWith('http') ? 'noreferrer noopener' : undefined}
										class="text-link hover:text-primary-hover mt-auto pt-2 text-sm text-primary transition hover:underline"
										on:click={(e) => {
											if (isDragging) e.preventDefault();
										}}
									>
										{post.ctaLabel ?? 'Read article'}
									</a>
								{:else}
									<span class="mt-auto pt-2 text-sm text-text/70">
										{post.ctaLabel ?? 'More details coming soon'}
									</span>
								{/if}
							</div>
						</div>
					</article>
				{/each}

				<!-- Loading skeleton cards -->
				{#if isLoadingMore}
					{#each Array(4) as _, i (i)}
						<article
							class="group flex max-w-[280px] min-w-[280px] flex-col sm:max-w-[380px] sm:min-w-[380px]"
						>
							<div class="flex h-full flex-col">
								<div
									class="relative overflow-hidden rounded-lg border-2 border-dashed border-primary bg-background"
								>
									<div
										class="flex aspect-square w-full flex-col items-center justify-center gap-3 text-white"
									>
										<div
											class="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white"
										></div>
										<p class="text-sm font-medium">Loading more news...</p>
									</div>
								</div>
								<div class="mt-4 flex flex-1 flex-col gap-2">
									<div class="h-3 w-20 animate-pulse rounded bg-[#d2d1c2]"></div>
									<div class="h-6 w-3/4 animate-pulse rounded bg-[#d2d1c2]"></div>
									<div class="space-y-2">
										<div class="h-4 w-full animate-pulse rounded bg-[#d2d1c2]"></div>
										<div class="h-4 w-full animate-pulse rounded bg-[#d2d1c2]"></div>
										<div class="h-4 w-2/3 animate-pulse rounded bg-[#d2d1c2]"></div>
									</div>
								</div>
							</div>
						</article>
					{/each}
				{/if}

				<!-- Intersection observer target for infinite scroll -->
				<div bind:this={observerTarget} class="observer-target min-w-[1px]"></div>
			</div>

			<!-- Loading indicator -->
			{#if isLoadingMore}
				<div class="mt-8 flex justify-center">
					<div class="flex items-center gap-2 text-sm text-text/70">
						<div
							class="h-5 w-5 animate-spin rounded-full border-2 border-text/20 border-t-text/70"
						></div>
						<span>Loading more posts...</span>
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<div class="mx-auto max-w-7xl px-6">
			<div
				class="mt-12 rounded-3xl border border-dashed border-[#c7c6b2] bg-[#f7f4e7] px-8 py-16 text-center text-base text-[#474738]"
			>
				<p>No news articles are published yet. Check back soon for the latest updates.</p>
			</div>
		</div>
	{/if}
</section>

<style>
	/* Hide scrollbar for Chrome, Safari and Opera */
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}

	/* Hide scrollbar for IE, Edge and Firefox */
	.scrollbar-hide {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}

	/* Parallax lag effect - text content lags behind images during scroll */
	.scrollbar-hide {
		scroll-snap-type: none;
		--scroll-direction: 1;
		--velocity-intensity: 0;
	}

	article {
		perspective: 1000px;
	}

	/* Individual text elements with different lag amounts */
	.text-date,
	.text-badge,
	.text-title,
	.text-summary,
	.text-link {
		transform: translateX(0);
		will-change: transform;
	}

	.scrollbar-hide:not(.is-scrolling) .text-date,
	.scrollbar-hide:not(.is-scrolling) .text-badge,
	.scrollbar-hide:not(.is-scrolling) .text-title,
	.scrollbar-hide:not(.is-scrolling) .text-summary,
	.scrollbar-hide:not(.is-scrolling) .text-link {
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Create the staggered lag effect during scrolling - direction aware */
	@media (hover: hover) {
		.scrollbar-hide.is-scrolling .text-date {
			transform: translateX(calc(var(--scroll-direction) * var(--velocity-intensity) * -8px));
			transition: transform 0.05s linear;
		}

		.scrollbar-hide.is-scrolling .text-badge {
			transform: translateX(calc(var(--scroll-direction) * var(--velocity-intensity) * -12px));
			transition: transform 0.055s linear;
		}

		.scrollbar-hide.is-scrolling .text-title {
			transform: translateX(calc(var(--scroll-direction) * var(--velocity-intensity) * -16px));
			transition: transform 0.06s linear;
		}

		.scrollbar-hide.is-scrolling .text-summary {
			transform: translateX(calc(var(--scroll-direction) * var(--velocity-intensity) * -28px));
			transition: transform 0.07s linear;
		}

		.scrollbar-hide.is-scrolling .text-link {
			transform: translateX(calc(var(--scroll-direction) * var(--velocity-intensity) * -40px));
			transition: transform 0.08s linear;
		}
	}
</style>
