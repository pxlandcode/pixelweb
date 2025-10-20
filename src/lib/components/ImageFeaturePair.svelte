<script lang="ts">
	export let leftTop: string = '6rem'; // desktop visual offset for left block
	export let rightTop: string = '18rem'; // desktop visual offset for right block

	export let leadTitle: string;

	export let leftTitle: string;
	export let leftBody: string;
	export let leftImageSrc: string;

	export let rightTitle: string;
	export let rightBody: string;
	export let rightImageSrc: string;
</script>

<section class="relative w-full bg-[#1b1b1b] text-white">
	<div class="mx-auto max-w-7xl px-6 py-16 md:py-20 lg:py-24">
		<!-- Centered headline on top -->
		<h2
			class="m-0 mx-auto max-w-3xl text-left text-5xl leading-tight font-bold whitespace-pre-line
             text-white sm:text-5xl md:text-6xl lg:text-[3.5rem]"
		>
			{leadTitle}
		</h2>

		<div
			class="relative mt-10 grid gap-10 md:mt-16 md:grid-cols-2 md:gap-12"
			style="
        --left-offset: {leftTop};
        --right-offset: {rightTop};
        /* ensure the section reserves space for the translated content on md+ */
        padding-bottom: max(var(--left-offset), var(--right-offset));
      "
		>
			<!-- LEFT feature -->
			<div
				class="grid gap-4 md:[transform:translateY(var(--left-offset))] md:will-change-transform"
			>
				<div class="max-w-[30rem]">
					<h3 class="m-0 text-sm font-semibold tracking-tight">{leftTitle}</h3>
					<p class="mt-2 text-[0.9rem] leading-relaxed text-white/80">{leftBody}</p>
				</div>
				<img src={leftImageSrc} alt="" class="block w-full object-cover" />
			</div>

			<!-- RIGHT feature -->
			<div
				class="grid gap-4 md:[transform:translateY(var(--right-offset))] md:will-change-transform"
			>
				<div class="max-w-[30rem]">
					<h3 class="m-0 text-sm font-semibold tracking-tight">{rightTitle}</h3>
					<p class="mt-2 text-[0.9rem] leading-relaxed text-white/80">{rightBody}</p>
				</div>
				<img src={rightImageSrc} alt="" class="block w-full object-cover" />
			</div>
		</div>
	</div>
</section>
