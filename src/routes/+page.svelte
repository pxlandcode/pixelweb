<script lang="ts">
	import { PixelButton } from '$components';
	import { Card, FormControl, Input } from '@pixelcode_/blocks/components';

	const buttonText: PixelType = { foo: 'Pixel&Code' };
</script>

<h1 class="text-5xl font-bold text-primary">Pixel & Code Boilerplate</h1>

<PixelButton>{buttonText.foo}</PixelButton>
<PixelButton variant="ghost">{buttonText.foo}</PixelButton>
<PixelButton variant="outline">{buttonText.foo}</PixelButton>
<PixelButton variant="destructive">{buttonText.foo}</PixelButton>

<FormControl label="Hejsan">
	<Input />
</FormControl>
