<script lang="ts">
	let {
		label,
		skipFirstColumn = false,
		children
	} = $props<{
		label: string;
		skipFirstColumn?: boolean;
		children: any;
	}>();
</script>

{#if skipFirstColumn}
	<div class="grid gap-6 md:grid-cols-[15%_15%_1fr]">
		<div></div>
		<p class="pt-1 text-xs font-bold tracking-wide text-slate-700 uppercase">{label}</p>
		<div>
			{@render children()}
		</div>
	</div>
{:else}
	<div class="grid gap-6 md:grid-cols-[15%_5%_1fr]">
		<p class="pt-1 text-xs font-bold tracking-wide text-slate-700 uppercase">{label}</p>
		<div></div>
		<div>
			{@render children()}
		</div>
	</div>
{/if}
