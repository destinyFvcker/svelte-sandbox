<script lang="ts">
	import {
		createColumnHelper,
		getCoreRowModel,
		getSortedRowModel,
		type ColumnDef,
		type HeaderGroup,
		type SortingState
	} from '@tanstack/table-core';
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import { makeData, type Person } from '../(data)/make-simple-data';
	import * as Table from '$lib/components/ui/table/index.js';
	import { createSvelteTable, FlexRender, renderSnippet } from '$lib/components/ui/data-table';
	import { Button } from '$lib/components/ui/button/index.js';
	import { onMount, untrack } from 'svelte';
	import { cn } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import { command } from '$app/server';

	let virtualListEl: HTMLDivElement;
	let virtualItemEls: HTMLTableRowElement[] = $state([]);
	let sorting: SortingState = $state([]);

	const columnHelper = createColumnHelper<Person>();
	let collapse = $state(true);

	const columns: ColumnDef<Person>[] = $derived([
		{
			accessorKey: 'id',
			header: 'ID',
			size: 60
		},
		{
			accessorKey: 'firstName',
			header: 'First Name',
			cell: (info) => info.getValue()
		},
		{
			accessorFn: (row) => row.lastName,
			id: 'lastName',
			header: 'Last Name',
			cell: (info) => info.getValue()
		},
		{
			accessorKey: 'age',
			header: 'Age',
			size: 50
		},
		{
			accessorKey: 'visits',
			header: 'Visits',
			size: 50
		},
		columnHelper.group({
			id: 'more-info',
			header: 'More Info',
			columns: collapse
				? [
						columnHelper.display({
							id: 'collapsed-1',
							header: 'ssss',
							cell: (props) =>
								renderSnippet(multiLineCell, {
									status: props.row.original.status,
									progress: props.row.original.progress,
									createdAt: props.row.original.createdAt
								})
						})
					]
				: [
						{
							accessorKey: 'status',
							header: 'Status'
						},
						{
							accessorKey: 'progress',
							header: 'Profile Progress',
							size: 80
						},
						{
							accessorKey: 'createdAt',
							header: 'Created At',
							cell: (info) => info.getValue<Date>().toLocaleString()
						}
					]
		})
	]);

	let data: Person[] = $state.raw(makeData(50_000));
	const table = createSvelteTable({
		get data() {
			return data;
		},
		get columns() {
			return columns;
		},
		state: {
			get sorting() {
				return sorting;
			}
		},
		onSortingChange: (updater) => {
			if (updater instanceof Function) sorting = updater(sorting);
			else sorting = updater;
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel()
	});

	let virtualizer = createVirtualizer<HTMLDivElement, HTMLTableRowElement>({
		// svelte-ignore state_referenced_locally
		count: data.length,
		getScrollElement: () => virtualListEl,
		estimateSize: () => 65,
		// svelte-ignore state_referenced_locally
		overscan: Math.min(data.length / 8, 100),
		debug: true
	});

	$effect(() => {
		collapse;
		if (virtualItemEls.length > 0)
			untrack(() => {
				$virtualizer.measure();
				virtualItemEls.forEach((el) => $virtualizer.measureElement(el));
			});
	});

	$effect(() => {
		const newLen = data.length;
		untrack(() => {
			// $virtualizer.scrollToOffset(0);
			$virtualizer._willUpdate();
			virtualItemEls.forEach((el) => $virtualizer.measureElement(el));
		});
	});
</script>

<div class="mb-4 space-y-2">
	<div>{$virtualizer.getTotalSize()}</div>
	<div>data length: {data.length}</div>
	<div class="h-[100px] overflow-auto wrap-anywhere">
		virtualIndexes len: {$virtualizer.getVirtualItems().length}
		virtualIndexes: {$virtualizer.getVirtualIndexes()}
	</div>
	<div class="h-[100px] overflow-auto">
		virtualizer options: {JSON.stringify($virtualizer.options)}
	</div>
</div>

<Button
	onclick={() => {
		collapse = !collapse;
	}}
>
	{collapse ? 'Expand More Info' : 'Collapse More Info'}
</Button>

<Button
	onclick={() => {
		data = makeData(1000);
	}}
>
	set shorter data
</Button>

<Button
	onclick={() => {
		data = makeData(50_000);
	}}
>
	set long data
</Button>

<div
	class={cn(
		'relative scrollbar-thin flex max-h-screen w-fit max-w-full overflow-auto rounded-md border p-2 scrollbar-corner-sky-500 scrollbar-thumb-slate-700 scrollbar-track-slate-300'
	)}
	bind:this={virtualListEl}
>
	<Table.Root
		style="height: {$virtualizer.getVirtualItems().length == 0
			? $virtualizer.getTotalSize() + 95 + 96
			: $virtualizer.getTotalSize() + 95}px;"
		class="[display:initial] text-xs!"
	>
		<Table.Header class="sticky top-0 z-10">
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				{@render renderHeader(headerGroup)}
			{/each}
		</Table.Header>
		<Table.Body>
			{@const rows = table.getRowModel().rows}
			{@const firstItem = $virtualizer.getVirtualItems()[0]}
			{#each $virtualizer.getVirtualItems() as item, idx (item.index)}
				{@const row = rows[item.index]}
				<Table.Row
					data-state={row.getIsSelected() && 'selected'}
					data-index={item.index}
					data-idx={idx}
					data-item-start={item.start}
					data-item-size={item.size}
					class="first:border-t hover:bg-blue-100"
					style="transform: translateY({firstItem.start}px);"
					bind:ref={virtualItemEls[idx]}
				>
					{#each row.getVisibleCells() as cell (cell.id)}
						<Table.Cell
							class={cn(
								'h-0 border-r border-b border-gray-200 px-1 py-0 first:border-l',
								idx === 0 ? 'border-t' : ''
							)}
						>
							<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
						</Table.Cell>
					{/each}
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell class="h-24 text-center sticky left-0">
						<span class="font-bold flex gap-2">
							<Icon icon="fluent-color:warning-16" width="16" height="16" />
							No results.
						</span>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

{#snippet renderHeader(headerGroup: HeaderGroup<Person>)}
	<Table.Row class="bg-gray-300">
		{#each headerGroup.headers as header (header.id)}
			<Table.Head
				colspan={header.colSpan}
				style="width: {header.getSize()}px;"
				class="border-t border-l last:border-r"
			>
				{#if !header.isPlaceholder}
					<button
						class:sortable-header={header.column.getCanSort()}
						disabled={!header.column.getCanSort()}
						onclick={header.column.getToggleSortingHandler()}
					>
						<FlexRender content={header.column.columnDef.header} context={header.getContext()} />
						{#if header.column.getIsSorted()}
							{header.column.getIsSorted() === 'desc' ? ' 🔽' : ' 🔼'}
						{/if}
					</button>
				{/if}
			</Table.Head>
		{/each}
	</Table.Row>
{/snippet}

{#snippet multiLineCell(param: {
	status: 'relationship' | 'complicated' | 'single';
	progress: number;
	createdAt: Date;
})}
	<div class="flex flex-col gap-2">
		<span>Status: {param.status}</span>
		<span>Progress: {param.progress}%</span>
		<span>Created At: {param.createdAt.toLocaleDateString()}</span>
	</div>
{/snippet}

<style>
	button {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		font: inherit;
		color: inherit;
		cursor: pointer;
		outline: inherit;
	}

	.sortable-header {
		cursor: pointer;
		user-select: none;
	}
</style>
