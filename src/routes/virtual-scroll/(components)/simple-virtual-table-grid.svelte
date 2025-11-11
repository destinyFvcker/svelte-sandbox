<script lang="ts">
	import {
		getCoreRowModel,
		getSortedRowModel,
		type ColumnDef,
		type HeaderGroup,
		type SortingState
	} from '@tanstack/table-core';
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import { makeData, type Person } from '../(data)/make-simple-data';
	import * as Table from '$lib/components/ui/table/index.js';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
	import { cn } from '$lib/utils';
	import Icon from '@iconify/svelte';

	let virtualListEl: HTMLDivElement;
	let sorting: SortingState = $state([]);

	const columns: ColumnDef<Person>[] = $state([
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
		estimateSize: () => 34,
		overscan: 20
	});

	$effect(() => {
		$virtualizer.setOptions({
			count: table.getRowModel().rows.length
		});
	});
</script>

<div class="wrap-anywhere">virtualIndexes: {$virtualizer.getVirtualIndexes()}</div>

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
			{#each $virtualizer.getVirtualItems() as item, idx (item.index)}
				{@const row = rows[item.index]}
				<Table.Row
					data-state={row.getIsSelected() && 'selected'}
					class="first:border-t hover:bg-blue-100"
					style="height: {item.size}px; transform: translateY({item.start - idx * item.size}px);"
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
