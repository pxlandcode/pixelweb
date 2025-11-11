<script lang="ts">
	import { RollingText } from '$components/rolling-text';
	import type { NavLink } from '$types';
	import { contactModal } from '$lib/stores/contactModal';
	import { page } from '$app/stores';

	export let links: NavLink[] = [];

	export let logoSrc: string;

	function handleLinkClick(e: MouseEvent, href: string) {
		if (href === '#contact') {
			e.preventDefault();
			contactModal.open();
			return;
		}

		if (href.startsWith('/#')) {
			const targetId = href.slice(2);
			const currentPath = $page.url.pathname;

			if (currentPath === '/') {
				e.preventDefault();
				const targetElement = document.getElementById(targetId);
				if (targetElement) {
					targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			}
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
			class="-ml-4 flex flex-wrap items-center justify-center gap-y-3 text-white/70 transition-colors md:justify-start"
		>
			{#each links as { label, href }}
				<li>
					<a
						class="group p-4 transition-colors hover:text-white focus-visible:text-white"
						{href}
						onclick={(e) => handleLinkClick(e, href)}
					>
						<RollingText
							initialTextClass="text-white/70"
							rollingTextClass="text-primary"
							inheritParentHover
							text={label}
						/>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>
