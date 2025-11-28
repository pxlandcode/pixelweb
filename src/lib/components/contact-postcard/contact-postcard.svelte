<script lang="ts">
	import type { PeopleImageId } from '$lib/images/definitions';
	import { buildSupabaseImageSrc, imageDefinitions } from '$lib/images/manifest';
	import { contactModal } from '$lib/stores/contactModal';
	import pixelcodeLogoDark from '$lib/assets/pixelcodelogodark.svg?url';
	import { fly } from 'svelte/transition';
	import { expoInOut } from 'svelte/easing';
	import { MapPin, X } from 'lucide-svelte';

	let open = $state(false);
	let dialog: HTMLDialogElement | undefined = $state();

	// Sync with store
	$effect(() => {
		const unsubscribe = contactModal.subscribe((value) => {
			open = value;
		});
		return unsubscribe;
	});

	// Sync back to store when closed
	$effect(() => {
		if (!open) {
			contactModal.close();
		}
	});

	function handleClickOutside(e: MouseEvent) {
		const dimensions = dialog!.getBoundingClientRect();
		if (
			e.clientX < dimensions.left ||
			e.clientX > dimensions.right ||
			e.clientY < dimensions.top ||
			e.clientY > dimensions.bottom
		) {
			open = false;
		}
	}

	function fxToggleModal() {
		open ? dialog?.showModal() : dialog?.close();
	}

	$effect(() => fxToggleModal());

	type ContactPortrait = {
		name: string;
		imageId: PeopleImageId;
		rotation: number;
	};

	const CONTACT_PORTRAITS: ContactPortrait[] = [
		{ name: 'Pierre Elmén', imageId: 'pierrePortrait', rotation: -3 },
		{ name: 'Nicklas Arleij', imageId: 'nicklasPortrait', rotation: 4 }
	];

	const getPortraitImage = (imageId: PeopleImageId, size: number) => {
		const definition = imageDefinitions[imageId];

		return {
			src: buildSupabaseImageSrc(definition.supabasePath, {
				width: size,
				height: size,
				resize: 'cover',
				quality: 85
			}),
			alt: definition.alt
		};
	};

	const createPortraits = (size: number) =>
		CONTACT_PORTRAITS.map((portrait) => ({
			...portrait,
			image: getPortraitImage(portrait.imageId, size)
		}));

	const desktopPortraits = createPortraits(140);
	const mobilePortraits = createPortraits(96);
</script>

{#key open}
	{#if open}
		<dialog
			aria-hidden={!open}
			transition:fly={{ y: '200%', duration: open ? 500 : 200, easing: expoInOut, opacity: 0.2 }}
			data-open={open}
			class="m-auto w-[90%] max-w-[900px] overflow-visible border-none bg-transparent p-0 shadow-none backdrop:bg-black/50 backdrop:backdrop-blur"
			onclick={handleClickOutside}
			oncancel={(e) => {
				e.preventDefault();
				open = false;
			}}
			bind:this={dialog}
		>
			<div
				class="relative min-h-[500px] overflow-hidden rounded-none border-[12px] border-white bg-[#faf9f6] p-12 shadow-[0_4px_6px_rgba(0,0,0,0.07),0_10px_20px_rgba(0,0,0,0.1)] md:p-10"
			>
				<!-- Close button -->
				<button
					class="absolute top-2 right-2 flex cursor-pointer items-center justify-center border-none bg-transparent p-1 text-[#2d3748] opacity-30 transition-opacity duration-200 hover:opacity-60"
					onclick={() => (open = false)}
					aria-label="Close"
				>
					<X size={20} />
				</button>

				<!-- Logo -->
				<div class="mb-10 hidden md:block">
					<img
						src={pixelcodeLogoDark}
						alt="pixel&code_"
						class="h-7 w-auto"
						loading="lazy"
						decoding="async"
						fetchpriority="low"
					/>
				</div>

				<!-- Two column layout -->
				<div class="grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_2px_1fr] md:gap-12">
					<!-- Left column -->
					<div class="hidden flex-col gap-4 md:flex">
						<h2
							class="m-0 font-['Fave_Script',_cursive,_serif] text-[3.5rem] leading-none font-normal text-primary md:text-[3.5rem]"
						>
							Greetings!
						</h2>
						<p
							class="m-0 font-['Fave_Script',_cursive,_serif] text-[1.75rem] leading-[1.3] text-primary md:text-[1.75rem]"
						>
							...from our corner office on
							<a
								href="https://maps.app.goo.gl/L9eSZFmUp4ZVzMYz6"
								target="_blank"
								rel="noopener noreferrer"
								class="underline-offset text-primary underline transition-opacity duration-200 hover:opacity-70"
							>
								Tegnérgatan 34 <MapPin size={18} class="mb-[3px] inline-block" />
							</a>
						</p>
						<p
							class="m-0 font-['Fave_Script',_cursive,_serif] text-[1.75rem] leading-[1.3] text-primary md:text-[1.75rem]"
						>
							Here the coffee's strong, but the ideas stronger.
						</p>
						<p
							class="m-0 font-['Fave_Script',_cursive,_serif] text-[1.75rem] leading-[1.3] text-primary md:text-[1.75rem]"
						>
							Say "hello", we'd love to hear from you!
						</p>

						<!-- Photos -->
						<div class="mt-4 flex items-end gap-6">
							{#each desktopPortraits as portrait (portrait.name)}
								<div
									class="bg-white p-2 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.08)] transition-all duration-200 hover:!rotate-0 hover:shadow-[0_4px_8px_rgba(0,0,0,0.15),0_8px_16px_rgba(0,0,0,0.12)]"
									style={`transform: rotate(${portrait.rotation}deg);`}
								>
									<img
										src={portrait.image.src}
										alt={portrait.image.alt}
										class="block h-[120px] w-[120px] object-cover md:h-[120px] md:w-[120px]"
										loading="lazy"
										decoding="async"
										fetchpriority="low"
									/>
									<p
										class="mt-2 mb-0 text-center font-['Fave_Script',_cursive,_serif] text-xl text-primary"
									>
										{portrait.name}
									</p>
								</div>
							{/each}
						</div>
					</div>

					<!-- Divider -->
					<div class="hidden h-full w-[2px] bg-[#2d3748] opacity-20 md:block"></div>

					<!-- Right column -->
					<div class="flex flex-col gap-4 pt-0">
						<h2
							class="relative m-0 origin-left -rotate-[10deg] font-['Fave_Script',_cursive,_serif] text-[2.25rem] leading-[1.1] font-normal text-primary md:-top-6 md:text-[4.25rem]"
						>
							Let's get in touch!
						</h2>

						<div class="flex flex-col gap-[0.3rem] border-b border-[#e5e5e5] pb-2">
							<div class="flex items-baseline gap-2">
								<span class=" text-base font-normal text-[#2d3748]">Mail:</span>
								<a
									href="mailto:hello@pixelcode.se"
									class=" text-lg font-normal text-primary no-underline transition-opacity duration-200 hover:opacity-70"
								>
									hello@pixelcode.se
								</a>
							</div>
						</div>

						<div class="flex flex-col gap-[0.3rem] border-b border-[#e5e5e5] pb-2">
							<div class=" text-base font-normal text-[#2d3748]">Nicklas:</div>
							<div class="m-0 h-px bg-[#e5e5e5]"></div>
							<a
								href="mailto:nicklas@pixelcode.se"
								class=" text-lg font-normal text-primary no-underline transition-opacity duration-200 hover:opacity-70"
							>
								nicklas@pixelcode.se
							</a>
							<div class="m-0 h-px bg-[#e5e5e5]"></div>
							<a
								href="tel:+46706450003"
								class=" text-lg font-normal text-primary no-underline transition-opacity duration-200 hover:opacity-70"
							>
								+46 70-645 00 03
							</a>
						</div>

						<div class="flex flex-col gap-[0.3rem] border-b border-[#e5e5e5] pb-2">
							<div class=" text-base font-normal text-[#2d3748]">Pierre:</div>
							<div class="m-0 h-px bg-[#e5e5e5]"></div>
							<a
								href="mailto:pierre@pixelcode.se"
								class=" text-lg font-normal text-primary no-underline transition-opacity duration-200 hover:opacity-70"
							>
								pierre@pixelcode.se
							</a>
							<div class="m-0 h-px bg-[#e5e5e5]"></div>
							<a
								href="tel:+46763407237"
								class="text-lg font-normal text-primary no-underline transition-opacity duration-200 hover:opacity-70"
							>
								+46 76-340 72 37
							</a>
						</div>

						<!-- Photos on mobile -->
						<div class="mt-6 flex items-end gap-4 md:hidden">
							{#each mobilePortraits as portrait (portrait.name)}
								<div
									class="bg-white p-2 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.08)] transition-all duration-200 hover:!rotate-0 hover:shadow-[0_4px_8px_rgba(0,0,0,0.15),0_8px_16px_rgba(0,0,0,0.12)]"
									style={`transform: rotate(${portrait.rotation}deg);`}
								>
									<img
										src={portrait.image.src}
										alt={portrait.image.alt}
										class="block h-[90px] w-[90px] object-cover"
										loading="lazy"
										decoding="async"
										fetchpriority="low"
									/>
									<p
										class="mt-2 mb-0 text-center font-['Fave_Script',_cursive,_serif] text-base text-primary"
									>
										{portrait.name}
									</p>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</dialog>
	{/if}
{/key}

<style>
	@keyframes dialog-backdrop {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	dialog::backdrop {
		animation: dialog-backdrop 0.5s ease-out;
	}

	dialog[open] {
		animation: dialog-appear 0.5s ease-out;
	}

	@keyframes dialog-appear {
		from {
			opacity: 0;
			transform: translateY(100%);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.font-\[\'Fave_Script\'\,_cursive\,_serif\].text-\[3\.5rem\] {
			font-size: 2.5rem;
		}
		.font-\[\'Fave_Script\'\,_cursive\,_serif\].text-\[3\.25rem\] {
			font-size: 2.25rem;
		}
		.font-\[\'Fave_Script\'\,_cursive\,_serif\].text-\[1\.75rem\] {
			font-size: 1.5rem;
		}
		.w-\[120px\].h-\[120px\] {
			width: 100px;
			height: 100px;
		}
		.text-xl.font-\[\'Fave_Script\'\,_cursive\,_serif\] {
			font-size: 1.125rem;
		}
	}

	@media (max-width: 480px) {
		.font-\[\'Fave_Script\'\,_cursive\,_serif\].text-\[3\.5rem\] {
			font-size: 2rem;
		}
		.font-\[\'Fave_Script\'\,_cursive\,_serif\].text-\[3\.25rem\] {
			font-size: 1.875rem;
		}
		.font-\[\'Fave_Script\'\,_cursive\,_serif\].text-\[1\.75rem\] {
			font-size: 1.25rem;
		}
		.font-\[system-ui\,-apple-system\,sans-serif\].text-lg {
			font-size: 1rem;
		}
		.font-\[system-ui\,-apple-system\,sans-serif\].text-2xl {
			font-size: 1.25rem;
		}
		.w-\[120px\].h-\[120px\] {
			width: 90px;
			height: 90px;
		}
		.text-xl.font-\[\'Fave_Script\'\,_cursive\,_serif\] {
			font-size: 1rem;
		}
	}
</style>
