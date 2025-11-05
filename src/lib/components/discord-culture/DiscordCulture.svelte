<script lang="ts">
	import { onMount } from 'svelte';

export let minHeight = 'clamp(160vh, 200vh + 5vw, 220vh)';
export let paddingTop = 'min(12vh, 8rem)';
export let paddingBottom = 'min(10vh, 6rem)';

export let messages = [
		{
			user: 'Oliver',
			text: 'Anyone tried the new SvelteKit release yet? 🤔',
			reactions: [
				{ emoji: '🚀', count: 5 },
				{ emoji: '🔥', count: 8 },
				{ emoji: '👀', count: 3 }
			]
		},
		{
			user: 'Emilia',
			text: 'Friday fika remote edition! ☕️🍰',
			reactions: [
				{ emoji: '✅', count: 7 },
				{ emoji: '☕️', count: 9 },
				{ emoji: '🙌', count: 4 }
			]
		},
		{
			user: 'Linus',
			text: 'Are you ready for this fridays vibe playlist? 🎵',
			reactions: [
				{ emoji: '🎤', count: 6 },
				{ emoji: '🎸', count: 5 },
				{ emoji: '🔊', count: 4 }
			]
		},
		{
			user: 'Ernst',
			text: 'Gooooood morning Pixel&Code! 👋☀️',
			gif: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2ZkNzZ5OWJ4bGV2djZjODRhcnRzN3p2dng3Z2g4ODlsOHA2dWMzNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JYMDARH3gR27e/giphy.gif',
			reactions: [
				{ emoji: '❤️', count: 8 },
				{ emoji: '😴', count: 3 },
				{ emoji: '🌅', count: 5 },
				{ emoji: '💪', count: 4 }
			]
		},
		{
			user: 'Nicklas',
			text: 'We should totally make a movie night channel! 🍿',
			reactions: [
				{ emoji: '🎬', count: 6 },
				{ emoji: '🙋', count: 8 },
				{ emoji: '👍', count: 5 }
			]
		},
		{
			user: 'Pierre',
			text: 'Just pushed the new client dashboard build! 🚀✨',
			reactions: [
				{ emoji: '🔥', count: 10 },
				{ emoji: '💯', count: 7 },
				{ emoji: '👏', count: 6 }
			]
		},
		{
			user: 'Andreas',
			text: 'Want to be part of our community? Join our Discord and talk to us!',
			link: 'https://discord.gg/Cpy8bFsT',
			linkText: 'Join now',
			reactions: [
				{ emoji: '🧡', count: 15 },
				{ emoji: '💬', count: 10 },
				{ emoji: '🎉', count: 12 }
			]
		}
	];
</script>

<section
	class="discord-sim text-white"
	style:--section-min-height={minHeight}
	style:--section-padding-top={paddingTop}
	style:--section-padding-bottom={paddingBottom}
>
	<div class="chat-wrapper">
		{#each messages as msg, i}
			<div class="message" style={`--i:${i};`}>
				<div class="avatar"></div>
				<div class="bubble">
					<div class="name">{msg.user}</div>
					<p class="text">
						{msg.text}
						{#if msg.link}
							<a href={msg.link} target="_blank" rel="noopener noreferrer" class="discord-link">
								{msg.linkText || msg.link}
							</a>
						{/if}
					</p>

					{#if msg.gif}
						<img class="gif" src={msg.gif} alt="GIF" loading="lazy" />
					{/if}

					<div class="reactions">
						{#each msg.reactions as react, j}
							<div class="reaction" style={`--r:${j};`}>
								<span>{react.emoji}</span>
								<span class="count">{react.count}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.discord-sim {
		min-height: var(--section-min-height, clamp(180vh, 220vh + 5vw, 260vh));
		view-timeline: --discord-scroll;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: var(--section-padding-top, min(12vh, 8rem));
		padding-bottom: var(--section-padding-bottom, min(10vh, 6rem));
	}

	.chat-wrapper {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		width: 100%;
		max-width: 700px;
		position: sticky;
		top: 10vh;
	}

	.message {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		opacity: 0;
		transform: translateY(2rem);
		animation: msg-pop both ease-out;
		animation-timeline: --discord-scroll;
		animation-range: calc(var(--i) * 12%) calc((var(--i) * 12%) + 12%);
	}

	.avatar {
		width: 42px;
		height: 42px;
		border-radius: 50%;
		background: #222;
		flex-shrink: 0;
	}

	.bubble {
		background: #1e1e1e;
		border-radius: 8px;
		padding: 0.6rem 1rem;
		max-width: 80%;
		box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05);
	}

	.name {
		font-weight: 600;
		font-size: 0.9rem;
		margin-bottom: 0.25rem;
		color: #d1d5db;
	}

	.text {
		font-size: 1rem;
		line-height: 1.4;
		margin: 0;
		color: white;
	}

	.discord-link {
		color: #5865f2;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s ease;
		margin-left: 0.25rem;
	}

	.discord-link:hover {
		color: #7289da;
		text-decoration: underline;
	}

	.gif {
		margin-top: 0.6rem;
		border-radius: 8px;
		width: 100%;
		max-height: 200px;
		object-fit: cover;
		opacity: 0;
		transform: scale(0.95);
		animation: gif-fade both ease-out;
		animation-timeline: --discord-scroll;
		animation-range: calc(var(--i) * 12% + 6%) calc(var(--i) * 12% + 16%);
	}

	.reactions {
		display: flex;
		gap: 0.4rem;
		margin-top: 0.4rem;
	}

	.reaction {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		background: #2a2a2a;
		border-radius: 999px;
		padding: 0.15rem 0.5rem;
		font-size: 0.9rem;
		opacity: 0;
		transform: scale(0.7);
		animation: react-pop both ease-out;
		animation-timeline: --discord-scroll;
		animation-range: calc((var(--i) * 12%) + (var(--r) * 2%) + 6%)
			calc((var(--i) * 12%) + (var(--r) * 2%) + 12%);
	}

	.count {
		font-size: 0.8rem;
		color: #aaa;
		display: inline-block;
		transform-origin: center;
	}

	@keyframes msg-pop {
		0% {
			opacity: 0;
			transform: translateY(2rem);
		}
		40% {
			opacity: 1;
			transform: translateY(0);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes react-pop {
		0% {
			opacity: 0;
			transform: scale(0.7);
		}
		60% {
			opacity: 1;
			transform: scale(1.1);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes gif-fade {
		0% {
			opacity: 0;
			transform: scale(0.95);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
