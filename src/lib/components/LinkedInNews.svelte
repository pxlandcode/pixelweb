<script lang="ts">
	import type { LinkedInPost } from '$lib/types';
	import { onDestroy } from 'svelte';

	export let posts: LinkedInPost[] = [];
	export let error: string | undefined;

	let scrollContainer: HTMLDivElement;
	let isDragging = false;
	let startX = 0;
	let scrollLeft = 0;
	let lastX = 0;
	let lastTime = 0;
	let velocity = 0;
	let animationFrame: number | null = null;
	let isScrolling = false; // Track if content is still moving

	const clampText = (value: string, length = 180) => {
		if (!value) return value;
		return value.length > length ? `${value.slice(0, length - 1).trimEnd()}…` : value;
	};

	const formatDate = (value: string): string => {
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

	onDestroy(() => {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
		}
	});

	$: sortedPosts = [...posts].sort(
		(a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
	);
	$: formattedPosts = sortedPosts.map((post) => ({
		...post,
		summary: post.summary ? clampText(post.summary) : ''
	}));
</script>

<section class="news-section mt-24 bg-[#e6e6db] text-[#15150f]">
	<div class="mx-auto max-w-7xl px-6 pt-20 pb-4 sm:pt-24">
		<header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div class="space-y-3">
				<p class="text-sm font-medium tracking-[0.3em] text-[#5c5d4c] uppercase">LinkedIn</p>
				<h2 class="text-4xl leading-none font-semibold text-[#10120a] sm:text-5xl">What's New</h2>
			</div>
			<a
				class="inline-flex items-center gap-2 self-start rounded-full border border-[#bcbca9] bg-white/60 px-5 py-2 text-sm font-semibold text-[#2c2d21] transition hover:bg-white hover:text-[#0f0f0c]"
				href="https://www.linkedin.com/company/90364210/"
				target="_blank"
				rel="noreferrer noopener"
			>
				Follow on LinkedIn
				<span aria-hidden="true">-></span>
			</a>
		</header>
	</div>

	{#if error}
		<div class="mx-auto max-w-7xl px-6">
			<p
				class="mt-8 rounded-2xl border border-[#d3d2c1] bg-white/70 px-5 py-4 text-sm text-[#703636]"
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
					<article class="group flex max-w-[380px] min-w-[380px] flex-col">
						<div class="flex h-full flex-col">
							<div class="relative overflow-hidden rounded-lg">
								{#if post.mediaUrl}
									<img
										src={post.mediaUrl}
										alt={post.mediaAlt ?? post.title}
										loading="lazy"
										decoding="async"
										draggable="false"
										class="aspect-square w-full object-cover will-change-transform"
									/>
								{:else}
									<div
										class="flex aspect-square w-full items-center justify-center bg-[#d2d1c2] text-sm text-[#424233]"
									>
										Image not available
									</div>
								{/if}
							</div>
							<div class="mt-4 flex flex-1 flex-col gap-2">
								{#if post.publishedAt}
									<p class="text-date text-xs text-[#676851]">
										{formatDate(post.publishedAt)}
									</p>
								{/if}
								<h3 class="text-title text-lg leading-tight font-semibold text-[#222217]">
									{post.title}
								</h3>
								{#if post.summary}
									<p class="text-summary text-sm leading-relaxed text-[#3d3d2e]">
										{post.summary}
									</p>
								{/if}
								<a
									href={post.link}
									target="_blank"
									rel="noreferrer noopener"
									class="text-link mt-auto pt-2 text-sm text-[#676851] underline transition hover:text-[#3d3d2e]"
									on:click={(e) => {
										if (isDragging) e.preventDefault();
									}}
								>
									{post.ctaLabel ?? 'View post'}
								</a>
							</div>
						</div>
					</article>
				{/each}
			</div>
		</div>
	{:else}
		<div class="mx-auto max-w-7xl px-6">
			<div
				class="mt-12 rounded-3xl border border-dashed border-[#c7c6b2] bg-[#f7f4e7] px-8 py-16 text-center text-base text-[#474738]"
			>
				<p>No LinkedIn posts are available right now. Follow us on LinkedIn to stay in the loop.</p>
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
	.text-title,
	.text-summary,
	.text-link {
		transform: translateX(0);
		will-change: transform;
	}

	.scrollbar-hide:not(.is-scrolling) .text-date,
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
