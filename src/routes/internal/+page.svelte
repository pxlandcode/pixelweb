<script lang="ts">
        import { Card } from '@pixelcode_/blocks/components';

        const { data } = $props();
</script>

<section class="space-y-6">
        <header>
                <h1 class="text-2xl font-semibold text-gray-900">Welcome back</h1>
                <p class="mt-1 text-sm text-gray-700">
                        Use the sidebar to manage team members and publish updates for PixelCMS.
                </p>
        </header>

        <!-- Replace the quick start cards with dashboard metrics once analytics are ready. -->
        <div class="grid gap-4 md:grid-cols-2">
                <Card class="gap-3 p-6">
                        <h2 class="text-lg font-semibold text-gray-900">Your profile</h2>
                        <p class="text-sm text-gray-700">
                                <strong>Name:</strong>
                                {[data.profile?.first_name, data.profile?.last_name].filter(Boolean).join(' ') || 'Missing'}
                        </p>
                        <p class="text-sm text-gray-700"><strong>Email:</strong> {data.user?.email}</p>
                        <p class="text-sm text-gray-700"><strong>Role:</strong> {data.role}</p>
                </Card>

                <Card class="gap-3 p-6">
                        <h2 class="text-lg font-semibold text-gray-900">Getting started</h2>
                        <ul class="list-inside list-disc text-sm text-gray-700">
                                <li>Admins can invite new teammates in the Users tab.</li>
                                <li>CMS admins can publish articles and LinkedIn posts from the News tab.</li>
                                <li>Reach out to the PixelCMS team if you need additional permissions.</li>
                        </ul>
                </Card>
        </div>
</section>
