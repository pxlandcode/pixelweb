<script lang="ts">
	import InteractiveBackground from '$lib/components/backgrounds/InteractiveBackground.svelte';

	export let error: Error & { message?: string };
	export let status: number;

	type CellType = 'pixel' | 'ampersand' | 'underline' | 'empty';

	const ampersandPath = `M16.8072 40C16.6166 39.9495 16.4261 39.8766 16.2299 39.8542C14.554 39.6524 12.9453 39.2094 11.46 38.3964C9.96344 37.5778 8.67428 36.5125 7.68779 35.0939C6.38741 33.2155 5.96143 31.141 6.09034 28.8926C6.18003 27.2665 6.60041 25.7526 7.3739 24.3341C8.28192 22.6632 9.57109 21.3175 11.0788 20.1793C11.5497 19.8204 12.0429 19.4952 12.5362 19.142C11.9308 18.6766 11.3367 18.2617 10.7818 17.7963C9.10026 16.3834 7.76065 14.7125 7.20015 12.5538C6.61722 10.311 6.74053 8.08501 7.66537 5.93753C8.75275 3.42 10.6641 1.78836 13.1751 0.823959C15.3275 -0.00026868 17.5639 -0.118015 19.8283 0.0894432C21.7901 0.268867 23.6174 0.829566 25.254 1.95096C26.5993 2.87051 27.6698 4.04237 28.3929 5.52262C29.2 7.17668 29.469 8.93167 29.3569 10.7371C29.256 12.4024 28.6675 13.9107 27.7091 15.2732C26.5208 16.9609 24.9962 18.2953 23.2474 19.3551C21.8181 20.2185 20.316 20.9699 18.8419 21.7605C17.1379 22.6744 15.4396 23.5996 14.0663 24.9957C12.8949 26.1844 12.2279 27.5805 12.3344 29.2906C12.4297 30.7597 13.0967 31.9315 14.2569 32.7894C16.4093 34.3818 18.7578 34.578 21.1904 33.552C22.4571 33.0193 23.4436 32.1054 24.0041 30.8214C24.4357 29.8289 24.503 28.786 23.9593 27.8216C23.3932 26.8236 22.7262 25.876 22.104 24.9116C22.0423 24.8163 21.9751 24.721 21.863 24.564C22.0535 24.5527 22.1657 24.5359 22.2834 24.5359C24.4525 24.5359 26.6217 24.5359 28.7964 24.5247C29.0655 24.5247 29.228 24.62 29.3738 24.8163C30.8479 26.8236 32.322 28.8253 33.8017 30.8326C35.8028 33.5351 37.8094 36.2377 39.8104 38.9403C39.872 39.0244 39.9169 39.1141 40.0009 39.2431C39.816 39.2543 39.7039 39.2599 39.5862 39.2599C37.417 39.2599 35.2479 39.2599 33.0731 39.2599C32.8545 39.2599 32.7032 39.215 32.5574 39.0188C31.3804 37.4096 30.1865 35.8172 28.9982 34.2192C28.9422 34.1463 28.8805 34.0734 28.7964 33.9669C28.5834 34.3201 28.3817 34.6453 28.1855 34.9705C27.1485 36.6582 25.6632 37.8413 23.9032 38.6936C22.53 39.3608 21.0839 39.7421 19.5649 39.871C19.4976 39.8766 19.436 39.9439 19.3743 39.9832L16.8128 39.9832L16.8072 40ZM13.1359 10.3895C13.1359 11.7015 13.7356 12.7388 14.5876 13.6696C15.5124 14.6732 16.6279 15.419 17.7993 16.0918C17.9394 16.1703 18.2141 16.1591 18.3598 16.0806C19.0885 15.6713 19.8171 15.2507 20.5066 14.7854C21.3081 14.2471 22.0199 13.5967 22.502 12.7388C23.04 11.78 23.197 10.7539 23.0344 9.67179C22.7934 8.01212 21.8686 6.87951 20.3608 6.21228C19.3407 5.76372 18.2701 5.72447 17.1715 5.85904C14.8062 6.14499 13.1191 8.02334 13.1247 10.3895L13.1359 10.3895Z`;

	const symbols: CellType[] = ['pixel', 'ampersand', 'underline'];

	const FOUR = ['XX  XX', 'XX  XX', 'XXXXXX', '    XX', '    XX'];
	const ZERO = ['XXXXXX', 'XX  XX', 'XX  XX', 'XX  XX', 'XXXXXX'];

	const digits = [FOUR, ZERO, FOUR];
	const digitWidth = Math.max(...digits.flatMap((digit) => digit.map((row) => row.length)));
	const rowCount = Math.max(...digits.map((digit) => digit.length));
	const gap = '  ';

	const asciiLines = Array.from({ length: rowCount }, (_, rowIndex) =>
		digits
			.map((digit) => (digit[rowIndex] ?? '').padEnd(digitWidth, ' '))
			.join(gap)
	);

	let filledIndex = 0;

	const grid: CellType[][] = asciiLines.map((line) =>
		line.split('').map((char) => {
			if (char !== 'X') return 'empty';
			const cellType = symbols[filledIndex % symbols.length];
			filledIndex += 1;
			return cellType;
		})
	);

	const columnCount = asciiLines[0]?.length ?? 0;
	const headline = status === 404 ? 'This pixel wandered off.' : 'Something got lost in the grid.';
	const detail =
		error?.message ??
		'The page you wanted clocked out early. Follow the trail of ampersands back to safety.';
</script>

<svelte:head>
	<title>{status} – Pixel &amp; Code</title>
</svelte:head>

<div class="error-page">
	<InteractiveBackground
		gridSize={48}
		fadeSpeed={6500}
		lagFactor={0.11}
		opacity={0.1}
		pathColor="var(--accent-orange)"
		squareColor="rgba(226, 232, 240, 0.28)"
	/>

	<div class="content">
		<div class="error-grid" style={`grid-template-columns: repeat(${columnCount}, var(--cell-size));`}>
			{#each grid as row, rowIndex}
				{#each row as cellType, columnIndex}
					<div
						class={`cell ${cellType}`}
						style={`--delay:${((rowIndex + columnIndex) * 0.12).toFixed(2)}s;`}
					>
						{#if cellType !== 'empty'}
							<div class="wave">
								{#if cellType === 'pixel'}
									<span class="dot" aria-hidden="true"></span>
								{:else if cellType === 'ampersand'}
									<svg class="ampersand" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
										<path d={ampersandPath}></path>
									</svg>
								{:else if cellType === 'underline'}
									<span class="underscore" aria-hidden="true"></span>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			{/each}
		</div>

		<div class="copy">
			<p class="status">Error {status}</p>
			<h1>{headline}</h1>
			<p class="detail">{detail}</p>
			<p>
				In the meantime, the homepage is still behaving.
				<a class="home-link" href="/">Take me back</a>
			</p>
		</div>
	</div>
</div>

<style>
	.error-page {
		position: relative;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: radial-gradient(circle at 15% 10%, rgba(241, 103, 74, 0.2), transparent 60%),
			radial-gradient(circle at 80% 0%, rgba(148, 163, 184, 0.12), transparent 55%), #020617;
		color: #f8fafc;
		font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		overflow: hidden;
	}

	.content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(2rem, 5vw, 3.25rem);
		max-width: 70rem;
		padding: clamp(3rem, 6vw, 5rem) clamp(1.75rem, 6vw, 3.5rem);
		text-align: center;
	}

	.error-grid {
		--cell-size: clamp(2.4rem, 4.8vw, 4rem);
		display: grid;
		gap: clamp(0.35rem, 1vw, 0.75rem);
		padding: clamp(1.35rem, 3.5vw, 2.25rem);
		border-radius: 1.25rem;
		background: linear-gradient(160deg, rgba(13, 20, 40, 0.72), rgba(10, 13, 25, 0.42));
		box-shadow: 0 32px 80px rgba(2, 6, 23, 0.85);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(148, 163, 184, 0.12);
	}

	.cell {
		width: var(--cell-size);
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: transform 0.28s ease, filter 0.28s ease, opacity 0.28s ease;
		transform-origin: center bottom;
	}

	.cell.empty {
		opacity: 0.12;
		pointer-events: none;
	}

	:global(:root) {
		--accent-orange: var(--color-primary, #f1674a);
		--accent-light: rgba(248, 250, 252, 0.92);
		--accent-glow: rgba(241, 103, 74, 0.46);
	}

	.wave {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		animation: wave-bob 5.6s ease-in-out infinite;
		animation-delay: var(--delay, 0s);
	}

		.cell:not(.empty):hover {
			transform: translateY(-0.45rem) scale(1.07);
			filter: drop-shadow(0 0 20px var(--accent-glow));
		}

	.cell:not(.empty):hover .wave {
		animation-play-state: paused;
	}

	.cell.pixel .dot {
		width: 36%;
		aspect-ratio: 1;
		border-radius: 0.25rem;
		background: var(--accent-orange);
		box-shadow: 0 6px 18px rgba(241, 103, 74, 0.35);
		margin-bottom: 18%;
	}

	.cell.ampersand .ampersand {
		width: 82%;
		height: auto;
		display: block;
		color: var(--accent-light);
		filter: drop-shadow(0 12px 26px rgba(248, 250, 252, 0.25));
		margin-bottom: 15%;
	}

	.cell.ampersand .ampersand path {
		fill: currentColor;
	}

	.cell.underline .underscore {
		width: 78%;
		height: 0.32rem;
		border-radius: 999px;
		background: rgba(241, 103, 74, 0.9);
		box-shadow: 0 6px 18px rgba(241, 103, 74, 0.35);
		margin-bottom: 12%;
	}

	.copy {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		max-width: 32rem;
	}

	.copy .status {
		font-size: 0.95rem;
		letter-spacing: 0.36em;
		text-transform: uppercase;
		color: rgba(248, 250, 252, 0.54);
	}

	.copy h1 {
		font-size: clamp(2rem, 4.5vw, 2.7rem);
		font-weight: 600;
		line-height: 1.3;
		color: rgba(248, 250, 252, 0.94);
	}

	.copy .detail {
		max-width: 30rem;
	}
	.detail,
	.copy p {
		font-size: clamp(1rem, 2.4vw, 1.15rem);
		line-height: 1.7;
		color: rgba(226, 232, 240, 0.75);
	}

	.home-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-left: 0.5rem;
		padding: 0.55rem 1.35rem;
		border-radius: 999px;
		font-weight: 600;
		color: #0f172a;
		background: var(--accent-orange);
		box-shadow: 0 16px 30px rgba(241, 103, 74, 0.35);
		transition: transform 0.25s ease, box-shadow 0.25s ease;
	}

	.home-link:hover {
		transform: translateY(-2px);
		box-shadow: 0 18px 40px rgba(241, 103, 74, 0.42);
	}

	@keyframes wave-bob {
		0%,
		100% {
			transform: translateY(0);
		}

		25% {
			transform: translateY(-6%);
		}

		50% {
			transform: translateY(5%);
		}

		75% {
			transform: translateY(-3%);
		}
	}

	@media (max-width: 720px) {
		.error-grid {
			gap: 0.3rem;
			padding: 1.4rem;
			border-radius: 1rem;
		}

		.copy {
			gap: 0.85rem;
		}
	}
	@media (max-width: 540px) {
		.error-grid {
			--cell-size: clamp(1.9rem, 9vw, 2.4rem);
		}

		.copy .status {
			letter-spacing: 0.28em;
		}
	}

</style>
