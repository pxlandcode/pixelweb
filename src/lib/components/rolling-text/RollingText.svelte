<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ClassNameValue } from 'tailwind-merge';

	import { cn } from '$utils';
	import { rollingTextVariants, type RollingTextSize } from '.';

	type Props = {
		text?: string;
		children?: Snippet;
		size?: RollingTextSize;
		as?: keyof HTMLElementTagNameMap;
		class?: ClassNameValue;
		initialTextClass?: ClassNameValue;
		rollingTextClass?: ClassNameValue;
		duration?: number;
		easing?: string;
		offset?: string;
		inheritParentHover?: boolean; // requires parent to have tailwinds group class
	};

	let {
		text,
		children,
		size,
		as = 'span',
		class: className,
		initialTextClass,
		rollingTextClass,
		duration = 500,
		easing = 'cubic-bezier(0.34, 1.56, 0.64, 1)',
		offset = '110%',
		inheritParentHover = false,
		style,
		...rest
	}: Props & HTMLAttributes<HTMLElement> = $props();

	const inlineStyle = $derived(() =>
		[
			style,
			`--rolling-duration:${duration}ms`,
			`--rolling-easing:${easing}`,
			`--rolling-offset:${offset}`
		]
			.filter(Boolean)
			.join('; ')
	);
</script>

<svelte:element
	this={as}
	{...rest}
	class={cn(rollingTextVariants({ size, className }), !inheritParentHover && 'group')}
	style={inlineStyle()}
>
	<span class="flex overflow-hidden">
		<span
			class={cn(
				'block whitespace-nowrap transition-transform [transition-duration:var(--rolling-duration)] [transition-timing-function:var(--rolling-easing)] will-change-transform group-hover:-translate-y-[var(--rolling-offset)] group-focus-visible:-translate-y-[var(--rolling-offset)] motion-reduce:transform-none motion-reduce:transition-none',
				initialTextClass
			)}
		>
			{#if children}
				{@render children()}
			{:else if text != null}
				{text}
			{/if}
		</span>
	</span>
	<span
		class="pointer-events-none absolute inset-x-0 top-0 flex overflow-hidden"
		aria-hidden="true"
	>
		<span
			class={cn(
				'block translate-y-[var(--rolling-offset)] whitespace-nowrap transition-transform [transition-duration:var(--rolling-duration)] [transition-timing-function:var(--rolling-easing)] will-change-transform group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none',
				rollingTextClass
			)}
		>
			{#if children}
				{@render children()}
			{:else if text != null}
				{text}
			{/if}
		</span>
	</span>
</svelte:element>
