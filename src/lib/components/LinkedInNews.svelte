<script lang="ts">
	import type { LinkedInPost } from '$lib/types';

	export let posts: LinkedInPost[] = [];
	export let error: string | undefined;

	const clampText = (value: string, length = 180) => {
		if (!value) return value;
		return value.length > length ? `${value.slice(0, length - 1).trimEnd()}…` : value;
	};

	const formatDate = (value: string): string => {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return '';
		const day = `${date.getDate()}`.padStart(2, '0');
		const month = `${date.getMonth() + 1}`.padStart(2, '0');
		const year = `${date.getFullYear()}`.slice(-2);
		return `${day}.${month}.${year}`;
	};

	$: sortedPosts = [...posts].sort(
		(a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
	);
	$: formattedPosts = sortedPosts.map((post) => ({
		...post,
		summary: post.summary ? clampText(post.summary) : ''
	}));
</script>

<section class="news-section mt-24 bg-[#e6e6db] text-[#15150f]">
	<div class="mx-auto max-w-7xl px-6 py-20 sm:py-24">
		<header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div class="space-y-3">
				<p class="text-sm font-medium uppercase tracking-[0.3em] text-[#5c5d4c]">LinkedIn</p>
				<h2 class="text-4xl font-semibold leading-none text-[#10120a] sm:text-5xl">What's New</h2>
				<p class="max-w-2xl text-base leading-relaxed text-[#454637]">
					Catch the latest updates, launches, and milestones from our LinkedIn community.
				</p>
			</div>
			<a
				class="inline-flex items-center gap-2 self-start rounded-full border border-[#bcbca9] bg-white/60 px-5 py-2 text-sm font-semibold text-[#2c2d21] transition hover:bg-white hover:text-[#0f0f0c]"
				href="https://www.linkedin.com/company/90364210/"
				target="_blank"
				rel="noreferrer noopener"
			>
				Follow on LinkedIn
				<span aria-hidden="true">-></span>
			</a>
		</header>

		{#if error}
			<p class="mt-8 rounded-2xl border border-[#d3d2c1] bg-white/70 px-5 py-4 text-sm text-[#703636]">
				{error}
			</p>
		{/if}

		{#if formattedPosts.length}
			<div class="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
				{#each formattedPosts as post (post.id)}
					<article
						class="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[#f7f4e7] shadow-[0_28px_60px_rgba(24,25,27,0.18)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_36px_76px_rgba(24,25,27,0.22)]"
					>
						<a
							class="flex h-full flex-col"
							href={post.link}
							target="_blank"
							rel="noreferrer noopener"
						>
							<div class="relative overflow-hidden">
								{#if post.mediaUrl}
									<img
										src={post.mediaUrl}
										alt={post.mediaAlt ?? post.title}
										loading="lazy"
										class="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.05]"
									/>
								{:else}
									<div class="flex h-64 w-full items-center justify-center bg-[#d2d1c2] text-sm text-[#424233]">
										Image not available
									</div>
								{/if}
								{#if post.badge}
									<span
										class="absolute bottom-4 left-4 rounded-full bg-[#12130d]/90 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white shadow-lg"
									>
										{post.badge}
									</span>
								{/if}
							</div>
							<div class="flex flex-1 flex-col gap-4 px-7 pb-8 pt-7 text-[#222217]">
								{#if post.publishedAt}
									<p class="text-sm font-medium tracking-[0.15em] text-[#676851]">
										{formatDate(post.publishedAt)}
									</p>
								{/if}
								<h3 class="text-xl font-semibold leading-tight transition-colors group-hover:text-[#0f0f0d]">
									{post.title}
								</h3>
								{#if post.summary}
									<p class="text-base leading-relaxed text-[#3d3d2e]">
										{post.summary}
									</p>
								{/if}
								<span class="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[#1d1d13] transition-colors group-hover:text-[#f35b3f]">
									{post.ctaLabel ?? 'View on LinkedIn'}
									<span aria-hidden="true">-></span>
								</span>
							</div>
						</a>
					</article>
				{/each}
			</div>
		{:else}
			<div class="mt-12 rounded-3xl border border-dashed border-[#c7c6b2] bg-[#f7f4e7] px-8 py-16 text-center text-base text-[#474738]">
				<p>No LinkedIn posts are available right now. Follow us on LinkedIn to stay in the loop.</p>
			</div>
		{/if}
	</div>
</section>
