<script lang="ts">
	import '../app.css';
	import { fly } from 'svelte/transition';
	import favicon from '$lib/assets/favicon.svg';
	import CurtainMenu from '$components/CurtainMenu.svelte';
	import SiteFooter from '$components/SiteFooter.svelte';
	import { Button, Icon } from '@pixelcode_/blocks/components';
	import IconPixelCode from '$lib/icons/IconPixelCode.svelte';
	import pixelLogoUrl from '$lib/assets/pixelcodelogo.svg?url';
	import { navLinks } from '$lib/navlinks';
	import { curtainMenu } from '$lib/stores/curtainMenu';
	import { floatingNavState } from '$lib/stores/floatingNav';
	import RollingText from '$components/rolling-text/RollingText.svelte';

	let { children } = $props();

	const PixelCodeLucideIcon = IconPixelCode as unknown as (typeof import('lucide-svelte'))['Icon'];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<CurtainMenu links={navLinks} logoSrc={pixelLogoUrl} />

{#if $floatingNavState.active}
	<div
		class="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-row justify-end gap-5 overflow-hidden px-4 pt-5 md:px-16"
	>
		<div
			class="pointer-events-auto flex items-center gap-3"
			transition:fly={{ y: 50, duration: 220, delay: 50 }}
		>
			<Button
				size="md"
				variant="primary"
				href="#contact"
				class="border border-white/20 transition-transform duration-200"
			>
				<RollingText>Get in touch</RollingText>
			</Button>
		</div>

		<div
			class="pointer-events-auto flex items-center gap-3"
			transition:fly={{ y: 50, duration: 220 }}
		>
			<Button
				class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-sm transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
				aria-label="Open main menu"
				aria-expanded={$curtainMenu ? 'true' : 'false'}
				aria-controls="curtain-menu"
				onclick={curtainMenu.open}
			>
				<RollingText>
					<Icon icon={PixelCodeLucideIcon} size="md" class="text-primary" />
				</RollingText>
			</Button>
		</div>
	</div>
{/if}

{@render children?.()}
<SiteFooter links={navLinks} ctaHref="#contact" />
