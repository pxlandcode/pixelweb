<script lang="ts">
	import {
		Cardstack,
		HeroFirstFold,
		NewsPreview,
		ImageHeadline,
		ImageFeaturePair
	} from '$lib/components';
	import type { ActionData, PageData } from './$types';

	import pixelLogoUrl from '$lib/assets/pixelcodelogo.svg?url';

	import { soloImages } from '$lib/images/manifest';

	const logoImports = import.meta.glob('../lib/assets/logos/*.svg', {
		query: '?url',
		import: 'default',
		eager: true
	});

	const discoveredLogos = Object.values(logoImports) as string[];

	const logos = (discoveredLogos.length ? [...discoveredLogos].sort() : []) satisfies string[];
	const leadTitle =
		"We don't believe in making things complicated.\nWe strive for simplicity, and focus on results.";

	const leftTitle = 'Work-life balance';
	const leftBody =
		'We prioritize work-life balance and we foster a culture of professional development, innovation and creativity, encouraging our employees to continuously build their skills, think outside the box and bring new ideas to the table.';
	const rightTitle = 'Our greatest asset';
	const rightBody =
		'Our employees are our greatest asset and we are committed to create a workplace that inspires and offers competitive compensation, success and well-being.';

	const bannerTitle =
		'We design, build and support digital products that create real business value.';

	export let data: PageData;
	export let form: ActionData | undefined;

	$: leadValues = form?.values ?? { website_url: '', email: '' };
	$: newsPosts = data.news?.posts ?? [];
	$: newsError = data.news?.error;
</script>

<main class="flex min-h-screen flex-col bg-background text-[#f0f0f0]">
	<HeroFirstFold {logos} heroProps={{ brandLogo: pixelLogoUrl }} />
	<ImageFeaturePair
		{leadTitle}
		{leftTitle}
		{leftBody}
		leftImageSrc={soloImages.workLife.src}
		{rightTitle}
		{rightBody}
		rightImageSrc={soloImages.asset.src}
	/>

	<!-- Parallax banner -->
	<ImageHeadline
		id="for-clients"
		imageSrc={soloImages.meetingRoom.src}
		title={bannerTitle}
		parallax={0.25}
		pillHref="#cases"
	/>

	<Cardstack id="cases" />
	<NewsPreview posts={newsPosts} error={newsError} />
</main>
