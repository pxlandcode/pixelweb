<script lang="ts">
	export let text = 'Our Discord is always alive';
</script>

<section class="scroll-headline bg-background">
	<div class="content">
		<h1
			class="headline text-center text-5xl font-semibold tracking-tight select-none md:text-6xl"
			aria-label={text}
		>
			{#each Array.from(text) as char, i}
				{#if char === '\n'}
					<br />
				{:else if char === ' '}
					<span class="space">&nbsp;</span>
				{:else}
					<span
						class={`letter ${i === text.length - 1 ? 'text-primary' : 'text-white'}`}
						style={`--i:${i};`}
					>
						{char}
					</span>
				{/if}
			{/each}
		</h1>
	</div>
</section>

<style>
	.scroll-headline {
		min-height: 250vh; /* ⬆️ wait a bit longer before scroll exits */
		view-timeline: --headline-scroll;
	}

	.content {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		position: sticky;
		top: 0;
		overflow: hidden;
	}

	.headline {
		display: inline-block;
		line-height: 1.1;
	}

	.letter,
	.space {
		display: inline-block;
	}
	.space {
		width: 0.4em;
	}

	@media (prefers-reduced-motion: no-preference) {
		@supports (animation-timeline: scroll()) {
			.letter {
				transform: translateY(1em);
				opacity: 0;
				animation-name: reveal;
				animation-fill-mode: both;
				animation-timing-function: ease-out;
				animation-timeline: --headline-scroll;

				/* ⚡️ Faster stagger: letters closer together */
				animation-range: calc(var(--i) * 2%) calc((var(--i) * 2%) + 6%);
			}
		}
	}

	@keyframes reveal {
		0% {
			transform: translateY(1em);
			opacity: 0;
		}
		40% {
			transform: translateY(0);
			opacity: 1;
		}
		100% {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.text-primary {
		color: var(--color-primary, #f1674a);
	}
	.text-white {
		color: white;
	}
</style>
