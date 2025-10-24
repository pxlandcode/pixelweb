<script lang="ts">
        import { fade, scale } from 'svelte/transition';
        import { loading } from '$lib/stores/loading';

        const messagesRole = 'status';
</script>

{#if $loading.active}
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm transition-opacity" role="presentation">
                {#if $loading.spinnerVisible && !$loading.dialogVisible}
                        <div class="flex flex-col items-center gap-4" aria-live={messagesRole}>
                                <div class="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
                                <p class="max-w-xs text-center text-sm text-white/80" transition:fade>{$loading.message}</p>
                        </div>
                {/if}

                {#if $loading.dialogVisible}
                        <div
                                class="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/10 bg-background/95 p-6 shadow-2xl"
                                role="alertdialog"
                                aria-live={messagesRole}
                                aria-label={$loading.title}
                                transition:scale={{ start: 0.92, duration: 180 }}
                        >
                                <p class="text-xs font-medium uppercase tracking-[0.2rem] text-primary/80">{ $loading.title }</p>
                                <h2 class="mt-3 text-lg font-semibold text-white">AI compatibility diagnostic in progress…</h2>
                                <p class="mt-2 text-sm leading-relaxed text-white/80">{$loading.message}</p>
                                <div class="mt-5 flex items-center gap-3 text-xs text-white/60">
                                        <span class="inline-flex h-2 w-2 animate-pulse rounded-full bg-primary"></span>
                                        <span>We'll wrap this scan as soon as the bots sign off.</span>
                                </div>
                        </div>
                {/if}
        </div>
{/if}
