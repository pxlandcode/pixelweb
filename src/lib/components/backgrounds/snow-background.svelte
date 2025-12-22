<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';

	type Flake = {
		x: number;
		y: number;
		r: number;
		vx: number;
		vy: number;
		wobble: number;
		wobbleSpeed: number;
		wobbleRadius: number;
		alpha: number;
	};

	let wrapper: HTMLDivElement | null = null;
	let canvas: HTMLCanvasElement | null = null;
	let ctx: CanvasRenderingContext2D | null = null;
	let rafId: number | null = null;
	let resizeObserver: ResizeObserver | null = null;

	let width = 0;
	let height = 0;
	let pileHeights = new Float32Array(0);
	let flakes: Flake[] = [];
	let spawnAccumulator = 0;
	let lastFrame = 0;

	export let pileLimitRatio = 0.7;

	const bucketSize = 6;
	const baseMargin = 0;
	const flakesPerSecond = 40;
	const maxActiveFlakes = 600;

	const rand = (min: number, max: number) => Math.random() * (max - min) + min;

	const clampRatio = (value: number) => Math.min(0.95, Math.max(0.1, value));

	$: clampedPileRatio = clampRatio(pileLimitRatio);

	function resizeCanvas() {
		if (!browser || !wrapper || !canvas) return;

		const rect = wrapper.getBoundingClientRect();
		const prevHeights = pileHeights;
		const prevBucketCount = prevHeights.length;

		width = Math.max(1, Math.round(rect.width));
		height = Math.max(1, Math.round(rect.height));

		const dpr = window.devicePixelRatio || 1;
		canvas.width = Math.floor(width * dpr);
		canvas.height = Math.floor(height * dpr);
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;

		ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(dpr, dpr);

		const buckets = Math.max(1, Math.ceil(width / bucketSize));
		const remapped = new Float32Array(buckets);

		if (prevBucketCount) {
			for (let i = 0; i < buckets; i++) {
				const t = buckets === 1 ? 0 : i / (buckets - 1);
				const prevIndex = Math.min(prevBucketCount - 1, Math.round(t * (prevBucketCount - 1)));
				remapped[i] = prevHeights[prevIndex];
			}
		}

		pileHeights = remapped;
	}

	function groundHeightAt(x: number) {
		if (!pileHeights.length) return 0;
		const idx = Math.max(0, Math.min(pileHeights.length - 1, Math.floor(x / bucketSize)));
		const next = Math.min(pileHeights.length - 1, idx + 1);
		const t = Math.min(1, Math.max(0, x / bucketSize - idx));
		const a = pileHeights[idx];
		const b = pileHeights[next];
		return a * (1 - t) + b * t;
	}

	function addSnowAt(x: number, radius: number) {
		if (!pileHeights.length || height <= 0) return;
		const idx = Math.floor(x / bucketSize);
		const spread = Math.max(1, Math.round(radius * 1.6));
		const cap = height * clampedPileRatio;

		for (let offset = -spread; offset <= spread; offset++) {
			const target = idx + offset;
			if (target < 0 || target >= pileHeights.length) continue;
			const falloff = 1 - Math.abs(offset) / (spread + 1);
			const gain = radius * falloff * 0.18;
			pileHeights[target] = Math.min(cap, pileHeights[target] + gain);
		}
	}

	function smoothHeights(values: Float32Array, radius = 4) {
		if (!values.length) return values;
		const smoothed = new Float32Array(values.length);
		for (let i = 0; i < values.length; i++) {
			let sum = 0;
			let count = 0;
			for (let r = -radius; r <= radius; r++) {
				const idx = i + r;
				if (idx < 0 || idx >= values.length) continue;
				sum += values[idx];
				count += 1;
			}
			smoothed[i] = count ? sum / count : values[i];
		}
		return smoothed;
	}

	function drawPile() {
		if (!ctx || !pileHeights.length || width <= 0 || height <= 0) return;

		const baseY = height - baseMargin;
		const maxHeight = Math.max(...pileHeights);
		if (maxHeight < 1) return;

		const smoothed = smoothHeights(pileHeights, 4);

		const gradient = ctx.createLinearGradient(0, baseY - maxHeight, 0, baseY);
		gradient.addColorStop(0, 'rgba(255, 255, 255, 0.82)');
		gradient.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
		ctx.fillStyle = gradient;

		ctx.beginPath();
		ctx.moveTo(0, baseY);

		for (let i = 0; i < smoothed.length; i++) {
			const x = i * bucketSize;
			const y = baseY - Math.min(smoothed[i], height * clampedPileRatio);
			ctx.lineTo(x, y);
		}

		const lastHeight = smoothed[smoothed.length - 1] || 0;
		ctx.lineTo(width, baseY - Math.min(lastHeight, height * clampedPileRatio));
		ctx.lineTo(width, height);
		ctx.lineTo(0, height);
		ctx.closePath();
		ctx.fill();
	}

	function spawnFlake() {
		if (width <= 0 || height <= 0) return;

		const size = rand(1.1, 3.4);
		flakes.push({
			x: Math.random() * width,
			y: -size,
			r: size,
			vx: rand(-12, 12),
			vy: rand(45, 88),
			wobble: rand(0, Math.PI * 2),
			wobbleSpeed: rand(0.8, 2.4),
			wobbleRadius: rand(0.6, 2.6),
			alpha: rand(0.6, 0.95)
		});
	}

	function updateFlakes(delta: number) {
		if (!ctx) return;

		ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';

		for (let i = flakes.length - 1; i >= 0; i--) {
			const flake = flakes[i];

			flake.wobble += flake.wobbleSpeed * delta;
			const wobbleX = Math.cos(flake.wobble) * flake.wobbleRadius * 16;
			const wobbleY = Math.sin(flake.wobble) * flake.wobbleRadius * 6;

			flake.x += (flake.vx + wobbleX) * delta;
			flake.y += (flake.vy + wobbleY + 12) * delta;

			if (flake.x < -10) flake.x = width + 10;
			if (flake.x > width + 10) flake.x = -10;

			const ground = groundHeightAt(flake.x);
			const landingY = height - ground - baseMargin;

			if (flake.y + flake.r >= landingY) {
				addSnowAt(flake.x, flake.r);
				flakes.splice(i, 1);
				continue;
			}

			if (flake.y - flake.r > height + 24) {
				flakes.splice(i, 1);
				continue;
			}

			ctx.globalAlpha = flake.alpha;
			ctx.beginPath();
			ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.globalAlpha = 1;
	}

	function frame(now: number) {
		if (!ctx || width <= 0 || height <= 0) {
			lastFrame = now;
			rafId = requestAnimationFrame(frame);
			return;
		}

		const delta = Math.min(0.05, Math.max(0.01, (now - lastFrame) / 1000 || 0.016));
		lastFrame = now;

		spawnAccumulator += delta * flakesPerSecond;
		const available = Math.max(0, maxActiveFlakes - flakes.length);
		const spawnCount = Math.min(available, Math.floor(spawnAccumulator));

		if (spawnCount > 0) {
			spawnAccumulator -= spawnCount;
			for (let i = 0; i < spawnCount; i++) {
				spawnFlake();
			}
		}

		ctx.clearRect(0, 0, width, height);
		drawPile();
		updateFlakes(delta);

		rafId = requestAnimationFrame(frame);
	}

	onMount(() => {
		if (!browser) return;

		resizeCanvas();

		resizeObserver = new ResizeObserver(resizeCanvas);
		if (wrapper) resizeObserver.observe(wrapper);

		lastFrame = performance.now();
		rafId = requestAnimationFrame(frame);
	});

	onDestroy(() => {
		if (!browser) return;
		if (rafId) cancelAnimationFrame(rafId);
		if (resizeObserver) resizeObserver.disconnect();
	});
</script>

<div
	bind:this={wrapper}
	class=" pointer-events-none absolute inset-0 select-none"
	aria-hidden="true"
>
	<canvas bind:this={canvas} class="h-full w-full"></canvas>
</div>
