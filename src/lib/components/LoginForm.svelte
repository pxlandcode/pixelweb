<script lang="ts">
        import type { ActionData } from '../../routes/admin/login/$types';
        import { dev } from '$app/environment';

        let { form = null, pending = false, ...rest } = $props();
</script>

<form
        method="POST"
        class="mx-auto w-full max-w-sm space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow"
        {...rest}
>
        <header class="space-y-1 text-center">
                <h1 class="text-xl font-semibold text-gray-900">PixelCMS Admin</h1>
                <p class="text-sm text-gray-500">Sign in with your work email to continue.</p>
        </header>

        <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700" for="email">Email</label>
                <input
                        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        type="email"
                        id="email"
                        name="email"
                        required
                        autocomplete="email"
                />
        </div>

        <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700" for="password">Password</label>
                <input
                        class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        type="password"
                        id="password"
                        name="password"
                        required
                        autocomplete={dev ? 'off' : 'current-password'}
                />
        </div>

        {#if form?.message}
                <p class="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-600">{form.message}</p>
        {/if}

        <button
                type="submit"
                class="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                disabled={pending}
        >
                {pending ? 'Signing in…' : 'Sign in'}
        </button>
</form>
