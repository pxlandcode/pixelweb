<script lang="ts">
	import { AdminLayout } from '$lib/components';
	import { Mode } from '@pixelcode_/blocks/components';
	import { navigating, page } from '$app/stores';
	import { loadingStore } from '$lib/stores/loading';
	import { onDestroy } from 'svelte';
	import './internal.css';
	import './app.css';

	const { data, children } = $props();

	const plainRoutes = new Set([
		'/internal/login',
		'/internal/reset-password',
		'/internal/preboard'
	]);
	const routeId = $derived($page.route.id ?? '');
	const isBusy = $derived(Boolean($navigating) || $loadingStore.isLoading);
	const loadingLabel = $derived(
		$loadingStore.loadingText ?? (Boolean($navigating) ? 'Loading page...' : 'Loading...')
	);

	let barVisible = $state(false);
	let barCompleting = $state(false);
	let barKey = $state(0);
	let wasBusy = $state(false);
	let hideTimeout: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		if (typeof document === 'undefined') return;
		document.body.classList.add('internal-light');
		return () => document.body.classList.remove('internal-light');
	});

	$effect(() => {
		if (isBusy && !wasBusy) {
			if (hideTimeout) {
				clearTimeout(hideTimeout);
				hideTimeout = null;
			}
			barVisible = true;
			barCompleting = false;
			barKey += 1;
		}

		if (!isBusy && wasBusy) {
			barCompleting = true;
			if (hideTimeout) clearTimeout(hideTimeout);
			hideTimeout = setTimeout(() => {
				barVisible = false;
				barCompleting = false;
				hideTimeout = null;
			}, 320);
		}

		wasBusy = isBusy;
	});

	onDestroy(() => {
		if (hideTimeout) clearTimeout(hideTimeout);
	});
</script>

<Mode.Watcher defaultMode="light" />
{#if barVisible}
	{#key barKey}
		<div
			class={`internal-loading-bar ${barCompleting ? 'is-complete' : ''}`}
			role="progressbar"
			aria-busy={isBusy}
			aria-label={loadingLabel}
		>
			<div class="internal-loading-bar__fill"></div>
		</div>
	{/key}
{/if}
{#if plainRoutes.has(routeId)}
	{@render children?.()}
{:else}
	{@const unauthorizedMessage = $page.url.searchParams.get('unauthorized')
		? 'You do not have permission to view that section.'
		: null}
	<div class="internal-root">
		<AdminLayout
			profile={data.profile}
			role={data.role}
			roles={data.roles}
			userEmail={data.user?.email ?? null}
			{unauthorizedMessage}
		>
			{@render children?.()}
		</AdminLayout>
	</div>
{/if}

<style>
	:global(.internal-loading-bar) {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 9999;
		height: 4px;
		background: rgba(15, 23, 42, 0.08);
		pointer-events: none;
		opacity: 1;
		transition: opacity 150ms ease 120ms;
	}

	:global(.internal-loading-bar__fill) {
		height: 100%;
		width: 40%;
		background: linear-gradient(90deg, #ea7c5d 0%, #f08b66 45%, #f59f7a 100%);
		animation: internal-loading-bar 1.1s ease-in-out infinite;
		will-change: transform;
	}

	:global(.internal-loading-bar.is-complete) {
		opacity: 0;
	}

	:global(.internal-loading-bar.is-complete .internal-loading-bar__fill) {
		width: 100%;
		animation: none;
		transition: width 200ms ease;
	}

	@keyframes internal-loading-bar {
		0% {
			transform: translateX(-70%);
		}
		50% {
			transform: translateX(20%);
		}
		100% {
			transform: translateX(120%);
		}
	}
</style>
