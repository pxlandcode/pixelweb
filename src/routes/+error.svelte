<script lang="ts">
	import { browser } from '$app/environment';
	import InteractiveBackground from '$lib/components/backgrounds/InteractiveBackground.svelte';
	import { PixelButton } from '$lib/components/pixel-button';
	import { Drawer, Input, FormControl } from '@pixelcode_/blocks/components';
	import { ampersandPath } from '$lib/graphics/ampersand';
	import { onDestroy, onMount, tick } from 'svelte';

	export let error: Error & { message?: string };
	export let status: number;

	type Vec = { x: number; y: number };
	type HighScoreEntry = {
		id: string;
		player_name: string;
		score: number;
		created_at: string;
	};

	const GRID_COLS = 24;
	const GRID_ROWS = 18;
	const INITIAL_STEP = 180;
	const MIN_STEP = 95;
	const SPEED_RAMP = 3;
	const TAIL_THICKNESS_RATIO = 0.24;

	let canvas: HTMLCanvasElement | null = null;
	let ctx: CanvasRenderingContext2D | null = null;
	let focusTarget: HTMLDivElement | null = null;
	let nameInput: HTMLInputElement | null = null;

	let cellSize = 16;
	let animationFrame: number | null = null;
	let moveStart = 0;
	let stepDuration = INITIAL_STEP;
	let pausedProgress = 0;

	let snake: Vec[] = [];
	let lastSnake: Vec[] = [];
	let direction: Vec = { x: 1, y: 0 };
	let queuedDirection: Vec | null = null;
	let food: Vec = { x: 0, y: 0 };
	let running = false;
	let paused = false;
	let gameOver = false;
	let awaitingRestart = true;

	let score = 0;
	let sessionBest = 0;
	let pendingSubmissionScore: number | null = null;

	let leaderboardState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
	let leaderboard: HighScoreEntry[] = [];
	let leaderboardError = '';

	let playerName = '';
	let submissionState: 'idle' | 'sending' | 'success' | 'error' = 'idle';
	let submissionMessage = '';
	let showSubmissionForm = false;

	let isMobileDevice = false;

	let ampersandPath2D: Path2D | null = null;
	let ampersandColor = '#f35b3f';
	let snakeHeadColor = 'rgba(248, 250, 252, 0.96)';
	let snakeBodyColor = 'rgba(226, 232, 240, 0.88)';
	let snakeTailColor = 'rgba(226, 232, 240, 0.82)';
	let boardBackground = '#1e1e1e';
	let gridColor = 'rgba(148, 163, 184, 0.18)';
	let headGlow = 'rgba(241, 103, 74, 0.38)';

	const headline =
		status === 404
			? 'This pixel wandered off, but the snake stayed.'
			: 'Something got lost in the grid.';
	const detail =
		error?.message ??
		'We turned the detour into a playground. Have a round of Snake while we guide you back.';

	const instructionsId = 'snake-controls';

	function readCssVar(name: string, fallback: string) {
		if (!browser) return fallback;
		const value = getComputedStyle(document.documentElement).getPropertyValue(name);
		return value?.trim() || fallback;
	}

	function prepareNewGame() {
		const midY = Math.floor(GRID_ROWS / 2);
		const startX = Math.floor(GRID_COLS / 3);
		snake = [
			{ x: startX, y: midY },
			{ x: startX - 1, y: midY }
		];
		lastSnake = snake.map((segment) => ({ ...segment }));
		direction = { x: 1, y: 0 };
		queuedDirection = null;
		score = 0;
		stepDuration = INITIAL_STEP;
		pausedProgress = 0;
		paused = false;
		running = false;
		awaitingRestart = true;
		gameOver = false;
		pendingSubmissionScore = null;
		submissionState = 'idle';
		submissionMessage = '';
		showSubmissionForm = false;
		spawnFood();
	}

	function startRun() {
		if (running) return;
		running = true;
		awaitingRestart = false;
		gameOver = false;
		moveStart = performance.now();
		pausedProgress = 0;
	}

	function restart() {
		prepareNewGame();
		startRun();
		tick().then(() => {
			focusTarget?.focus();
		});
	}

	function spawnFood(state: Vec[] = snake) {
		const occupied = new Set(state.map(({ x, y }) => `${x},${y}`));
		let attempts = 0;
		let next: Vec = { x: 0, y: 0 };
		do {
			next = {
				x: Math.floor(Math.random() * GRID_COLS),
				y: Math.floor(Math.random() * GRID_ROWS)
			};
			attempts += 1;
		} while (occupied.has(`${next.x},${next.y}`) && attempts < 500);
		food = next;
	}

	function isOpposite(a: Vec, b: Vec) {
		return a.x === -b.x && a.y === -b.y;
	}

	function queueDirection(next: Vec) {
		if (gameOver) return;
		const baseline = queuedDirection ?? direction;
		if (snake.length > 1 && isOpposite(next, baseline)) {
			return;
		}
		queuedDirection = next;
		if (!running) {
			startRun();
		}
	}

	function moveSnake() {
		const previous = snake.map((segment) => ({ ...segment }));
		lastSnake = previous;

		if (queuedDirection && !isOpposite(queuedDirection, direction)) {
			direction = queuedDirection;
		}
		queuedDirection = null;

		const head = previous[0];
		const nextHead = { x: head.x + direction.x, y: head.y + direction.y };

		const hitsWall =
			nextHead.x < 0 || nextHead.x >= GRID_COLS || nextHead.y < 0 || nextHead.y >= GRID_ROWS;
		const willEat = nextHead.x === food.x && nextHead.y === food.y;

		const bodyToCheck = willEat ? previous : previous.slice(0, previous.length - 1);
		const hitsSelf = bodyToCheck.some(
			(segment) => segment.x === nextHead.x && segment.y === nextHead.y
		);

		if (hitsWall || hitsSelf) {
			handleGameOver();
			return;
		}

		const newSnake = [nextHead, ...previous];

		if (!willEat) {
			newSnake.pop();
		} else {
			score += 1;
			pendingSubmissionScore = score;
			stepDuration = Math.max(MIN_STEP, stepDuration - SPEED_RAMP);
			spawnFood(newSnake);
		}

		snake = newSnake;
	}

	function handleGameOver() {
		running = false;
		paused = false;
		pausedProgress = 0;
		awaitingRestart = false;
		gameOver = true;
		sessionBest = Math.max(sessionBest, score);
		pendingSubmissionScore = score;
		if (score > 0) {
			showSubmissionForm = true;
		}
	}

	function togglePause() {
		if (gameOver) return;
		if (!running) {
			startRun();
			return;
		}
		if (paused) {
			paused = false;
			moveStart = performance.now() - pausedProgress * stepDuration;
			pausedProgress = 0;
		} else {
			paused = true;
			pausedProgress = Math.min((performance.now() - moveStart) / stepDuration, 1);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		const lowered = event.key.toLowerCase();
		if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(lowered)) {
			event.preventDefault();
		}

		if (showSubmissionForm) {
			if (lowered === 'escape') {
				event.preventDefault();
				skipSubmission();
			}
			return;
		}

		switch (lowered) {
			case 'arrowup':
			case 'w':
				queueDirection({ x: 0, y: -1 });
				break;
			case 'arrowdown':
			case 's':
				queueDirection({ x: 0, y: 1 });
				break;
			case 'arrowleft':
			case 'a':
				queueDirection({ x: -1, y: 0 });
				break;
			case 'arrowright':
			case 'd':
				queueDirection({ x: 1, y: 0 });
				break;
			case 'enter':
				if (gameOver) {
					event.preventDefault();
					restart();
				}
				break;
		}
	}

	function formatDate(input: string) {
		try {
			return new Intl.DateTimeFormat(undefined, {
				month: 'short',
				day: 'numeric'
			}).format(new Date(input));
		} catch (error) {
			return '';
		}
	}

	async function loadLeaderboard() {
		leaderboardState = 'loading';
		leaderboardError = '';
		try {
			const response = await fetch('/api/highscore');
			const payload = (await response.json().catch(() => ({}))) as {
				scores?: HighScoreEntry[];
				error?: string;
			};
			if (!response.ok) {
				throw new Error(payload?.error ?? 'Unable to load high scores.');
			}
			leaderboard = payload?.scores ?? [];
			leaderboardState = 'ready';
		} catch (error) {
			leaderboard = [];
			leaderboardState = 'error';
			leaderboardError =
				error instanceof Error
					? error.message
					: "The high scores are hiding. Here's what you did this session:";
		}
	}

	async function submitScore() {
		if (!pendingSubmissionScore || pendingSubmissionScore <= 0) {
			submissionState = 'error';
			submissionMessage = 'You need to score some points first!';
			return;
		}

		const trimmed = playerName.trim();
		if (!trimmed) {
			submissionState = 'error';
			submissionMessage = 'Every legend needs a name!';
			return;
		}

		submissionState = 'sending';
		submissionMessage = '';

		try {
			const response = await fetch('/api/highscore', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: trimmed.slice(0, 64), score: pendingSubmissionScore })
			});
			const payload = (await response.json().catch(() => ({}))) as {
				error?: string;
			};

			if (!response.ok) {
				throw new Error(payload?.error ?? 'The leaderboard refused your greatness.');
			}

			submissionState = 'success';
			submissionMessage = "You're on the board! 🎉";
			playerName = trimmed;
			showSubmissionForm = false;
			pendingSubmissionScore = null;
			await loadLeaderboard();
		} catch (error) {
			submissionState = 'error';
			submissionMessage =
				error instanceof Error ? error.message : 'The leaderboard is taking a coffee break.';
		}
	}

	function skipSubmission() {
		showSubmissionForm = false;
		pendingSubmissionScore = null;
		if (submissionState !== 'success') {
			submissionState = 'idle';
			submissionMessage = '';
		}
	}

	function focusGame() {
		focusTarget?.focus();
	}

	function resizeCanvas() {
		if (!browser || !canvas || !ctx) return;
		const displayWidth = canvas.clientWidth;
		const displayHeight = canvas.clientHeight;
		const dpr = window.devicePixelRatio ?? 1;
		canvas.width = displayWidth * dpr;
		canvas.height = displayHeight * dpr;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(dpr, dpr);
		cellSize = displayWidth / GRID_COLS;
	}

	function draw(progress: number) {
		if (!ctx || !canvas) return;

		const width = canvas.clientWidth;
		const height = canvas.clientHeight;

		ctx.clearRect(0, 0, width, height);

		ctx.fillStyle = boardBackground;
		ctx.fillRect(0, 0, width, height);

		ctx.save();
		ctx.strokeStyle = gridColor;
		ctx.lineWidth = 1;
		ctx.beginPath();
		for (let col = 1; col < GRID_COLS; col += 1) {
			const x = col * cellSize;
			ctx.moveTo(x, 0);
			ctx.lineTo(x, height);
		}
		for (let row = 1; row < GRID_ROWS; row += 1) {
			const y = row * cellSize;
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
		}
		ctx.globalAlpha = 0.35;
		ctx.stroke();
		ctx.restore();

		drawFood();
		drawSnake(progress);
	}

	function drawFood() {
		if (!ctx || !ampersandPath2D) return;
		ctx.save();
		const centerX = (food.x + 0.5) * cellSize;
		const centerY = (food.y + 0.5) * cellSize;
		const scale = cellSize / 40;
		ctx.translate(centerX, centerY);
		ctx.scale(scale, scale);
		ctx.translate(-20, -20);
		ctx.shadowColor = ampersandColor;
		ctx.shadowBlur = cellSize * 0.6;
		ctx.fillStyle = ampersandColor;
		ctx.fill(ampersandPath2D);
		ctx.restore();
	}

	function drawSnake(progress: number) {
		if (!ctx) return;
		const segments = snake;
		const previous = lastSnake;

		for (let index = segments.length - 1; index >= 0; index -= 1) {
			const end = segments[index];
			const start = previous[index] ?? previous[previous.length - 1] ?? end;
			const x = (start.x + (end.x - start.x) * progress) * cellSize;
			const y = (start.y + (end.y - start.y) * progress) * cellSize;

			if (index === segments.length - 1) {
				drawTailSegment(x, y);
			} else {
				drawBodySegment(x, y, index === 0);
			}
		}
	}

	function drawBodySegment(x: number, y: number, isHead: boolean) {
		if (!ctx) return;
		const margin = cellSize * 0.18;
		const size = cellSize - margin * 2;
		ctx.save();
		ctx.fillStyle = isHead ? snakeHeadColor : snakeBodyColor;
		if (isHead) {
			ctx.shadowColor = headGlow;
			ctx.shadowBlur = cellSize * 0.6;
		}
		ctx.fillRect(x + margin, y + margin, size, size);
		ctx.restore();
	}

	function drawTailSegment(x: number, y: number) {
		if (!ctx) return;
		const underlineWidth = cellSize * 0.76;
		const thickness = Math.max(2, cellSize * TAIL_THICKNESS_RATIO);
		const offsetX = (cellSize - underlineWidth) / 2;
		const baseY = y + cellSize - thickness;
		ctx.save();
		ctx.fillStyle = snakeTailColor;
		ctx.fillRect(x + offsetX, baseY, underlineWidth, thickness);
		ctx.restore();
	}

	function loop(timestamp: number) {
		if (!ctx || !canvas) {
			animationFrame = requestAnimationFrame(loop);
			return;
		}
		let progress = 0;
		if (running) {
			if (paused) {
				progress = pausedProgress;
			} else {
				let elapsed = timestamp - moveStart;
				while (elapsed >= stepDuration && running) {
					moveSnake();
					moveStart += stepDuration;
					elapsed -= stepDuration;
				}
				if (!running) {
					progress = 0;
				} else {
					progress = Math.min(elapsed / stepDuration, 1);
				}
			}
		}
		draw(progress);
		animationFrame = requestAnimationFrame(loop);
	}

	prepareNewGame();

	let resizeHandler: (() => void) | null = null;
	let visibilityHandler: (() => void) | null = null;

	function handleCanvasTouch(event: TouchEvent) {
		const target = event.target as HTMLElement;

		// Don't prevent default if touching form elements or buttons
		if (
			target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.tagName === 'BUTTON' ||
			target.tagName === 'LABEL' ||
			target.closest('form') ||
			target.closest('button') ||
			target.closest('input') ||
			target.closest('label')
		) {
			return;
		}

		event.preventDefault();

		// If game is over, restart on any touch
		if (gameOver) {
			restart();
			return;
		}

		const touch = event.touches[0];
		const rect = (event.target as HTMLElement).getBoundingClientRect();
		const x = touch.clientX - rect.left;
		const y = touch.clientY - rect.top;
		const width = rect.width;
		const height = rect.height;

		// Divide canvas into 4 zones: top, bottom, left, right
		const centerX = width / 2;
		const centerY = height / 2;
		const relX = x - centerX;
		const relY = y - centerY;

		// Determine which direction based on which zone is touched
		if (Math.abs(relX) > Math.abs(relY)) {
			// Horizontal
			if (relX > 0) {
				queueDirection({ x: 1, y: 0 }); // Right
			} else {
				queueDirection({ x: -1, y: 0 }); // Left
			}
		} else {
			// Vertical
			if (relY > 0) {
				queueDirection({ x: 0, y: 1 }); // Down
			} else {
				queueDirection({ x: 0, y: -1 }); // Up
			}
		}
	}

	onMount(() => {
		if (!browser) return;

		// Detect if device is mobile/tablet
		isMobileDevice =
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
			('ontouchstart' in window && navigator.maxTouchPoints > 0);

		ctx = canvas?.getContext('2d') ?? null;
		if (!ctx) {
			return;
		}

		ampersandPath2D = new Path2D(ampersandPath);
		ampersandColor = readCssVar('--color-primary', ampersandColor);
		snakeBodyColor = readCssVar('--accent-light', snakeBodyColor);
		snakeTailColor = snakeBodyColor;
		headGlow = readCssVar('--accent-glow', headGlow);

		resizeCanvas();
		draw(0);

		resizeHandler = () => resizeCanvas();
		visibilityHandler = () => {
			if (document.hidden && running && !paused && !gameOver) {
				togglePause();
			}
		};

		window.addEventListener('resize', resizeHandler);
		document.addEventListener('visibilitychange', visibilityHandler);

		// Add touch event listeners with passive: false to prevent scrolling
		if (focusTarget) {
			focusTarget.addEventListener('touchstart', handleCanvasTouch as EventListener, {
				passive: false
			});
			focusTarget.addEventListener(
				'touchmove',
				(e: Event) => {
					const target = e.target as HTMLElement;
					// Don't prevent default if touching form elements
					if (
						target.tagName === 'INPUT' ||
						target.tagName === 'TEXTAREA' ||
						target.tagName === 'BUTTON' ||
						target.tagName === 'LABEL' ||
						target.closest('form') ||
						target.closest('button') ||
						target.closest('input') ||
						target.closest('label')
					) {
						return;
					}
					e.preventDefault();
				},
				{
					passive: false
				}
			);
		}

		animationFrame = requestAnimationFrame(loop);

		loadLeaderboard();

		tick().then(() => {
			focusTarget?.focus();
		});
	});

	onDestroy(() => {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
		}
		if (resizeHandler) {
			window.removeEventListener('resize', resizeHandler);
		}
		if (visibilityHandler) {
			document.removeEventListener('visibilitychange', visibilityHandler);
		}
		if (focusTarget) {
			focusTarget.removeEventListener('touchstart', handleCanvasTouch as EventListener);
			focusTarget.removeEventListener('touchmove', (e: Event) => e.preventDefault());
		}
	});

	$: if (showSubmissionForm) {
		tick().then(() => {
			nameInput?.focus();
			nameInput?.select();
		});
	}
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
		<header class="intro">
			<p class="status">Error {status}</p>
			<h1>{headline}</h1>
			<p class="detail">{detail}</p>
		</header>

		<div class="layout">
			<section class="card game-card">
				<div class="hud">
					<div class="score-block">
						<span class="label">Score</span>
						<span class="value">{score}</span>
					</div>
					<div class="score-block">
						<span class="label">Session best</span>
						<span class="value">{sessionBest}</span>
					</div>
				</div>

				<div
					class="canvas-shell"
					bind:this={focusTarget}
					tabindex="0"
					role="application"
					aria-labelledby={instructionsId}
					aria-live="off"
					on:keydown={handleKeydown}
					on:click={focusGame}
				>
					<canvas bind:this={canvas} class="game-canvas" aria-hidden="true"></canvas>

					{#if !running && awaitingRestart && !gameOver}
						<div class="overlay hint">
							{#if isMobileDevice}
								<p>Tap any side of the board to start moving.</p>
							{:else}
								<p>Use the arrow keys or WASD to start moving.</p>
							{/if}
						</div>
					{/if}

					{#if paused && running && !gameOver}
						<div class="overlay paused">
							<p>Paused</p>
						</div>
					{/if}

					{#if gameOver}
						<div class="overlay game-over">
							<div class="overlay-inner">
								<p class="headline">Game over</p>
								<p class="score-line">Final score: {score}</p>
								{#if isMobileDevice}
									<p class="tap-hint">Tap to play again</p>
								{:else}
									<p class="tap-hint">Press Enter to play again</p>
								{/if}
							</div>
						</div>
					{/if}
				</div>

				<div class="instructions" id={instructionsId}>
					{#if isMobileDevice}
						<p>
							<strong>How to play:</strong> Tap the top, bottom, left, or right side of the game board
							to move in that direction. Tap anywhere to restart after game over.
						</p>
					{:else}
						<p>
							<strong>How to play:</strong> Use arrow keys or WASD to steer. Press Enter to restart after
							game over.
						</p>
					{/if}
				</div>
			</section>

			<aside class="card leaderboard-card">
				<h2>Top scores</h2>
				{#if leaderboardState === 'loading'}
					<p class="muted">Loading the hall of fame…</p>
				{:else if leaderboardState === 'error'}
					<p class="muted">
						{leaderboardError}
					</p>
					<ul class="fallback-list">
						<li>
							<span class="name">Session best</span>
							<span class="score">{sessionBest}</span>
						</li>
					</ul>
				{:else if leaderboard.length === 0}
					<p class="muted">The leaderboard is empty! Be the first to claim glory!</p>
				{:else}
					<ol>
						{#each leaderboard as entry, index}
							<li>
								<span class="rank">#{index + 1}</span>
								<span class="name">{entry.player_name}</span>
								<span class="score">{entry.score}</span>
								<span class="date">{formatDate(entry.created_at)}</span>
							</li>
						{/each}
					</ol>
				{/if}

				{#if submissionMessage}
					<p class={`submission-feedback ${submissionState}`} aria-live="polite">
						{submissionMessage}
					</p>
				{/if}
			</aside>
		</div>

		<a class="home-link" href="/">Take me back</a>
	</div>
</div>

<Drawer bind:open={showSubmissionForm} variant="bottom" title="Save your score" dismissable>
	<form class="score-drawer-form" on:submit|preventDefault={submitScore}>
		<FormControl label="Your name" required class="gap-2">
			<Input
				id="player-name"
				bind:element={nameInput}
				bind:value={playerName}
				name="player-name"
				maxlength={64}
				autocomplete="name"
				placeholder="Enter your name"
				required
			/>
		</FormControl>

		<div class="score-display">
			<span class="score-label">Your score:</span>
			<span class="score-value">{pendingSubmissionScore}</span>
		</div>

		{#if submissionMessage}
			<p class="submission-feedback {submissionState}" role="alert">
				{submissionMessage}
			</p>
		{/if}

		<div class="drawer-actions">
			<PixelButton
				type="submit"
				variant="primary"
				size="md"
				disabled={submissionState === 'sending'}
			>
				{submissionState === 'sending' ? 'Saving…' : 'Submit'}
			</PixelButton>
			<PixelButton type="button" variant="outline" size="md" on:click={skipSubmission}>
				Skip
			</PixelButton>
		</div>
	</form>
</Drawer>

<style>
	:global(:root) {
		--accent-orange: var(--color-primary, #f35b3f);
		--accent-light: rgba(248, 250, 252, 0.92);
		--accent-glow: rgba(241, 103, 74, 0.46);
	}

	.error-page {
		position: relative;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: clamp(3rem, 6vw, 5rem) clamp(1.75rem, 6vw, 3.5rem);
		background: hsl(var(--background));
		color: #f8fafc;
		font-family:
			'Montserrat',
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
		overflow: hidden;
	}

	@media (max-width: 640px) {
		.error-page {
			padding: clamp(2rem, 4vw, 3rem) clamp(0.75rem, 3vw, 1.5rem);
		}
	}

	.content {
		position: relative;
		z-index: 1;
		width: min(1100px, 100%);
		display: flex;
		flex-direction: column;
		gap: clamp(2rem, 4vw, 3.2rem);
	}

	.intro {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		text-align: center;
	}

	.intro .status {
		letter-spacing: 0.32em;
		text-transform: uppercase;
		font-size: 0.9rem;
		color: rgba(248, 250, 252, 0.54);
	}

	.intro h1 {
		font-size: clamp(2.2rem, 4vw, 3rem);
		font-weight: 600;
		color: rgba(248, 250, 252, 0.94);
		line-height: 1.3;
	}

	.intro .detail {
		max-width: 38rem;
		margin: 0 auto;
		color: rgba(226, 232, 240, 0.78);
		line-height: 1.7;
	}

	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: clamp(1.5rem, 3vw, 2.5rem);
		align-items: start;
	}

	@media (min-width: 960px) {
		.layout {
			grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
		}
	}

	.card {
		position: relative;
		padding: clamp(1.6rem, 3vw, 2.4rem);
		border-radius: 8px;
		background: var(--color-card-bg, #1e1e1e);
		border: 1px solid var(--color-card-border, rgba(255, 255, 255, 0.05));
		box-shadow: none;
	}

	@media (max-width: 640px) {
		.card {
			padding: clamp(1rem, 2.5vw, 1.5rem);
		}
	}

	.game-card {
		display: flex;
		flex-direction: column;
		gap: clamp(1.4rem, 3vw, 2.2rem);
	}

	.hud {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.score-block {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 6rem;
	}

	.score-block .label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.24em;
		color: rgba(148, 163, 184, 0.8);
	}

	.score-block .value {
		font-size: clamp(1.6rem, 3vw, 2.2rem);
		font-weight: 600;
		color: rgba(248, 250, 252, 0.95);
	}

	.pause-button {
		appearance: none;
		border: 1px solid rgba(241, 103, 74, 0.6);
		background: rgba(241, 103, 74, 0.18);
		color: var(--accent-orange);
		font-weight: 600;
		border-radius: 0.125rem;
		padding: 0.55rem 1.45rem;
		transition:
			background 0.2s ease,
			transform 0.2s ease,
			border-color 0.2s ease;
	}

	.pause-button:hover:not(:disabled),
	.pause-button:focus-visible {
		background: rgba(241, 103, 74, 0.28);
		transform: translateY(-1px);
		outline: none;
	}

	.pause-button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.canvas-shell {
		position: relative;
		width: 100%;
		aspect-ratio: 24 / 18;
		border-radius: 8px;
		overflow: hidden;
		border: 1px solid var(--color-card-border, rgba(255, 255, 255, 0.05));
		background: var(--color-card-bg, #1e1e1e);
		outline: none;
		box-shadow: none;
		touch-action: none;
	}

	.canvas-shell:focus-visible {
		box-shadow: 0 0 0 2px rgba(241, 103, 74, 0.65);
	}

	.game-canvas {
		width: 100%;
		height: 100%;
		display: block;
	}

	.overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: clamp(1.5rem, 3vw, 2rem);
		background: rgba(30, 30, 30, 0.95);
		backdrop-filter: blur(6px);
	}

	.overlay.hint {
		background: rgba(30, 30, 30, 0.85);
	}

	.overlay.paused {
		background: rgba(30, 30, 30, 0.9);
	}

	.overlay-inner {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
		width: min(24rem, 100%);
	}

	.overlay .headline {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--accent-light);
	}

	.overlay .score-line {
		font-size: 1rem;
		color: rgba(226, 232, 240, 0.8);
	}

	.tap-hint {
		margin-top: 1rem;
		font-size: 0.95rem;
		color: rgba(148, 163, 184, 0.9);
		font-weight: 500;
		letter-spacing: 0.05em;
	}

	.overlay-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.overlay button,
	.overlay .primary {
		appearance: none;
		border-radius: 0.125rem;
		border: 1px solid rgba(241, 103, 74, 0.6);
		background: rgba(241, 103, 74, 0.18);
		color: var(--accent-orange);
		font-weight: 600;
		padding: 0.55rem 1.4rem;
		cursor: pointer;
		transition:
			background 0.2s ease,
			transform 0.2s ease;
	}

	.overlay button:hover,
	.overlay button:focus-visible {
		background: rgba(241, 103, 74, 0.3);
		transform: translateY(-1px);
		outline: none;
	}

	.score-drawer-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 1rem 0;
	}

	.score-display {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		background: var(--color-message-bg, #2a2a2a);
		border-radius: 8px;
		border: 1px solid var(--color-card-border, rgba(255, 255, 255, 0.05));
	}

	.score-label {
		font-size: 0.9rem;
		color: rgba(148, 163, 184, 0.9);
	}

	.score-value {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--accent-light);
	}

	.drawer-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.instructions {
		font-size: 0.95rem;
		line-height: 1.6;
		color: rgba(226, 232, 240, 0.75);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.instructions strong {
		color: var(--accent-light);
	}

	.touch-note {
		font-size: 0.85rem;
		color: rgba(148, 163, 184, 0.8);
	}

	.leaderboard-card {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.leaderboard-card h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--accent-light);
	}

	.leaderboard-card ol,
	.leaderboard-card ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.leaderboard-card li {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 0.6rem 0.85rem;
		align-items: baseline;
		background: var(--color-message-bg, #2a2a2a);
		padding: 0.75rem 1rem;
		border-radius: 8px;
		border: 1px solid var(--color-card-border, rgba(255, 255, 255, 0.05));
	}

	.leaderboard-card .rank {
		font-weight: 600;
		color: var(--accent-orange);
	}

	.leaderboard-card .name {
		font-weight: 500;
		color: rgba(248, 250, 252, 0.92);
	}

	.leaderboard-card .score {
		justify-self: end;
		font-weight: 600;
		color: rgba(248, 250, 252, 0.9);
	}

	.leaderboard-card .date {
		grid-column: 2 / span 2;
		font-size: 0.75rem;
		color: rgba(148, 163, 184, 0.75);
	}

	.fallback-list li {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		background: var(--color-message-bg, #2a2a2a);
		padding: 0.75rem 1rem;
		border-radius: 8px;
		border: 1px solid var(--color-card-border, rgba(255, 255, 255, 0.05));
	}

	.muted {
		color: rgba(148, 163, 184, 0.82);
		line-height: 1.6;
	}

	.submission-feedback {
		font-size: 0.85rem;
	}

	.submission-feedback.success {
		color: var(--color-primary);
	}

	.submission-feedback.error {
		color: rgba(248, 113, 113, 0.9);
	}

	.submission-feedback.sending,
	.submission-feedback.idle {
		color: rgba(148, 163, 184, 0.85);
	}

	.home-link {
		align-self: center;
		color: var(--accent-light);
		border-bottom: 1px solid rgba(248, 250, 252, 0.4);
		padding-bottom: 0.2rem;
		transition:
			color 0.2s ease,
			border-color 0.2s ease;
	}

	.home-link:hover,
	.home-link:focus-visible {
		color: var(--accent-orange);
		border-color: rgba(241, 103, 74, 0.6);
		outline: none;
	}

	@media (max-width: 640px) {
		.overlay {
			padding: 1.25rem;
		}

		.overlay .headline {
			font-size: 1.3rem;
		}

		.score-block {
			min-width: auto;
		}
	}
</style>
