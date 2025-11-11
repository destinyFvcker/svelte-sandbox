<script lang="ts">
	import type { HTMLTableAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		style,
		...restProps
	}: WithElementRef<HTMLTableAttributes> = $props();
</script>

<div data-slot="table-container" class="" {style}>
	<table
		bind:this={ref}
		data-slot="table"
		class={cn('w-full caption-bottom border-separate border-spacing-0 text-sm', className)}
		{...restProps}
	>
		{@render children?.()}
	</table>
</div>
