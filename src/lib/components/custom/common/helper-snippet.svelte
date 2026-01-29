<script lang="ts" module>
	import { cn } from '$lib/utils';
	import { ArrowDown, ArrowUp, Check, Equal, X } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { buttonVariants } from '$lib/components/ui/button';

	export {
		cellWichSignColor,
		cellCenter,
		coloredCenter,
		cellRight,
		cellLeft,
		cellCenterWithTip,
		cellNestedWithTip,
		cellRenderNull,
		permissionIndicator,
		zeroIgnoreIntCell,
		zeroIgnoreFloatCell,
		zeroIgnoreFloatCellRoundN,
		floatNumCell,
		intNumCell,
		cellLongText
	};
</script>

{#snippet zeroIgnoreIntCell(value: number)}
	<div class={cn('text-right font-mono', value == 0 ? 'bg-gray-100 text-gray-300' : '')}>
		{value.toLocaleString('en-US')}
	</div>
{/snippet}

{#snippet zeroIgnoreFloatCell(value: number)}
	<div class={cn('text-right font-mono', value == 0 ? 'bg-gray-100 text-gray-300' : '')}>
		{value.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})}
	</div>
{/snippet}

{#snippet zeroIgnoreFloatCellRoundN(param: { value: number; round: number })}
	<div class={cn('text-right font-mono', param.value == 0 ? 'bg-gray-100 text-gray-300' : '')}>
		{param.value.toLocaleString('en-US', {
			minimumFractionDigits: param.round,
			maximumFractionDigits: param.round
		})}
	</div>
{/snippet}

{#snippet floatNumCell(value: number)}
	<div class="text-right font-mono">
		{value.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})}
	</div>
{/snippet}

{#snippet intNumCell(value: number)}
	<div class="text-right font-mono">{value.toLocaleString('en-US')}</div>
{/snippet}

{#snippet cellCenter(param: { value: string })}
	<div class="flex justify-center">
		<div class="text-center">{param.value}</div>
	</div>
{/snippet}

{#snippet cellLongText(param: { text: string; maxLength: number })}
	<Dialog.Root>
		<Dialog.Trigger
			class={cn(buttonVariants({ variant: 'link' }), 'h-6 px-1 py-0.5 text-sm font-normal')}
		>
			{#if param.text.length > param.maxLength}
				{param.text.slice(0, param.maxLength)}...
			{:else}
				{param.text}
			{/if}
		</Dialog.Trigger>
		<Dialog.Content class="sm:max-w-[425px]">
			<div class="max-w-xs text-center font-mono wrap-anywhere">
				{param.text}
			</div>
		</Dialog.Content>
	</Dialog.Root>
{/snippet}

{#snippet coloredCenter(param: { text: string; colorClass: string })}
	<div class="flex justify-center">
		<div class={`text-center font-mono ${param.colorClass}`}>{param.text}</div>
	</div>
{/snippet}

{#snippet cellCenterWithTip(value: { head: string; tip: string })}
	<Tooltip.Provider delayDuration={200} disableHoverableContent={true}>
		<Tooltip.Root>
			<Tooltip.Trigger class="flex w-fit justify-center">
				<div class="text-center underline decoration-dashed underline-offset-4">{value.head}</div>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>{value.tip}</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
{/snippet}

{#snippet cellNestedWithTip<T>(comps: {
	value: T;
	subSnippet: (value: T) => ReturnType<import('svelte').Snippet>;
	tip: string;
})}
	<Tooltip.Provider delayDuration={200} disableHoverableContent={true}>
		<Tooltip.Root>
			<Tooltip.Trigger class="flex w-fit justify-center">
				{@render comps.subSnippet(comps.value)}
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>{comps.tip}</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
{/snippet}

{#snippet cellRight(value: string)}
	<div class="text-right font-mono">{value}</div>
{/snippet}

{#snippet cellLeft(value: string)}
	<div class="text-left font-mono">{value}</div>
{/snippet}

{#snippet cellRenderNull<T = string>(comps: {
	value: T | undefined;
	subSnippet: (value: T) => ReturnType<import('svelte').Snippet>;
})}
	{#if comps.value != null}
		{@render comps.subSnippet(comps.value)}
	{:else}
		<div class="flex justify-center bg-gray-100 text-gray-400">
			<div class="text-center">{'-'}</div>
		</div>
	{/if}
{/snippet}

{#snippet cellWichSignColor(value: number)}
	<div
		class={cn(
			'flex justify-end gap-1',
			value > 0 ? 'text-red-600' : value == 0 ? 'text-gray-600' : 'text-green-600'
		)}
	>
		<span class="font-mono">{value.toFixed(2)} </span>
		{#if value > 0}
			<ArrowUp class="h-5 w-5" />
		{:else if value < 0}
			<ArrowDown class="h-5 w-5" />
		{:else}
			<Equal class="h-5 w-5" />
		{/if}
	</div>
{/snippet}

{#snippet permissionIndicator(havePermission: boolean)}
	<div class="flex items-center justify-center">
		{#if havePermission}
			<Check class="h-6 w-6 text-green-600" />
		{:else}
			<X class="h-6 w-6 text-red-600" />
		{/if}
	</div>
{/snippet}
