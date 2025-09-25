import Root from './pixel-button.svelte';
import { tv, type VariantProps } from 'tailwind-variants';

const buttonVariants = tv({
	base: 'inline-flex cursor-pointer px-2 items-center justify-center gap-2 normal-case rounded-sm transition-all font-medium box-border disabled:cursor-not-allowed disabled:text-muted-fg disabled:bg-muted active:scale-[.98] focus-visible:outline-1 outline-offset-4 outline-border',
	variants: {
		variant: {
			primary: 'bg-primary text-primary-fg hover:bg-primary/90',
			outline:
				'bg-transparent border border-primary text-primary hover:bg-primary/20 disabled:bg-muted/50 disabled:border-muted-fg',
			ghost:
				'bg-transparent border-none text-inherit hover:bg-foreground/10 disabled:bg-transparent',
			destructive: 'bg-destructive text-foreground hover:bg-destructive/80'
		},
		size: {
			xxl: 'text-lg h-xxl',
			xl: 'text-base h-xl',
			lg: 'text-base h-lg',
			md: 'text-sm h-md',
			sm: 'text-xs h-sm',
			xs: 'text-xs h-xs'
		}
	},
	defaultVariants: {
		variant: 'primary',
		size: 'md'
	}
});

type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
type ButtonSize = VariantProps<typeof buttonVariants>['size'];

export { Root as PixelButton, type ButtonVariant, type ButtonSize, buttonVariants };
