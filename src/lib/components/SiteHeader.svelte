<script lang="ts">
	import { RollingText } from '$components/rolling-text';
	import type { NavLink } from '$types';

	export let links: NavLink[] = [];

	export let logoSrc: string;
</script>

<header
	class="flex flex-row items-center justify-between gap-6 px-6 pt-10 pb-6 text-xs font-medium tracking-[0.04em] uppercase md:flex-row-reverse md:px-16 md:text-sm"
>
	<a class="inline-flex items-center" href="/" aria-label="Pixel & Code">
		<RollingText>
			{#if logoSrc}
				<img class="h-6 w-auto" src={logoSrc} alt="Pixel & Code" />
			{:else}
				<span class="text-base font-semibold text-white">pixel&code_</span>
			{/if}
		</RollingText>
	</a>
	<nav class="hidden md:block">
		<ul
			class="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-white/70 transition-colors md:justify-start"
		>
			{#each links as { label, href }}
				<li>
					<a class="transition-colors hover:text-white focus-visible:text-white" {href}>
						<RollingText text={label} />
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>
