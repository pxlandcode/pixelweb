<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	export let gridSize = 30;
	export let fadeSpeed = 8000;
	export let trailDuration = 1000;
	export let lagFactor = 0.08;
	export let resetDelay = 10000;
	export let opacity = 0.1;
	export let opacityCurve: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' = 'ease-out';
	export let squareColor = 'rgba(255,255,255,1)';
	export let pathColor = '#F1674A';
	export let underlineThickness = 6;

	const PATH_BASE = 40;

	let canvas: HTMLCanvasElement | null = null;
	let ctx: CanvasRenderingContext2D | null = null;
	let path2d: Path2D | null = null;

	type Kind = 0 | 1 | 2;
	type Cell = { cx: number; cy: number; t: number; kind: Kind };
	let trail: Cell[] = [];

	let mouseX = 0,
		mouseY = 0;
	let lagX = 0,
		lagY = 0;
	let nextKind: Kind = 0;
	let lastMove = 0;

	function ease(t: number) {
		switch (opacityCurve) {
			case 'ease-in':
				return t * t;
			case 'ease-out':
				return t * (2 - t);
			case 'ease-in-out':
				return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
			default:
				return t;
		}
	}

	function handleMouseMove(e: MouseEvent) {
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;
		lastMove = performance.now();
	}

	function resize() {
		if (!browser || !canvas || !ctx) return;
		const dpr = window.devicePixelRatio || 1;
		canvas.width = canvas.clientWidth * dpr;
		canvas.height = canvas.clientHeight * dpr;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(dpr, dpr);
	}

	function draw() {
		if (!browser || !ctx) return;
		const now = performance.now();

		if (now - lastMove > resetDelay) nextKind = 0;

		lagX += (mouseX - lagX) * lagFactor;
		lagY += (mouseY - lagY) * lagFactor;

		const cx = Math.floor(lagX / gridSize);
		const cy = Math.floor(lagY / gridSize);
		const last = trail[trail.length - 1];

		if (!last || last.cx !== cx || last.cy !== cy) {
			if (last) {
				const dx = cx - last.cx;
				const dy = cy - last.cy;
				const steps = Math.max(Math.abs(dx), Math.abs(dy));
				for (let i = 1; i <= steps; i++) {
					const ix = last.cx + Math.sign(dx) * i;
					const iy = last.cy + Math.sign(dy) * i;
					trail.push({ cx: ix, cy: iy, t: now, kind: nextKind });
					nextKind = ((nextKind + 1) % 3) as Kind;
				}
			} else {
				trail.push({ cx, cy, t: now, kind: nextKind });
				nextKind = ((nextKind + 1) % 3) as Kind;
			}
		}

		trail = trail.filter(({ t }) => now - t < trailDuration);

		ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

		for (const { cx, cy, t, kind } of trail) {
			const age = now - t;
			const life = 1 - Math.min(age / fadeSpeed, 1);
			if (life <= 0) continue;

			ctx.globalAlpha = ease(life) * opacity;
			const px = cx * gridSize;
			const py = cy * gridSize;

			if (kind === 0) {
				ctx.fillStyle = squareColor;
				// Draw a centered square dot at the bottom
				const dotSize = gridSize / 3;
				const offsetX = (gridSize - dotSize) / 2;
				ctx.fillRect(px + offsetX, py + gridSize - dotSize, dotSize, dotSize);
			} else if (kind === 1 && path2d) {
				ctx.save();
				ctx.translate(px + gridSize / 2, py + gridSize / 2);
				const s = gridSize / PATH_BASE;
				ctx.scale(s, s);
				ctx.translate(-PATH_BASE / 2, -PATH_BASE / 2);
				ctx.fillStyle = pathColor;
				ctx.fill(path2d);
				ctx.restore();
			} else {
				ctx.fillStyle = squareColor;
				// Draw a shorter, centered underline
				const underlineWidth = gridSize * 0.6;
				const offsetX = (gridSize - underlineWidth) / 2;
				ctx.fillRect(px + offsetX, py + gridSize - underlineThickness, underlineWidth, underlineThickness);
			}
		}

		ctx.globalAlpha = 1;
		requestAnimationFrame(draw);
	}

	onMount(() => {
		if (!browser) return; // 🧠 run only in browser

		ctx = canvas?.getContext('2d') || null;
		if (!ctx) return;

		path2d = new Path2D(
			`M16.8072 40C16.6166 39.9495 16.4261 39.8766 16.2299 39.8542C14.554 39.6524 12.9453 39.2094 11.46 38.3964C9.96344 37.5778 8.67428 36.5125 7.68779 35.0939C6.38741 33.2155 5.96143 31.141 6.09034 28.8926C6.18003 27.2665 6.60041 25.7526 7.3739 24.3341C8.28192 22.6632 9.57109 21.3175 11.0788 20.1793C11.5497 19.8204 12.0429 19.4952 12.5362 19.142C11.9308 18.6766 11.3367 18.2617 10.7818 17.7963C9.10026 16.3834 7.76065 14.7125 7.20015 12.5538C6.61722 10.311 6.74053 8.08501 7.66537 5.93753C8.75275 3.42 10.6641 1.78836 13.1751 0.823959C15.3275 -0.00026868 17.5639 -0.118015 19.8283 0.0894432C21.7901 0.268867 23.6174 0.829566 25.254 1.95096C26.5993 2.87051 27.6698 4.04237 28.3929 5.52262C29.2 7.17668 29.469 8.93167 29.3569 10.7371C29.256 12.4024 28.6675 13.9107 27.7091 15.2732C26.5208 16.9609 24.9962 18.2953 23.2474 19.3551C21.8181 20.2185 20.316 20.9699 18.8419 21.7605C17.1379 22.6744 15.4396 23.5996 14.0663 24.9957C12.8949 26.1844 12.2279 27.5805 12.3344 29.2906C12.4297 30.7597 13.0967 31.9315 14.2569 32.7894C16.4093 34.3818 18.7578 34.578 21.1904 33.552C22.4571 33.0193 23.4436 32.1054 24.0041 30.8214C24.4357 29.8289 24.503 28.786 23.9593 27.8216C23.3932 26.8236 22.7262 25.876 22.104 24.9116C22.0423 24.8163 21.9751 24.721 21.863 24.564C22.0535 24.5527 22.1657 24.5359 22.2834 24.5359C24.4525 24.5359 26.6217 24.5359 28.7964 24.5247C29.0655 24.5247 29.228 24.62 29.3738 24.8163C30.8479 26.8236 32.322 28.8253 33.8017 30.8326C35.8028 33.5351 37.8094 36.2377 39.8104 38.9403C39.872 39.0244 39.9169 39.1141 40.0009 39.2431C39.816 39.2543 39.7039 39.2599 39.5862 39.2599C37.417 39.2599 35.2479 39.2599 33.0731 39.2599C32.8545 39.2599 32.7032 39.215 32.5574 39.0188C31.3804 37.4096 30.1865 35.8172 28.9982 34.2192C28.9422 34.1463 28.8805 34.0734 28.7964 33.9669C28.5834 34.3201 28.3817 34.6453 28.1855 34.9705C27.1485 36.6582 25.6632 37.8413 23.9032 38.6936C22.53 39.3608 21.0839 39.7421 19.5649 39.871C19.4976 39.8766 19.436 39.9439 19.3743 39.9832L16.8128 39.9832L16.8072 40ZM13.1359 10.3895C13.1359 11.7015 13.7356 12.7388 14.5876 13.6696C15.5124 14.6732 16.6279 15.419 17.7993 16.0918C17.9394 16.1703 18.2141 16.1591 18.3598 16.0806C19.0885 15.6713 19.8171 15.2507 20.5066 14.7854C21.3081 14.2471 22.0199 13.5967 22.502 12.7388C23.04 11.78 23.197 10.7539 23.0344 9.67179C22.7934 8.01212 21.8686 6.87951 20.3608 6.21228C19.3407 5.76372 18.2701 5.72447 17.1715 5.85904C14.8062 6.14499 13.1191 8.02334 13.1247 10.3895L13.1359 10.3895Z`
		);

		resize();
		window.addEventListener('resize', resize);
		window.addEventListener('mousemove', handleMouseMove);
		requestAnimationFrame(draw);
	});

	onDestroy(() => {
		if (!browser) return;
		window.removeEventListener('resize', resize);
		window.removeEventListener('mousemove', handleMouseMove);
	});
</script>

<canvas bind:this={canvas} class="pointer-events-none absolute inset-0 h-full w-full"></canvas>
