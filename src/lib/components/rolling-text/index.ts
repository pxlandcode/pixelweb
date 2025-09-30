import Root from './RollingText.svelte';
import { tv, type VariantProps } from 'tailwind-variants';

const rollingTextVariants = tv({
	base: 'group relative inline-flex shrink-0 overflow-hidden align-baseline text-current [line-height:var(--rolling-line-height,1)]',
	variants: {
		size: {
			inherit: '',
			xs: 'text-[0.65rem]',
			sm: 'text-xs',
			md: 'text-sm',
			lg: 'text-base',
			xl: 'text-lg'
		}
	},
	defaultVariants: {
		size: 'inherit'
	}
});

type RollingTextSize = VariantProps<typeof rollingTextVariants>['size'];

export { Root as RollingText, rollingTextVariants, type RollingTextSize };
