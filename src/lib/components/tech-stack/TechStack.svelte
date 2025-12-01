<script lang="ts">
	import Bot from 'lucide-svelte/icons/bot';
	import BrainCircuit from 'lucide-svelte/icons/brain-circuit';
	import Braces from 'lucide-svelte/icons/braces';
	import CloudCog from 'lucide-svelte/icons/cloud-cog';
	import Code2 from 'lucide-svelte/icons/code-2';
	import Container from 'lucide-svelte/icons/container';
	import Cpu from 'lucide-svelte/icons/cpu';
	import Database from 'lucide-svelte/icons/database';
	import Flame from 'lucide-svelte/icons/flame';
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import Workflow from 'lucide-svelte/icons/workflow';
	import andLogo from '$lib/assets/and.svg?url';

	type TechItem = {
		label: string;
		Icon?: typeof Bot;
		hint?: string;
		img?: string;
	};

	const techItems: TechItem[] = [
		{ label: 'Technical leadership', Icon: Sparkles },
		{ label: 'Project management', Icon: Workflow },
		{ label: 'Solution architecture', Icon: Braces },
		{ label: 'Systems integration', Icon: Workflow },
		{ label: 'Requirements & discovery', Icon: Sparkles },

		{ label: 'Frontend engineering', Icon: Flame },
		{ label: 'TypeScript & modern JavaScript', Icon: Code2 },
		{ label: 'Design systems & UI engineering', Icon: Sparkles },
		{ label: 'Interaction & motion design', Icon: Flame },
		{ label: 'Accessibility & performance', Icon: Cpu },

		{ label: 'Full-stack development', Icon: Braces },
		{ label: 'Backend architecture', Icon: Braces },
		{ label: 'API-first development', Icon: Workflow },
		{ label: 'Authentication & authorization', Icon: Braces },
		{ label: 'Realtime & event-driven systems', Icon: Workflow },

		{ label: 'Databases (SQL & NoSQL)', Icon: Database },
		{ label: 'Data modeling & pipelines', Icon: Database },
		{ label: 'Vector search, embeddings & RAG', Icon: Database },
		{ label: 'AI assistants & automation', Icon: BrainCircuit },
		{ label: 'Observability & analytics', Icon: Cpu },

		{ label: 'Cloud & infrastructure (Azure, AWS, GCP)', Icon: CloudCog },
		{ label: 'CI/CD & DevOps automation', Icon: Workflow },
		{ label: 'Security, compliance & technical audits', Icon: Cpu },

		{ label: 'And much more', img: andLogo }
	];
</script>

<section class="relative">
	<div class="mx-auto flex w-full max-w-none flex-col gap-8">
		<div class="mb-10 px-4 text-center">
			<h2 class="text-2xl leading-tight font-semibold text-white sm:text-3xl">
				We bring a broad and dependable skill set to every project.
			</h2>
		</div>

		<div class="relative isolate w-full" style="--cell-size: clamp(90px, 8vw, 120px);">
			<div
				class="relative z-10 grid w-full auto-cols-[minmax(var(--cell-size),1fr)] grid-flow-col grid-rows-[repeat(4,auto)] gap-0"
			>
				{#each techItems as tech}
					<article
						class="group relative isolate aspect-square w-full overflow-hidden border border-white/10 bg-transparent p-2.5 transition-colors duration-800 ease-out group-hover:duration-150 hover:border-[var(--color-primary)] hover:bg-white/[0.02]"
					>
						<span
							class="pointer-events-none absolute inset-[-18%] -z-10 rounded-[28px] bg-[var(--color-primary)] opacity-0 blur-3xl transition-opacity duration-900 ease-out group-hover:opacity-30 group-hover:duration-150"
						/>
						<span
							class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(243,91,63,0.22),transparent_55%)] opacity-0 transition-opacity duration-900 ease-out group-hover:opacity-100 group-hover:duration-150"
						/>

						<div
							class="relative flex h-full flex-col items-center justify-center gap-2 text-center"
						>
							{#if tech.img}
								<img src={tech.img} alt="" class="h-7 w-7 object-contain" loading="lazy" />
							{:else if tech.Icon}
								<svelte:component this={tech.Icon} class="h-6 w-6 text-white" />
							{:else}
								<span
									class="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-sm font-semibold text-white/80 transition-colors duration-500 group-hover:border-[var(--color-primary)] group-hover:text-white"
								>
									{tech.label.slice(0, 1)}
								</span>
							{/if}

							<p class="text-[0.72rem] leading-tight font-semibold text-white sm:text-[0.78rem]">
								{tech.label}
							</p>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</div>
</section>
