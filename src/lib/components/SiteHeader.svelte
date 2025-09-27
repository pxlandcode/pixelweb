<script lang="ts">
	export type NavLink = {
		label: string;
		href: string;
	};

	export let links: NavLink[] = [
		{ label: 'For companies', href: '#' },
		{ label: 'Join the team', href: '#' },
		{ label: 'For developers', href: '#' },
		{ label: 'Web shop', href: '#' },
		{ label: 'Contact', href: '#' }
	];

	export let logoSrc: string;
</script>

<header
	class="flex flex-col items-center gap-6 px-6 pt-10 pb-6 text-xs font-medium tracking-[0.04em] uppercase md:flex-row md:justify-between md:px-16 md:text-sm"
>
	<nav>
		<ul
			class="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-white/70 transition-colors md:justify-start"
		>
			{#each links as { label, href }}
				<li>
					<a class="transition-colors hover:text-white focus-visible:text-white" {href}>{label}</a>
				</li>
			{/each}
		</ul>
	</nav>
	<a class="inline-flex items-center" href="/" aria-label="Pixel & Code">
		{#if logoSrc}
			<img class="h-6 w-auto" src={logoSrc} alt="Pixel & Code" />
		{:else}
			<span class="text-base font-semibold text-white">pixel&code_</span>
		{/if}
	</a>
</header>
