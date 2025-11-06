<script lang="ts">
	import logoOutline from '$lib/assets/logooutline.svg?raw';

	export let ariaLabel = 'Pixelcode neon sign';
	export let size = 'clamp(12rem, 32vw, 26rem)';
	export let className: string | undefined = undefined;
	export let decorative = false;

	const classes = ['neon-sign', className].filter(Boolean).join(' ');
</script>

<div
	class={classes}
	role={decorative ? undefined : 'img'}
	aria-label={decorative ? undefined : ariaLabel}
	aria-hidden={decorative ? 'true' : undefined}
	style={`--sign-size: ${size};`}
>
	<div class="neon-halo" aria-hidden="true"></div>
	<div class="neon-inner" aria-hidden="true">
		{@html logoOutline}
	</div>
</div>

<style>
	.neon-sign {
		--neon-main: var(--color-primary, #f35b3f);
		--neon-secondary: #ff9a7f;
		--neon-hot: #ffe6dc;
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: clamp(1rem, 3vw, 2.25rem);
		filter: saturate(1.1);
		isolation: isolate;
	}

	.neon-halo {
		position: absolute;
		inset: -65% -55%;
		background: radial-gradient(circle, rgba(243, 91, 63, 0.6), transparent 65%);
		filter: blur(clamp(60px, 8vw, 140px));
		opacity: 0.85;
		pointer-events: none;
		mix-blend-mode: screen;
		animation: slowPulse 9s ease-in-out infinite;
	}

	.neon-inner {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		filter:
			drop-shadow(0 0 16px rgba(243, 91, 63, 0.95))
			drop-shadow(0 0 32px rgba(243, 91, 63, 0.6))
			drop-shadow(0 0 68px rgba(243, 91, 63, 0.4))
			drop-shadow(0 0 110px rgba(243, 91, 63, 0.3));
		animation: flicker 8s linear infinite, slowPulse 6s ease-in-out infinite alternate;
	}

	:global(.neon-inner svg) {
		width: var(--sign-size);
		height: auto;
		max-width: min(100%, 540px);
		display: block;
	}

	:global(.neon-inner svg path) {
		stroke: var(--neon-main) !important;
		stroke-width: 105;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: transparent;
		paint-order: stroke;
		filter: drop-shadow(0 0 6px rgba(243, 91, 63, 0.8));
	}

	@keyframes flicker {
		0%,
		18%,
		22%,
		35%,
		55%,
		100% {
			opacity: 1;
			filter:
				drop-shadow(0 0 16px rgba(243, 91, 63, 0.95))
				drop-shadow(0 0 32px rgba(243, 91, 63, 0.6))
				drop-shadow(0 0 68px rgba(243, 91, 63, 0.4))
				drop-shadow(0 0 110px rgba(243, 91, 63, 0.3));
		}
		19%,
		21%,
		53% {
			opacity: 0.7;
			filter:
				drop-shadow(0 0 10px rgba(243, 91, 63, 0.75))
				drop-shadow(0 0 22px rgba(243, 91, 63, 0.45))
				drop-shadow(0 0 32px rgba(243, 91, 63, 0.28))
				drop-shadow(0 0 60px rgba(243, 91, 63, 0.2));
		}
		24%,
		50%,
		70% {
			opacity: 0.85;
		}
	}

	@keyframes slowPulse {
		0% {
			opacity: 0.75;
			transform: scale(0.995);
		}
		50% {
			opacity: 1;
			transform: scale(1.01);
		}
		100% {
			opacity: 0.8;
			transform: scale(0.995);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.neon-inner,
		.neon-halo {
			animation: none;
		}
	}
</style>
