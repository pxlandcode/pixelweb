<script lang="ts">
  import { onMount } from 'svelte';

  const introParagraphs = [
    'We started Pixel&Code_ with a simple idea: to build a place where good people and meaningful work grow side by side.',
    'A team where curiosity and craft matter as much as delivery — and where culture is something we live, not just talk about.'
  ];

  const offerIntro = "What we offer isn’t just projects — it’s a way of working.";

  const offerParagraphs = [
    'At Pixel&Code_, you get the best of both worlds: the freedom and closeness of a small team, backed by the stability and support of strong partners.',
    'You’ll work in environments that challenge you — from complex systems in banking, insurance, and the public sector to ventures finding their next phase of growth.',
    'Along the way, you’ll have the space to experiment, learn, and shape your own path.',
    'Our open pay model, transparent structure, and trust-based culture mean you always know where you stand — and that your effort creates real impact, for both you and your clients.'
  ];

  let introVisible = introParagraphs.map(() => false);
  let offerVisible = offerParagraphs.map(() => false);
  let labelVisible = false;
  let titleVisible = false;
  let dividerVisible = false;
  let offerHeadingVisible = false;
  let scrollY = 0;

  const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';

  $: parallaxOffset = -(scrollY * 0.15);

  function observe(node: HTMLElement, params: { onEnter: () => void; once?: boolean } = { onEnter: () => {} }) {
    const { onEnter, once = true } = params;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onEnter?.();
            if (once) {
              observer.unobserve(node);
            }
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(node);

    return {
      destroy() {
        observer.disconnect();
      }
    };
  }

  onMount(() => {
    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<section class="relative isolate overflow-hidden py-24 sm:py-32">
  <div
    class="pointer-events-none absolute inset-0 -z-10 transform-gpu"
    style={`transform: translate3d(0, ${parallaxOffset}px, 0); transition: transform 0.6s ${easing};`}
  >
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(120,113,198,0.25),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(76,29,149,0.35),transparent_65%)]"></div>
    <div class="absolute inset-0 bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-200 opacity-80 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950"></div>
  </div>

  <div class="relative mx-auto flex max-w-3xl flex-col gap-12 px-6 text-neutral-900 dark:text-neutral-100">
    <header class="space-y-6 text-center">
      <p
        use:observe={{
          onEnter: () => {
            labelVisible = true;
          }
        }}
        class={`mx-auto max-w-2xl text-sm uppercase tracking-[0.3em] text-neutral-600 transition-all duration-700 dark:text-neutral-400 ${
          labelVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={`transition-timing-function: ${easing};`}
      >
        About Pixel&Code_
      </p>
      <h2
        use:observe={{
          onEnter: () => {
            titleVisible = true;
          }
        }}
        class={`text-2xl font-medium tracking-tight text-neutral-900 transition-all duration-700 sm:text-3xl md:text-4xl dark:text-neutral-50 ${
          titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
        style={`transition-delay: 120ms; transition-timing-function: ${easing};`}
      >
        A calm space for meaningful digital craft
      </h2>
      <div class="space-y-6 text-left md:text-lg text-base text-neutral-700 dark:text-neutral-200/90">
        {#each introParagraphs as paragraph, index}
          <p
            use:observe={{
              onEnter: () => {
                introVisible = introVisible.map((visible, i) => (i === index ? true : visible));
              }
            }}
            class={`transition-all duration-700 ${
              introVisible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={`transition-delay: ${index * 120 + 180}ms; transition-timing-function: ${easing};`}
          >
            {paragraph}
          </p>
        {/each}
      </div>
    </header>

    <div class="flex flex-col items-center gap-10 text-center">
      <div class="relative h-px w-full max-w-xl overflow-hidden">
        <span
          use:observe={{
            onEnter: () => {
              dividerVisible = true;
            }
          }}
          class={`block h-full w-full origin-center rounded-full bg-gradient-to-r from-transparent via-violet-500/70 to-transparent transition-all duration-700 ${
            dividerVisible ? 'scale-x-100 opacity-100' : 'scale-x-50 opacity-0'
          }`}
          style={`transition-timing-function: ${easing};`}
        />
        <span class="absolute inset-x-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/60 blur-[2px]"></span>
      </div>
      <p
        use:observe={{
          onEnter: () => {
            offerHeadingVisible = true;
          }
        }}
        class={`text-lg font-medium text-neutral-800 transition-all duration-700 dark:text-neutral-200/90 ${
          offerHeadingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={`transition-delay: 120ms; transition-timing-function: ${easing};`}
      >
        {offerIntro}
      </p>
    </div>

    <div class="space-y-8 text-left text-base leading-relaxed text-neutral-700 md:text-lg dark:text-neutral-200/90">
      {#each offerParagraphs as paragraph, index}
        <p
          use:observe={{
            onEnter: () => {
              offerVisible = offerVisible.map((visible, i) => (i === index ? true : visible));
            }
          }}
          class={`transition-all duration-700 ${
            offerVisible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={`transition-delay: ${index * 140 + 120}ms; transition-timing-function: ${easing};`}
        >
          {paragraph}
        </p>
      {/each}
    </div>
  </div>
</section>

<style>
  section::before {
    content: '';
    position: absolute;
    inset: 0;
    backdrop-filter: blur(20px);
    opacity: 0.4;
    pointer-events: none;
  }

  :global(body.dark) section::before {
    opacity: 0.2;
  }

  @media (prefers-reduced-motion: reduce) {
    section :global(*) {
      transition-duration: 0s !important;
      animation-duration: 0s !important;
    }
  }
</style>
