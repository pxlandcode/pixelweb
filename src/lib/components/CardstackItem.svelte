<script lang="ts">
	export let title: string;
	export let eyebrow: string | undefined = undefined;
	export let description: string | undefined = undefined;
	export let link: { href: string; label: string } | undefined = undefined;
</script>

<li class="stack-card js-stack-cards__item">
	<div class="stack-card__content">
		{#if eyebrow}
			<p class="stack-card__eyebrow">{eyebrow}</p>
		{/if}
		<h3 class="stack-card__title">{title}</h3>
		{#if description}
			<p class="stack-card__description">{description}</p>
		{/if}
		<slot />
		{#if link}
			<a class="stack-card__link" href={link.href}>{link.label}</a>
		{/if}
	</div>
</li>

<style>
	.stack-card {
		background: #ffffff;
		border-radius: 0;
		border: 1px solid rgba(17, 19, 29, 0.08);
		box-shadow: none;
		color: inherit;
		display: grid;
		grid-template-columns: clamp(5.5rem, 12vw, 9rem) minmax(0, 1fr);
		min-height: clamp(24rem, 75vh, 32rem);
		overflow: hidden;
		padding: clamp(2.25rem, 5vw, 4rem);
		position: sticky;
		top: 0;
		transform-origin: center top;
		transition: transform 160ms ease-out;
		will-change: transform;
		counter-increment: cardstack;
	}

	.stack-card::before {
		content: '(' counter(cardstack, decimal-leading-zero) ')';
		font-size: clamp(3.25rem, 10vw, 6rem);
		font-weight: 500;
		letter-spacing: -0.05em;
		line-height: 1;
		align-self: flex-start;
		color: #0f111c;
	}

	.stack-card__content {
		display: grid;
		gap: clamp(1.25rem, 2.5vw, 2rem);
		grid-column: 2 / -1;
	}

	.stack-card__eyebrow {
		color: #4248ff;
		font-size: 0.9rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		margin: 0;
		text-transform: uppercase;
	}

	.stack-card__title {
		color: #080811;
		font-size: clamp(1.75rem, 3.8vw, 2.75rem);
		font-weight: 700;
		letter-spacing: -0.015em;
		line-height: 1.1;
		margin: 0;
	}

	.stack-card__description {
		color: #31333f;
		font-size: clamp(1rem, 2vw, 1.1rem);
		line-height: 1.7;
		margin: 0;
	}

	.stack-card__link {
		align-items: center;
		color: #12152b;
		display: inline-flex;
		font-weight: 600;
		gap: 0.4rem;
		text-decoration: none;
	}

	.stack-card__link::after {
		content: '→';
		font-size: 1rem;
		transition: transform 160ms ease-out;
	}

	.stack-card__link:hover::after,
	.stack-card__link:focus-visible::after {
		transform: translateX(4px);
	}

	:global(.stack-card__list) {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.65rem;
	}

	:global(.stack-card__list li) {
		display: flex;
		gap: 0.6rem;
		align-items: center;
		color: #242633;
		font-size: 0.98rem;
		line-height: 1.55;
	}

	:global(.stack-card__list li::before) {
		background: radial-gradient(circle, #5056ff 0%, rgba(80, 86, 255, 0) 70%);
		border-radius: 999px;
		content: '';
		height: 0.5rem;
		flex-shrink: 0;
		width: 0.5rem;
	}

	@media (max-width: 50rem) {
		.stack-card {
			grid-template-columns: 1fr;
			min-height: auto;
			padding: clamp(2rem, 8vw, 3rem);
		}

		.stack-card::before {
			font-size: clamp(2.8rem, 20vw, 4.4rem);
			margin-bottom: 1rem;
		}

		.stack-card__content {
			grid-column: 1 / -1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.stack-card {
			transition: none;
			transform: none !important;
		}
	}
</style>
