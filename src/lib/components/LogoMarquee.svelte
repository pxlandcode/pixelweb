<script lang="ts">
	import { onMount, tick } from 'svelte';

	export let logos: string[] = [];
	export let background = '#f35b3f';
	export let duration = 32;

	const initialRepeatCount = logos.length ? 2 : 0;

	let marqueeWrapper: HTMLDivElement | null = null;
	let trackEl: HTMLDivElement | null = null;
	let marqueeLogos: string[] = [];
	let repeatCount = initialRepeatCount;
	let resizeObserver: ResizeObserver | null = null;
	let mounted = false;

	$: totalUnique = logos.length || 1;
	$: loopOffset = repeatCount > 0 ? `${-100 / repeatCount}%` : '-50%';
	$: marqueeLogos =
		logos.length && repeatCount > 0
			? Array.from({ length: repeatCount }, () => logos).flat()
			: [];
	$: logoLabels = logos.map((logo) => {
		const fileName = logo.split('/').pop() ?? '';
		const rawName = fileName.replace(/\.[^.]+$/, '');
		return rawName
			.split(/[-_.]/)
			.filter(Boolean)
			.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
			.join(' ')
			.trim();
	});
	$: logosSignature = logos.join('|');
	$: if (mounted && logos.length && repeatCount === 0) {
		repeatCount = 2;
	}

	const getAltText = (baseIndex: number) => {
		const label = logoLabels[baseIndex];
		return label ? `${label} logo` : `Partner logo ${baseIndex + 1}`;
	};

	async function refreshRepeatCount(_signature?: string) {
		if (!mounted) return;

		if (!logos.length) {
			repeatCount = 0;
			return;
		}

		if (!marqueeWrapper || !trackEl) {
			return;
		}

		await tick();

		const currentCopies = Math.max(repeatCount, 1);
		const baseWidth = trackEl.scrollWidth / currentCopies;

		if (!baseWidth) {
			repeatCount = Math.max(2, repeatCount);
			return;
		}

		const viewportWidth = marqueeWrapper.offsetWidth || baseWidth;
		const minWidth = viewportWidth * 2;
		const neededCopies = Math.max(2, Math.ceil(minWidth / baseWidth));

		if (neededCopies !== repeatCount) {
			repeatCount = neededCopies;
		}
	}

	$: if (mounted) {
		// Re-compute when the source logos change
		refreshRepeatCount(logosSignature);
	}

	onMount(() => {
		mounted = true;

		tick().then(() => {
			refreshRepeatCount();
		});

		if (typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver(() => {
				refreshRepeatCount();
			});

			if (marqueeWrapper) {
				resizeObserver.observe(marqueeWrapper);
			}
		}

		return () => {
			resizeObserver?.disconnect();
		};
	});
</script>

<section class="relative py-4 md:py-4" style={`background:${background}`}>
	<div class="relative overflow-hidden" bind:this={marqueeWrapper}>
		<div
			class="pointer-events-none absolute inset-y-0 left-0 z-[1] w-20"
			style={`background-image: linear-gradient(to right, ${background}, transparent);`}
			aria-hidden="true"
		></div>
		<div
			class="pointer-events-none absolute inset-y-0 right-0 z-[1] w-20"
			style={`background-image: linear-gradient(to left, ${background}, transparent);`}
			aria-hidden="true"
		></div>
		<div
			class="animate-marquee flex w-max items-center gap-x-[clamp(2.5rem,8vw,6rem)] px-[clamp(2rem,6vw,4rem)]"
			style={`--marquee-duration:${duration}s; --marquee-loop:${loopOffset};`}
			data-paused={!marqueeLogos.length}
			bind:this={trackEl}
		>
			{#each marqueeLogos as logo, index}
				{@const baseIndex = index % totalUnique}
				<div class="flex h-15 w-[clamp(5rem,12vw,8rem)] flex-none items-center justify-center">
					<img
						src={logo}
						alt={getAltText(baseIndex)}
						decoding="async"
						class="max-h-full max-w-full opacity-85 brightness-0 contrast-125 grayscale filter"
					/>
				</div>
			{/each}
		</div>
	</div>
</section>
