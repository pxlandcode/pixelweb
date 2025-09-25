<script lang="ts">
	import type { Snippet } from 'svelte';
	import { buttonVariants, type ButtonSize, type ButtonVariant } from '.';
	import { cn } from '$utils';
	import type { ClassNameValue } from 'tailwind-merge';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = {
		children: Snippet;
		variant?: ButtonVariant;
		size?: ButtonSize;
		class?: ClassNameValue;
	};

	let {
		children,
		variant,
		size,
		class: className,
		...rest
	}: Props & HTMLButtonAttributes = $props();
</script>

<button class={cn(buttonVariants({ variant, size, className }))} {...rest}>
	{@render children()}
</button>
