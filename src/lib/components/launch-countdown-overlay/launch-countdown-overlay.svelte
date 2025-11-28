<script lang="ts">
	import { Button } from '@pixelcode_/blocks/components';
	import { contactModal } from '$lib/stores/contactModal';
	import { browser } from '$app/environment';
	import { fade } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';

	const DAY = 86_400_000;
	const HOUR = 3_600_000;
	const MINUTE = 60_000;

	const props = $props<{
		targetIso?: string;
	}>();
const targetIso = $derived(() => props.targetIso ?? '2025-11-18T17:00:00+01:00');

	let now = $state(Date.now());
const targetTime = $derived(() => Date.parse(targetIso()));
	const remaining = $derived(() => {
		const parsedTarget = targetTime();
		return Number.isFinite(parsedTarget) ? Math.max(0, parsedTarget - now) : 0;
	});
	const isActive = $derived(() => {
		const parsedTarget = targetTime();
		return Number.isFinite(parsedTarget) && remaining() > 0;
	});
	const countdown = $derived(() => {
		const parsedTarget = targetTime();
		return Number.isFinite(parsedTarget)
			? formatCountdown(remaining())
			: { days: 0, hours: 0, minutes: 0, seconds: 0 };
	});

	let timer: ReturnType<typeof setInterval> | null = null;
	let previousBodyOverflow: string | null = null;

	onMount(() => {
		if (!browser) {
			return;
		}

		const parsedTarget = targetTime();
		if (!Number.isFinite(parsedTarget) || parsedTarget <= Date.now()) {
			return;
		}

		const tick = () => {
			now = Date.now();
			const nextRemaining = targetTime() - now;
			if (!Number.isFinite(nextRemaining) || nextRemaining <= 0) {
				const parsedTarget = targetTime();
				now = Number.isFinite(parsedTarget) ? parsedTarget : now;
				stopTimer();
			}
		};

		tick();
		timer = setInterval(tick, 1000);

		return stopTimer;
	});

	onDestroy(() => {
		stopTimer();
		restoreBodyOverflow();
	});

	let wasActive = true;

	$effect(() => {
		if (!browser) return;

		const active = isActive();
		if (active) {
			lockBodyScroll();
			wasActive = true;
		} else {
			restoreBodyOverflow();
			if (wasActive) {
				window.scrollTo({ top: 0, behavior: 'auto' });
				wasActive = false;
			}
		}
	});

	function stopTimer() {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	}

	function lockBodyScroll() {
		if (!browser) return;
		if (previousBodyOverflow === null) {
			previousBodyOverflow = document.body.style.overflow || '';
		}
		document.body.style.overflow = 'hidden';
	}

	function restoreBodyOverflow() {
		if (!browser) return;
		if (previousBodyOverflow !== null) {
			document.body.style.overflow = previousBodyOverflow;
			previousBodyOverflow = null;
		}
	}

	function formatCountdown(ms: number) {
		const days = Math.floor(ms / DAY);
		const hours = Math.floor((ms % DAY) / HOUR);
		const minutes = Math.floor((ms % HOUR) / MINUTE);
		const seconds = Math.floor((ms % MINUTE) / 1000);

		return { days, hours, minutes, seconds };
	}

	const pad = (value: number | undefined) =>
		typeof value === 'number' ? value.toString().padStart(2, '0') : '00';

	function handleContactClick(event: MouseEvent) {
		event.preventDefault();
		contactModal.open();
	}
</script>

{#if isActive()}
	<div
		class="fixed inset-0 z-[100] flex items-stretch bg-background text-foreground"
		role="dialog"
		aria-modal="true"
		transition:fade={{ duration: 250 }}
	>
		<header
			class="relative flex h-full w-full flex-col bg-background px-6 py-8 text-center font-sans text-foreground sm:px-10 sm:py-12"
		>
			<div class="flex justify-start">
				<a class="inline-flex items-center text-white" href="/" aria-label="Pixel &amp; Code">
					<span class="inline-flex h-8 items-center sm:h-10" aria-hidden="true">
						<svg
							class="h-full w-auto"
							viewBox="0 0 1189 215"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M99.8 70.3992C89.93 59.5992 77.6 54.1992 62.8 54.1992C46.13 54.1992 33.13 60.8692 23.8 74.1992V56.9992H0V165.169H25.4V147.799C34.73 159.799 47.2 165.799 62.8 165.799C78.4 165.799 89.93 160.399 99.8 149.599C109.66 138.799 114.6 125.599 114.6 109.999C114.6 94.3992 109.66 81.1992 99.8 70.3992ZM79 132.599C72.86 138.739 65.33 141.799 56.4 141.799C47.47 141.799 39.93 138.769 33.8 132.699C27.66 126.639 24.6 119.139 24.6 110.199C24.6 101.259 27.66 93.5392 33.8 87.3992C39.93 81.2692 47.46 78.1992 56.4 78.1992C65.34 78.1992 72.86 81.2692 79 87.3992C85.13 93.5392 88.2 101.069 88.2 109.999C88.2 118.929 85.13 126.469 79 132.599ZM0 214.999H25.4V190.679H0V214.999Z"
								fill="white"
							/>
							<path
								d="M151.6 37.3988C147.07 37.3988 143.17 35.7688 139.9 32.4988C136.63 29.2288 135 25.2688 135 20.5988C135 15.9288 136.63 11.9688 139.9 8.69883C143.17 5.42883 147.07 3.79883 151.6 3.79883C156.13 3.79883 160.23 5.42883 163.5 8.69883C166.77 11.9688 168.4 15.9288 168.4 20.5988C168.4 25.2688 166.77 29.2288 163.5 32.4988C160.23 35.7688 156.27 37.3988 151.6 37.3988ZM164.4 162.999H139V56.9988H164.4V162.999Z"
								fill="white"
							/>
							<path
								d="M252.601 110.4L286.601 163H258.001L236.801 130.2L215.801 163H188.801L223.201 109L189.601 57H218.201L239.201 89.6L259.001 57H285.801L252.601 110.4Z"
								fill="white"
							/>
							<path
								d="M351.001 54.1992C367.131 54.1992 380.271 59.4992 390.401 70.0992C400.531 80.6992 405.001 93.9992 403.801 109.999C403.671 113.329 403.271 116.929 402.601 120.799H320.601C323.001 127.869 327.471 133.529 334.001 137.799C340.531 142.069 348.131 144.199 356.801 144.199C365.471 144.199 373.401 142.799 381.001 139.999V161.999C373.801 164.529 365.271 165.799 355.401 165.799C337.931 165.799 323.471 160.529 312.001 149.999C300.531 139.469 294.801 126.129 294.801 109.999C294.801 93.8692 300.171 80.6992 310.901 70.0992C321.631 59.4992 335.001 54.1992 351.001 54.1992ZM319.801 100.599H379.401C378.331 93.1292 375.171 87.1292 369.901 82.5992C364.631 78.0692 358.131 75.7992 350.401 75.7992C342.671 75.7992 336.431 78.0992 330.901 82.6992C325.371 87.2992 321.671 93.2692 319.801 100.599Z"
								fill="white"
							/>
							<path d="M449.791 163H424.391V3H449.791V163Z" fill="white" />
							<path
								d="M573.991 102L619.191 163H589.191L572.591 140.6C568.991 148.33 563.261 154.47 555.391 159C547.521 163.53 538.521 165.8 528.391 165.8C513.991 165.8 502.021 161.8 492.491 153.8C482.951 145.8 478.191 135.53 478.191 123C478.191 105.27 487.321 90.73 505.591 79.4C489.591 69.13 481.591 56.6 481.591 41.8C481.591 29.27 485.861 19.17 494.391 11.5C502.921 3.83 514.261 0 528.391 0C542.521 0 553.661 3.83 562.191 11.5C570.721 19.17 574.991 29.27 574.991 41.8C574.991 60.07 561.851 75.47 535.591 88C523.991 93.6 515.821 98.87 511.091 103.8C506.361 108.73 503.991 114.2 503.991 120.2C503.991 126.2 506.451 131.67 511.391 135.8C516.321 139.93 522.321 142 529.391 142C536.461 142 542.021 139.97 546.891 135.9C551.761 131.83 554.191 127 554.191 121.4C554.191 117.8 552.261 113.33 548.391 108L543.991 102H573.991ZM543.491 29.2C539.691 25.6 534.661 23.8 528.391 23.8C522.121 23.8 517.061 25.6 513.191 29.2C509.321 32.8 507.391 37.53 507.391 43.4C507.391 51.93 514.261 60 527.991 67.6C535.861 63.6 541.361 59.77 544.491 56.1C547.621 52.43 549.191 48.2 549.191 43.4C549.191 37.53 547.291 32.8 543.491 29.2Z"
								fill="#E76F51"
							/>
							<path
								d="M679.791 165.799C663.261 165.799 649.561 160.499 638.691 149.899C627.821 139.299 622.391 125.999 622.391 109.999C622.391 93.9992 627.821 80.6992 638.691 70.0992C649.561 59.4992 663.261 54.1992 679.791 54.1992C684.991 54.1992 690.121 54.8692 695.191 56.1992V80.7992C691.591 79.0692 686.791 78.1992 680.791 78.1992C671.461 78.1992 663.661 81.2692 657.391 87.3992C651.121 93.5292 647.991 101.129 647.991 110.199C647.991 119.269 651.121 126.629 657.391 132.699C663.661 138.769 671.461 141.799 680.791 141.799C686.661 141.799 691.461 140.999 695.191 139.399V163.799C690.121 165.129 684.991 165.799 679.791 165.799Z"
								fill="white"
							/>
							<path
								d="M767.99 54.1992C784.39 54.1992 798.02 59.4992 808.89 70.0992C819.76 80.6992 825.19 93.9992 825.19 109.999C825.19 125.999 819.76 139.299 808.89 149.899C798.02 160.499 784.39 165.799 767.99 165.799C751.59 165.799 737.76 160.499 726.89 149.899C716.02 139.299 710.59 125.999 710.59 109.999C710.59 93.9992 716.02 80.6992 726.89 70.0992C737.76 59.4992 751.46 54.1992 767.99 54.1992ZM790.59 87.3992C784.46 81.2692 776.92 78.1992 767.99 78.1992C759.06 78.1992 751.52 81.2692 745.39 87.3992C739.26 93.5292 736.19 101.129 736.19 110.199C736.19 119.269 739.26 126.629 745.39 132.699C751.52 138.769 759.06 141.799 767.99 141.799C776.92 141.799 784.46 138.769 790.59 132.699C796.72 126.629 799.79 119.129 799.79 110.199C799.79 101.269 796.72 93.5292 790.59 87.3992Z"
								fill="white"
							/>
							<path
								d="M928.188 72V3H953.588V163H929.788V145.8C920.458 159.13 907.518 165.8 890.988 165.8C876.058 165.8 863.658 160.4 853.788 149.6C843.918 138.8 838.988 125.6 838.988 110C838.988 94.4 843.918 81.2 853.788 70.4C863.658 59.6 876.058 54.2 890.988 54.2C905.918 54.2 918.858 60.13 928.188 72ZM897.188 141.8C906.118 141.8 913.658 138.77 919.788 132.7C925.918 126.63 928.988 119.13 928.988 110.2C928.988 101.27 925.918 93.53 919.788 87.4C913.658 81.27 906.118 78.2 897.188 78.2C888.258 78.2 880.918 81.27 874.788 87.4C868.658 93.53 865.588 101.07 865.588 110C865.588 118.93 868.658 126.47 874.788 132.6C880.918 138.73 888.388 141.8 897.188 141.8Z"
								fill="white"
							/>
							<path
								d="M1031.39 54.1992C1047.52 54.1992 1060.66 59.4992 1070.79 70.0992C1080.92 80.6992 1085.39 93.9992 1084.19 109.999C1084.06 113.329 1083.66 116.929 1082.99 120.799H1000.99C1003.39 127.869 1007.86 133.529 1014.39 137.799C1020.92 142.069 1028.52 144.199 1037.19 144.199C1045.86 144.199 1053.79 142.799 1061.39 139.999V161.999C1054.19 164.529 1045.66 165.799 1035.79 165.799C1018.32 165.799 1003.86 160.529 992.391 149.999C980.921 139.469 975.191 126.129 975.191 109.999C975.191 93.8692 980.561 80.6992 991.291 70.0992C1002.02 59.4992 1015.39 54.1992 1031.39 54.1992ZM1000.19 100.599H1059.79C1058.72 93.1292 1055.56 87.1292 1050.29 82.5992C1045.02 78.0692 1038.52 75.7992 1030.79 75.7992C1023.06 75.7992 1016.82 78.0992 1011.29 82.6992C1005.75 87.2992 1002.06 93.2692 1000.19 100.599Z"
								fill="white"
							/>
							<path d="M1088.19 166.799H1188.19V190.799H1088.19V166.799Z" fill="white" />
						</svg>
					</span>
				</a>
			</div>

			<div
				class="mt-10 grid flex-1 place-items-center gap-8 text-center sm:mt-12"
				data-launch={targetIso()}
				role="status"
				aria-live="polite"
			>
				<p class="text-[clamp(0.75rem,1.8vw,1.05rem)] tracking-[0.38em] text-white/60 uppercase">
					New website launches in
				</p>

				<div class="grid w-full max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-10">
					<div class="flex flex-col items-center gap-2">
						<span
							class="text-[clamp(3.4rem,9vw,8rem)] font-bold text-primary drop-shadow-[0_8px_26px_rgba(243,91,63,0.35)]"
						>
							{countdown().days}
						</span>
						<span
							class="text-[clamp(0.65rem,1.6vw,0.85rem)] tracking-[0.42em] text-white/70 uppercase"
						>
							Days
						</span>
					</div>
					<div class="flex flex-col items-center gap-2">
						<span
							class="text-[clamp(3.4rem,9vw,8rem)] font-bold text-primary drop-shadow-[0_8px_26px_rgba(243,91,63,0.35)]"
						>
							{pad(countdown().hours)}
						</span>
						<span
							class="text-[clamp(0.65rem,1.6vw,0.85rem)] tracking-[0.42em] text-white/70 uppercase"
						>
							Hours
						</span>
					</div>
					<div class="flex flex-col items-center gap-2">
						<span
							class="text-[clamp(3.4rem,9vw,8rem)] font-bold text-primary drop-shadow-[0_8px_26px_rgba(243,91,63,0.35)]"
						>
							{pad(countdown().minutes)}
						</span>
						<span
							class="text-[clamp(0.65rem,1.6vw,0.85rem)] tracking-[0.42em] text-white/70 uppercase"
						>
							Minutes
						</span>
					</div>
					<div class="flex flex-col items-center gap-2">
						<span
							class="text-[clamp(3.4rem,9vw,8rem)] font-bold text-primary drop-shadow-[0_8px_26px_rgba(243,91,63,0.35)]"
						>
							{pad(countdown().seconds)}
						</span>
						<span
							class="text-[clamp(0.65rem,1.6vw,0.85rem)] tracking-[0.42em] text-white/70 uppercase"
						>
							Seconds
						</span>
					</div>
				</div>

				<p class="mx-auto max-w-2xl text-lg font-medium text-white/90 sm:text-2xl">
					We're polishing the final pixels.
				</p>

				<div class="flex flex-col items-center gap-3 text-center">
					<p class="mx-auto max-w-3xl text-base text-white/80 sm:text-lg">
						Come celebrate us turning 2 years and the release of our new website with pizza and
						beverages.
					</p>
					<p class="text-[0.8rem] tracking-[0.25em] text-white/60 uppercase">
						Doors open 18 November at 17:00,
						<a
							class="text-primary transition-colors hover:text-[#ff7b5d]"
							href="https://www.linkedin.com/events/ppethusmedpizza-bubbelhospixel-7391762003507212288/"
							target="_blank"
							rel="noopener noreferrer"
						>
							grab your spot on LinkedIn.
						</a>
					</p>
				</div>

				<div class="mt-4 flex flex-wrap items-center justify-center gap-4">
					<Button size="md" variant="primary" href="/#contact" onclick={handleContactClick}
						>Get in touch</Button
					>

					<Button
						size="md"
						variant="ghost"
						class="border border-white/10 bg-background px-6 py-3 text-[0.8rem] font-semibold tracking-[0.15em] text-white/85 transition hover:text-white"
						href="https://www.linkedin.com/company/pixelandcode/"
						target="_blank"
						rel="noopener noreferrer"
					>
						LinkedIn
					</Button>
				</div>
			</div>
		</header>
	</div>
{/if}
