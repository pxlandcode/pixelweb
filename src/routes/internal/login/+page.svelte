<script lang="ts">
        import LoginForm from '$lib/components/LoginForm.svelte';

	const { form } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
	<LoginForm {form} />
</div>
