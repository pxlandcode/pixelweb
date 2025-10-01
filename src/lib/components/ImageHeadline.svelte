<script lang="ts">
	import { onMount } from 'svelte';

	export let imageSrc: string;
	export let title: string; // large white text over the image
	export let subtitle: string = ''; // optional, smaller line under the title
	export let parallax = 0.25; // 0–1 (how much the image moves while scrolling)

	let wrapper: HTMLDivElement | null = null;
	let imgEl: HTMLDivElement | null = null;

	function updateParallax() {
		if (!wrapper || !imgEl) return;
		const rect = wrapper.getBoundingClientRect();
		// progress: 0 at top entering, ~1 when fully scrolled past height
		const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
		// clamp and shift a bit so it moves subtly only while in view
		const t = Math.max(0, Math.min(1, progress));
		const translate = (t - 0.5) * parallax * 100; // px-ish, subtle
		imgEl.style.transform = `translate3d(0, ${translate}px, 0) scale(1.05)`; // tiny scale for depth edges
	}

	function onScroll() {
		updateParallax();
	}
	function onResize() {
		updateParallax();
	}

	onMount(() => {
		updateParallax();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<!-- Wrapper -->
<section class="relative isolate h-dvh w-full overflow-hidden bg-black" bind:this={wrapper}>
	<!-- Parallax image -->
	<div
		class="absolute inset-0 transform-gpu will-change-transform"
		bind:this={imgEl}
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
