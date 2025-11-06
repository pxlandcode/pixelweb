<script lang="ts">
	import { Icon } from '@pixelcode_/blocks/components';
        import RollingText from './rolling-text/RollingText.svelte';
        import { IconPixelCode } from '$lib/icons';

        type Props = {
                title: string;
                eyebrow?: string | null;
                description?: string | null;
                link?: { href: string; label: string };
                img?: string | null;
                imgAlt?: string | null;
                imagePosition?: 'left' | 'right';
                bullets?: string[] | null;
                bodyHtml?: string | null;
                counter: number;
        };

        let {
                title,
                eyebrow,
                description,
                link,
                img,
                imgAlt,
                imagePosition = 'right',
                bullets = null,
                bodyHtml = null
        }: Props = $props();

        const imageWrapperOrderClass = $derived(() =>
                imagePosition === 'right' ? 'md:order-2' : 'md:order-1'
        );
        const contentWrapperOrderClass = $derived(() =>
                imagePosition === 'right' ? 'md:order-1' : 'md:order-2'
        );

        const normalizedBullets = $derived(() =>
                (bullets ?? []).map((entry) => entry?.trim()).filter((entry): entry is string => Boolean(entry))
        );
        const hasBullets = $derived(() => normalizedBullets.length > 0);
        const hasBodyHtml = $derived(() => Boolean(bodyHtml && bodyHtml.trim()));

        const PixelCodeLucideIcon = IconPixelCode as unknown as (typeof import('lucide-svelte'))['Icon'];
</script>

<li
	class="js-stack-cards__item sticky top-0 grid min-h-[clamp(24rem,75vh,32rem)] origin-top grid-cols-[clamp(5.5rem,12vw,9rem)_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-none border border-black/10 bg-white px-[clamp(2.25rem,5vw,4rem)] py-[clamp(1.5rem,4vw,2rem)] transition-transform duration-150 ease-out will-change-transform [counter-increment:cardstack] max-[50rem]:min-h-0 max-[50rem]:grid-cols-1 max-[50rem]:px-[clamp(2rem,8vw,3rem)] max-[50rem]:py-[clamp(1.25rem,6vw,2.5rem)]"
>
	<!-- Counter column -->
	<!-- <div
		class="self-start text-[clamp(3.25rem,10vw,6rem)] leading-none font-medium tracking-[-0.05em] text-background before:hidden max-[50rem]:mb-4 max-[50rem]:text-[clamp(2.8rem,20vw,4.4rem)]"
		aria-hidden="true"
	>
		<RollingText>
			{counter}
		</RollingText>
	</div> -->

	<div class="items-center self-start text-primary min-[50rem]:row-span-2" aria-hidden="true"></div>

	{#if eyebrow}
		<div
			class="row-start-1 justify-self-start pb-4 text-left text-[0.9rem] font-semibold tracking-[0.12em] text-primary uppercase min-[50rem]:col-start-2"
		>
			{eyebrow}
		</div>
	{/if}

	<!-- Content -->
	<div
		class="grid gap-[clamp(1.25rem,2.5vw,2rem)] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start md:gap-[clamp(1.75rem,4vw,3rem)] min-[50rem]:col-start-2 min-[50rem]:row-start-2"
	>
		{#if img}
			<div class={`relative overflow-hidden max-[50rem]:hidden ${imageWrapperOrderClass}`}>
				<img src={img} alt={imgAlt ?? ''} class="block h-full w-full object-cover" />
			</div>
		{/if}

		<div
			class={`flex flex-col gap-[clamp(1rem,2vw,1.4rem)] ${img ? contentWrapperOrderClass : ''}`}
		>
			<h3
				class="m-0 text-[clamp(1.75rem,3.8vw,2.75rem)] leading-[1.1] font-bold tracking-[-0.015em] text-background"
			>
				{title}
			</h3>

                        {#if description}
                                <p class="m-0 text-[clamp(1rem,2vw,1.1rem)] leading-[1.7] text-[#31333f]">
                                        {description}
                                </p>
                        {/if}

                        {#if hasBodyHtml}
                                <div class="prose prose-invert mt-2 max-w-none" {@html bodyHtml}></div>
                        {/if}

                        {#if hasBullets}
                                <ul class="stack-card__list">
                                        {#each normalizedBullets as bullet}
                                                <li>{bullet}</li>
                                        {/each}
                                </ul>
                        {/if}

                        {#if link}
                                <a
                                        class="group inline-flex items-center gap-1 font-semibold text-[#12152b] no-underline"
                                        href={link.href}
				>
					<RollingText>
						{link.label}
					</RollingText>
					<span class="transition-transform duration-150 ease-out group-hover:translate-x-1">→</span
					>
				</a>
			{/if}
		</div>
	</div>

	<!-- Shadow overlay that intensifies as the card falls back -->
	<div
		class="js-tilt-overlay will-change-opacity pointer-events-none absolute inset-0 z-10 bg-black opacity-0 transition-opacity duration-150 ease-out"
	/>
</li>

<style>
	/* Numeric counter in the leading column */
	:global(li.js-stack-cards__item > div:first-child)::before {
		content: '(' counter(cardstack, decimal-leading-zero) ')';
		color: var(--color-primary);
	}

	/* Optional helper list styles if you use .stack-card__list in slots */
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
		background: radial-gradient(circle, var(--color-primary) 0%, rgba(80, 86, 255, 0) 70%);
		border-radius: 999px;
		content: '';
		height: 0.5rem;
		flex-shrink: 0;
		width: 0.5rem;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.js-stack-cards__item) {
			transition: none;
			transform: none !important;
		}
	}
</style>
