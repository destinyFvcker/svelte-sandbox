<script lang="ts">
	import type { HTMLTableAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		containerRef = $bindable(null),
		class: className,
		children,
		style,
		...restProps
	}: WithElementRef<HTMLTableAttributes> & { containerRef?: HTMLDivElement | null } = $props();

	let isOverflow = restProps['data-overflow'] !== undefined;
</script>

<div
	bind:this={containerRef}
	data-slot="table-container"
	{style}
	class={cn(
		isOverflow &&
			'scrollbar-thin max-h-screen overflow-auto scrollbar-thumb-slate-700 scrollbar-track-slate-300'
	)}
>
	<table
		bind:this={ref}
		data-slot="table"
		class={cn('w-full caption-bottom border-separate border-spacing-0 text-sm', className)}
		{...restProps}
	>
		{@render children?.()}
	</table>
</div>
