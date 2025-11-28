<script lang="ts">
	import { TechStackSelector } from '$lib/components';
	import type { Language } from '../utils';

	let {
		techniques = $bindable(),
		methods = $bindable(),
		isEditing = false,
		language = 'sv'
	}: {
		techniques: string[];
		methods: string[];
		isEditing?: boolean;
		language?: Language;
	} = $props();
</script>

{#if isEditing || techniques.length > 0 || methods.length > 0}
	<section class="resume-print-section mt-8">
		<!-- Section Header with dividers -->
		<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
			<h2 class="text-base font-bold text-slate-900 uppercase">
				{language === 'sv' ? 'Kompetenser' : 'Skills'}
			</h2>
			<div class="flex items-center">
				<div class="h-px w-full bg-orange-500"></div>
			</div>
			<div class="flex items-center">
				<div class="h-px flex-1 bg-slate-300"></div>
			</div>
		</div>

		<div class="mt-4 space-y-4">
			{#if isEditing}
				<!-- Techniques Editor -->
				<div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
					<p class="mb-2 text-sm font-semibold text-slate-700">
						{language === 'sv' ? 'Tekniker' : 'Techniques'}
					</p>
					<TechStackSelector
						bind:value={techniques}
						onchange={(techs) => (techniques = techs ?? [])}
					/>
				</div>
				<!-- Methods Editor -->
				<div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
					<p class="mb-2 text-sm font-semibold text-slate-700">
						{language === 'sv' ? 'Metoder' : 'Methods'}
					</p>
					<TechStackSelector bind:value={methods} onchange={(m) => (methods = m ?? [])} />
				</div>
			{:else}
				{#if techniques.length > 0}
					<!-- Techniques Row -->
					<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
						<div></div>
						<p class="pt-1 text-xs font-bold tracking-wide text-slate-700 uppercase">
							{language === 'sv' ? 'Tekniker' : 'Techniques'}
						</p>
						<div class="flex flex-wrap gap-2">
							{#each techniques as tech}
								<span class="rounded bg-slate-100 px-3 py-1 text-xs text-slate-800">{tech}</span>
							{/each}
						</div>
					</div>
				{/if}

				{#if methods.length > 0}
					<!-- Methods Row -->
					<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
						<div></div>
						<p class="pt-1 text-xs font-bold tracking-wide text-slate-700 uppercase">
							{language === 'sv' ? 'Metoder' : 'Methods'}
						</p>
						<div class="flex flex-wrap gap-2">
							{#each methods as method}
								<span class="rounded bg-slate-100 px-3 py-1 text-xs text-slate-800">{method}</span>
							{/each}
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</section>
{/if}
