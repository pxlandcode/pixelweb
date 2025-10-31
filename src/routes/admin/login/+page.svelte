<script lang="ts">
        import LoginForm from '$lib/components/LoginForm.svelte';
        import { enhance } from '$app/forms';

        let { form } = $props();
        let pending = false;
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
        <LoginForm
                {form}
                {pending}
                use:enhance={{
                        pending: () => (pending = true),
                        result: () => (pending = false)
                }}
        />
</div>
