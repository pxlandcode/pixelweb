<script lang="ts">
	export let logos: string[] = [];
	export let background = '#f35b3f';

	let marqueeLogos: string[] = [];

	$: totalUnique = logos.length || 1;

	$: marqueeLogos = logos.length ? [...logos, ...logos] : [];
</script>

<section class="relative py-6 md:py-7" style={`background:${background}`}>
	<div class="relative overflow-hidden">
		<div
			class="pointer-events-none absolute inset-y-0 left-0 z-[1] w-20 bg-gradient-to-r from-[#f35b3f] to-transparent"
		></div>
		<div
			class="pointer-events-none absolute inset-y-0 right-0 z-[1] w-20 bg-gradient-to-l from-[#f35b3f] to-transparent"
		></div>
		<div
			class="animate-marquee flex w-max items-center gap-x-[clamp(2.5rem,8vw,6rem)] px-[clamp(2rem,6vw,4rem)]"
			aria-hidden="true"
		>
			{#each marqueeLogos as logo, index}
				<div
					class="flex h-[clamp(2.5rem,6vw,3.5rem)] w-[clamp(5rem,12vw,8rem)] flex-none items-center justify-center"
				>
					<img
						src={logo}
						alt={`Partner logo ${(index % totalUnique) + 1}`}
						loading="lazy"
						class="max-h-full max-w-full opacity-85 brightness-0 contrast-125 grayscale filter"
					/>
				</div>
			{/each}
		</div>
	</div>
</section>
