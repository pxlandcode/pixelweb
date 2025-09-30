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
			xl: 'text-lg',
			'3xl': 'text-3xl',
			'4xl': 'text-4xl',
			'5xl': 'text-5xl',
			'6xl': 'text-6xl',
			'7xl': 'text-7xl',
			'8xl': 'text-8xl',
			'9xl': 'text-9xl'
		}
	},
	defaultVariants: {
		size: 'inherit'
	}
});

type RollingTextSize = VariantProps<typeof rollingTextVariants>['size'];

export { Root as RollingText, rollingTextVariants, type RollingTextSize };
