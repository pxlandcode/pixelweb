<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';

    const introText = 'Our Discord is always alive.';

    const messages = [
        {
            user: 'Kai',
            avatar: '🦊',
            text: 'Anyone tried the new SvelteKit release yet?'
        },
        {
            user: 'Nova',
            avatar: '🌌',
            text: 'Friday fika remote edition ☕️'
        },
        {
            user: 'Mira',
            avatar: '🎬',
            text: 'We should totally make a movie night channel.'
        },
        {
            user: 'Rin',
            avatar: '🚀',
            text: 'Just pushed the new client dashboard build 🚀'
        },
        {
            user: 'Leo',
            avatar: '👋',
            text: 'Morning standup in 10 👋'
        },
        {
            user: 'Ari',
            avatar: '🔥',
            text: 'That AI feature demo yesterday was 🔥'
        },
        {
            user: 'Pip',
            avatar: '☕️',
            text: 'Coffee or energy drink today?'
        },
        {
            user: 'Skye',
            avatar: '💡',
            text: 'PixelTalk next week — topic: creative tech!'
        },
        {
            user: 'Elle',
            avatar: '🪐',
            text: 'Anyone seen the new Dune?'
        },
        {
            user: 'Jules',
            avatar: '💙',
            text: 'This community makes Mondays actually fun.'
        }
    ];

    const messageRevealStages = [
        { threshold: 0, count: 0 },
        { threshold: 0.1, count: 2 },
        { threshold: 0.25, count: 4 },
        { threshold: 0.4, count: 6 },
        { threshold: 0.55, count: 8 },
        { threshold: 0.7, count: 10 },
        { threshold: 0.85, count: messages.length }
    ];

    let container: HTMLElement;
    let introSection: HTMLElement;
    let chatSection: HTMLElement;

    let introProgress = 0;
    let chatProgress = 0;

    const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

    const updateProgress = () => {
        if (!container || !introSection || !chatSection) return;

        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;

        const introStart = introSection.offsetTop - viewportHeight;
        const introEnd = introStart + introSection.offsetHeight + viewportHeight;
        introProgress = clamp((scrollY - introStart) / (introEnd - introStart));

        const chatStart = chatSection.offsetTop - viewportHeight;
        const chatEnd = chatStart + chatSection.offsetHeight + viewportHeight;
        chatProgress = clamp((scrollY - chatStart) / (chatEnd - chatStart));
    };

    onMount(() => {
        updateProgress();
        window.addEventListener('scroll', updateProgress, { passive: true });
        window.addEventListener('resize', updateProgress);

        return () => {
            window.removeEventListener('scroll', updateProgress);
            window.removeEventListener('resize', updateProgress);
        };
    });

    $: lettersToShow = Math.floor(introProgress * introText.length);
    $: visibleText = introText.slice(0, lettersToShow);
    $: fadeOutAmount = clamp((introProgress - 0.85) / 0.15);
    $: introOpacity = 1 - fadeOutAmount;

    $: chatOpacity = clamp((chatProgress - 0.05) / 0.2);

    $: visibleCount = messageRevealStages.reduce((count, stage) => (chatProgress >= stage.threshold ? stage.count : count), 0);
    $: visibleMessages = messages.slice(0, visibleCount);
</script>

<section
    bind:this={container}
    class="relative isolate flex min-h-[220vh] w-full flex-col overflow-hidden bg-[#0E0E0E] text-white"
>
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(109,40,217,0.25),_transparent_55%)]"></div>

    <div class="flex min-h-screen flex-col items-center justify-center px-6 py-24" bind:this={introSection}>
        <div
            class="max-w-3xl text-center text-4xl font-light tracking-tight md:text-6xl"
            style={`opacity: ${introOpacity};`}
        >
            <span class="inline-block bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent">
                {#if visibleText.length}
                    {visibleText}
                {/if}
            </span>
        </div>
        <div class="mt-6 h-1 w-24 rounded-full bg-white/10">
            <div
                class="h-full rounded-full bg-white/70 transition-all duration-300"
                style={`width: ${clamp(introProgress, 0, 1) * 100}%`}
            ></div>
        </div>
    </div>

    <div class="flex min-h-[120vh] items-center justify-center px-6 py-24" bind:this={chatSection}>
        <div
            class="relative mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 text-sm text-white shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur"
            style={`opacity: ${chatOpacity}; transform: translateY(${(1 - chatOpacity) * 40}px); transition: opacity 0.6s ease, transform 0.6s ease;`}
        >
            <header class="flex items-center gap-3 border-b border-white/10 pb-4 text-left text-xs uppercase tracking-[0.2em] text-white/60">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/70 to-sky-500/70 text-lg">
                    💬
                </div>
                <div>
                    <p class="text-sm font-semibold text-white/80">#pixel-culture</p>
                    <p class="text-xs text-white/60">Where ideas, memes, and midnight builds collide.</p>
                </div>
            </header>

            <div class="flex flex-1 flex-col gap-6 overflow-hidden">
                {#each visibleMessages as message, index (message.text)}
                    <article
                        class={`group flex max-w-[80%] flex-col gap-2 rounded-3xl px-5 py-4 transition-all duration-500 sm:max-w-[70%] ${
                            index % 2 === 0 ? 'self-start bg-white/10 text-left' : 'self-end bg-indigo-500/20 text-right'
                        }`}
                        in:fly={{ y: index % 2 === 0 ? 24 : -24, duration: 400 }}
                        in:fade={{ duration: 400 }}
                    >
                        <header class={`flex items-center gap-3 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-lg shadow-inner">
                                {message.avatar}
                            </span>
                            <p class="text-xs font-semibold uppercase tracking-wide text-white/60">{message.user}</p>
                        </header>
                        <p class="text-base leading-relaxed text-white/90">{message.text}</p>
                    </article>
                {/each}
            </div>

            <footer class="mt-6 flex items-center justify-between text-xs text-white/40">
                <span>Typing…</span>
                <span>{visibleCount} / {messages.length}</span>
            </footer>
        </div>
    </div>
</section>

<style>
    section {
        scroll-snap-align: start;
    }
</style>
