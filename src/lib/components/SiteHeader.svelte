<script lang="ts">
	import { RollingText } from '$components/rolling-text';
	import type { NavLink } from '$types';
	import { contactModal } from '$lib/stores/contactModal';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	export let links: NavLink[] = [];

	export let logoSrc: string;

	function handleLinkClick(e: MouseEvent, href: string) {
		if (href === '#contact') {
			e.preventDefault();
			contactModal.open();
			return;
		}

		// Check if it's an internal anchor link (starts with /#)
		if (href.startsWith('/#')) {
			const targetId = href.slice(2); // Remove the '/#'
			const currentPath = $page.url.pathname;

			// If we're on the home page, smooth scroll to the element
			if (currentPath === '/') {
				e.preventDefault();
				const targetElement = document.getElementById(targetId);
				if (targetElement) {
					targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			}
			// If on another page, SvelteKit will navigate and jump to the anchor
		}
	}
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
					<a
						class="transition-colors hover:text-white focus-visible:text-white"
						{href}
						onclick={(e) => handleLinkClick(e, href)}
					>
						<RollingText text={label} />
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>
