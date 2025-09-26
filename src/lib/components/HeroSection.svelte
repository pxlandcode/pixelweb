<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	type HeadlineType = 'work' | 'culture' | 'brand';

	type HeadlineItem = {
		type: HeadlineType;
		text: string;
		logo?: string;
	};

	export let eyebrow = 'We are';
	export let description =
		'A Swedish tech consultant agency creating software and digital experiences.';
	export let brandText = 'Pixel & Code';
	export let brandLogo = '';
	export let intervalMs = 2200;

	export let workWeight = 0.75;

	const clampFont = 'clamp(1.9rem, 10vw, 5.5rem)';

	const workStatements = [
		'Code Crafters',
		'Product Builders',
		'UX Thinkers',
		'Problem Solvers',
		'Digital Explorers',
		'Frontend Specialists',
		'Tech Consultants',
		'Strategy Shapers',
		'Dog people',
		'Cat people',
		'Friendly'
	];

	const cultureStatements = [
		'Movie Lovers',
		'Pixel Artists',
		'Coffee Nerds',
		'Friday Fika Fans',
		'Ski Bums',
		'Gamers',
		'Music Makers',
		'Bike Riders',
		'Beer Enthusiasts',
		'Foodies',
		'Book worms'
	];

	let displayCount = 0;
	let headlineKey = 0;
	let timer: ReturnType<typeof setInterval> | undefined;
	let currentItem: HeadlineItem = { type: 'work', text: workStatements[0] ?? '' };
	let headlineHeightPx = 0;
	let measurementRefs: (HTMLElement | null)[] = [];
	let workPool: string[] = [];
	let culturePool: string[] = [];
	let previousWorkSignature = '';
	let previousCultureSignature = '';

	$: normalizedWorkStatements = workStatements
		.map((value) => value?.trim() ?? '')
		.filter((value) => value.length > 0);

	$: normalizedCultureStatements = cultureStatements
		.map((value) => value?.trim() ?? '')
		.filter((value) => value.length > 0);

	$: measurementTexts = Array.from(
		new Set([...normalizedWorkStatements, ...normalizedCultureStatements])
	);

	$: {
		if (measurementRefs.length !== measurementTexts.length) {
			measurementRefs = Array(measurementTexts.length).fill(null);
		}
	}

	$: {
		const signature = JSON.stringify(normalizedWorkStatements);
		if (signature !== previousWorkSignature) {
			previousWorkSignature = signature;
			workPool = [];
		}
	}

	$: {
		const signature = JSON.stringify(normalizedCultureStatements);
		if (signature !== previousCultureSignature) {
			previousCultureSignature = signature;
			culturePool = [];
		}
	}

	async function measureHeadlineHeight() {
		await tick();
		const heights = measurementRefs
			.map((node) => (node && node.isConnected ? node.offsetHeight : 0))
			.filter((height) => height > 0);

		const max = heights.length ? Math.max(...heights) : 0;
		if (max && max !== headlineHeightPx) {
			headlineHeightPx = max;
		}
	}

	function ensurePool(type: 'work' | 'culture'): string[] {
		const source = type === 'work' ? normalizedWorkStatements : normalizedCultureStatements;

		if (!source.length) {
			if (type === 'work') {
				workPool = [];
			} else {
				culturePool = [];
			}
			return [];
		}

		const existing = type === 'work' ? workPool : culturePool;
		const filtered = existing.filter((entry) => source.includes(entry));
		const refreshed = filtered.length ? filtered : [...source];

		if (type === 'work') {
			workPool = refreshed;
		} else {
			culturePool = refreshed;
		}

		return refreshed;
	}

	function drawFromType(type: 'work' | 'culture'): string | undefined {
		const pool = ensurePool(type);
		if (!pool.length) return undefined;

		const index = Math.floor(Math.random() * pool.length);
		const selection = pool[index];
		const updated = [...pool.slice(0, index), ...pool.slice(index + 1)];

		if (type === 'work') {
			workPool = updated;
		} else {
			culturePool = updated;
		}

		return selection;
	}

	function pickHeadline(): HeadlineItem {
		displayCount += 1;

		if (displayCount % 3 === 0) {
			return { type: 'brand', text: brandText, logo: brandLogo };
		}

		const preferWork = Math.random() < workWeight;
		const primaryType = preferWork ? 'work' : 'culture';
		const fallbackType = preferWork ? 'culture' : 'work';

		let text = drawFromType(primaryType);
		let resolvedType: HeadlineType = primaryType;

		if (!text) {
			text = drawFromType(fallbackType);
			resolvedType = fallbackType;
		}

		if (!text) {
			text = brandText;
			resolvedType = 'work';
		}

		if (normalizedWorkStatements.includes(text)) {
			resolvedType = 'work';
		} else if (normalizedCultureStatements.includes(text)) {
			resolvedType = 'culture';
		}

		return { type: resolvedType, text };
	}

	function advance() {
		currentItem = pickHeadline();
		headlineKey += 1;
	}

	function registerMeasurement(node: HTMLElement, index: number) {
		let currentIndex = index;

		setRef(node, currentIndex);

		return {
			update(newIndex: number) {
				if (newIndex !== currentIndex) {
					clearRef(currentIndex);
					currentIndex = newIndex;
				}
				setRef(node, currentIndex);
			},
			destroy() {
				clearRef(currentIndex);
			}
		};
	}

	function setRef(node: HTMLElement | null, index: number) {
		if (!node) return;

		if (measurementRefs.length <= index) {
			measurementRefs = [
				...measurementRefs,
				...Array(index - measurementRefs.length + 1).fill(null)
			];
		}

		measurementRefs[index] = node;
		void measureHeadlineHeight();
	}

	function clearRef(index: number) {
		if (index < measurementRefs.length) {
			measurementRefs[index] = null;
			void measureHeadlineHeight();
		}
	}

	onMount(() => {
		advance();
		void measureHeadlineHeight();

		const resizeHandler = () => void measureHeadlineHeight();
		window.addEventListener('resize', resizeHandler);
		const remeasure = setTimeout(() => void measureHeadlineHeight(), 80);

		timer = setInterval(() => {
			advance();
		}, intervalMs);

		return () => {
			if (timer) clearInterval(timer);
			window.removeEventListener('resize', resizeHandler);
			clearTimeout(remeasure);
		};
	});

	onDestroy(() => {
		if (timer) clearInterval(timer);
	});

	$: measurementSignature = JSON.stringify([measurementTexts, clampFont]);
	$: measurementSignature && void measureHeadlineHeight();
</script>

<section class="flex flex-1 items-center justify-center px-6 pt-12 pb-16 md:px-24 md:pt-24">
	<div class="flex flex-col items-center gap-6 text-center">
		<span class="text-xs tracking-[0.4em] text-white/55 uppercase md:text-sm">{eyebrow}</span>
		<div
			class="grid place-items-center overflow-hidden"
			style={`min-height: ${headlineHeightPx ? `${headlineHeightPx}px` : '0px'};`}
		>
			{#key headlineKey}
				<h1
					class="col-start-1 row-start-1 inline-flex items-center justify-center gap-5 leading-[1.05] font-bold tracking-[0.08em] whitespace-nowrap uppercase"
					style={`height: ${headlineHeightPx ? `${headlineHeightPx}px` : 'auto'}; font-size: ${clampFont};`}
					in:fly={{ x: 760, duration: 520, easing: quintOut }}
					out:fly={{ x: -760, duration: 520, easing: quintOut }}
				>
					{#if currentItem.type === 'brand' && currentItem.logo}
						<span class="sr-only">{brandText}</span>
						<img
							class="h-full w-auto object-contain opacity-90"
							src={currentItem.logo}
							alt={brandText}
						/>
					{:else}
						{currentItem.text}
					{/if}
				</h1>
			{/key}
		</div>
		<p class="max-w-xl text-base leading-relaxed text-white/65 md:text-lg">{description}</p>
	</div>
</section>

<div
	class="pointer-events-none absolute top-0 -left-[9999px] flex flex-col gap-4"
	aria-hidden="true"
>
	{#each measurementTexts as text, index}
		<span
			class="inline-flex items-center justify-center gap-5 leading-[1.05] font-bold tracking-[0.08em] whitespace-nowrap uppercase"
			style={`font-size: ${clampFont};`}
			use:registerMeasurement={index}
		>
			{text}
		</span>
	{/each}
</div>
