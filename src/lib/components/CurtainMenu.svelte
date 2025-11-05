<script lang="ts">
	import { onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { RollingText } from '$components/rolling-text';
	import type { NavLink } from '$types';
	import { curtainMenu } from '$lib/stores/curtainMenu';
	import { Button } from '@pixelcode_/blocks/components';

	export let links: NavLink[] = [];
	export let logoSrc: string;

	const CURTAIN_BODY_CLASS = 'curtain-menu-open';

	function closeCurtainMenu() {
		curtainMenu.close();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			curtainMenu.close();
		}
	}

	$: if (browser) {
		document.body.classList.toggle('overflow-hidden', $curtainMenu);
		document.body.classList.toggle(CURTAIN_BODY_CLASS, $curtainMenu);
	}

	onDestroy(() => {
		if (browser) {
			document.body.classList.remove('overflow-hidden', CURTAIN_BODY_CLASS);
		}
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<div
	id="curtain-menu"
	class={`fixed inset-0 z-[80] flex h-screen flex-col bg-background text-[#f0f0f0] transition-transform duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)] ${
		$curtainMenu ? 'pointer-events-auto translate-y-0' : 'pointer-events-none -translate-y-full'
	}`}
	role="dialog"
	aria-modal="true"
	aria-label="Main menu"
	aria-hidden={$curtainMenu ? 'false' : 'true'}
>
	<div class="flex h-full flex-col justify-between px-6 py-8 md:px-16 md:py-14">
		<div
			class="flex items-start justify-between text-[0.65rem] font-medium tracking-[0.32em] text-white/70 uppercase md:text-xs"
		>
			<a
				href="/"
				class={`inline-flex items-center gap-3 text-white transition-opacity duration-500 ${
					$curtainMenu ? 'opacity-100' : 'opacity-0'
				}`}
				style={`transition-delay: ${$curtainMenu ? 160 : 0}ms`}
			>
				{#if logoSrc}
					<img class="h-5 w-auto md:h-6" src={logoSrc} alt="Pixel & Code" />
				{:else}
					<span class="text-sm font-semibold text-white md:text-base">pixel&code_</span>
				{/if}
			</a>
			<Button
				type="button"
				variant="nav"
				onclick={closeCurtainMenu}
				class="relative inline-flex items-center gap-3 text-[0.65rem] font-semibold tracking-[0.42em] text-white uppercase transition-colors duration-200 hover:text-primary  focus-visible:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:text-xs"
			>
				<span
					class={`inline-flex transition-opacity transition-transform duration-500 ease-out ${
						$curtainMenu ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
					}`}
					style={`transition-delay: ${$curtainMenu ? 22 + 220 : 0}ms`}
				>
					<RollingText text="Close" size="sm" />
				</span>
			</Button>
		</div>
		<nav class="flex flex-1 flex-col justify-center py-8 md:py-0">
			<ul class="flex flex-col gap-4 md:gap-8">
				{#each links as { label, href }, index}
					<li
						class={`origin-top transition-all duration-500 ease-out ${
							$curtainMenu ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
						}`}
						style={`transition-delay: ${$curtainMenu ? index * 60 + 240 : 0}ms`}
					>
						<a
							class="group inline-flex items-center tracking-[0.06em] text-white uppercase transition-colors duration-200 hover:text-primary focus-visible:text-primary"
							{href}
							on:click={closeCurtainMenu}
						>
							<RollingText text={label} size="3xl" class="md:text-7xl" />
						</a>
					</li>
				{/each}
			</ul>
		</nav>
		<div
			class="flex flex-col gap-4 text-[0.6rem] tracking-[0.32em] text-white/70 uppercase md:flex-row md:items-end md:justify-between md:gap-6 md:text-xs"
		>
			<a
				href="https://www.linkedin.com/company/pixelandcode/"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-3 text-white transition-colors duration-200 hover:text-primary focus-visible:text-primary"
				on:click={closeCurtainMenu}
			>
				<span
					class={`inline-flex transition-opacity transition-transform duration-500 ease-out ${
						$curtainMenu ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
					}`}
					style={`transition-delay: ${$curtainMenu ? 240 + links.length * 60 : 0}ms`}
				>
					<RollingText text="LinkedIn" size="sm" />
				</span>
			</a>
			<div
				class="flex flex-col gap-2 text-[0.55rem] tracking-[0.32em] text-white/50 uppercase md:flex-row md:items-center md:gap-6 md:text-[0.65rem]"
			>
				<a
					href="#privacy"
					class="transition-colors duration-200 hover:text-white focus-visible:text-white"
					on:click={closeCurtainMenu}
				>
					<span
						class={`inline-flex transition-opacity transition-transform duration-500 ease-out ${
							$curtainMenu ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
						}`}
						style={`transition-delay: ${$curtainMenu ? 260 + links.length * 60 : 0}ms`}
					>
						<RollingText text="Privacy Policy" size="xs" />
					</span>
				</a>
				<a
					href="#terms"
					class="transition-colors duration-200 hover:text-white focus-visible:text-white"
					on:click={closeCurtainMenu}
				>
					<span
						class={`inline-flex transition-opacity transition-transform duration-500 ease-out ${
							$curtainMenu ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
						}`}
						style={`transition-delay: ${$curtainMenu ? 280 + links.length * 60 : 0}ms`}
					>
						<RollingText text="Terms of Service" size="xs" />
					</span>
				</a>
			</div>
		</div>
	</div>
</div>
