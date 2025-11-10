<script lang="ts">
	import {
		getCoreRowModel,
		getSortedRowModel,
		type ColumnDef,
		type SortingState
	} from '@tanstack/table-core';
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import { makeData, type Person } from '../(data)/make-simple-data';
	import * as Table from '$lib/components/ui/table/index.js';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
	import { onMount } from 'svelte';

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

<div class="list scroll-container" bind:this={virtualListEl}>
	<!-- <div > -->
	<Table.Root style="position: relative; height: {$virtualizer.getTotalSize()}px;">
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
					{#each headerGroup.headers as header (header.id)}
						<Table.Head colspan={header.colSpan} style="width: {header.getSize()}px;">
							{#if !header.isPlaceholder}
								<button
									class:sortable-header={header.column.getCanSort()}
									disabled={!header.column.getCanSort()}
									onclick={header.column.getToggleSortingHandler()}
								>
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
									{#if header.column.getIsSorted()}
										{header.column.getIsSorted() === 'desc' ? ' 🔽' : ' 🔼'}
									{/if}
								</button>
							{/if}
						</Table.Head>
					{/each}
				</Table.Row>
			{/each}
		</Table.Header>
		<Table.Body>
			{@const rows = table.getRowModel().rows}
			{#each $virtualizer.getVirtualItems() as item, idx (item.index)}
				{@const row = rows[item.index]}
				<Table.Row
					style="height: {item.size}px; transform: translateY({item.start - idx * item.size}px);"
				>
					{#each row.getVisibleCells() as cell (cell.id)}
						<Table.Cell>
							<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
						</Table.Cell>
					{/each}
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
	<!-- <table> -->
	<!-- </table> -->
	<!-- </div> -->
</div>

<!-- </main> -->

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

	.scroll-container {
		height: 600px;
		width: 100%;
		overflow: auto;
	}
	.sortable-header {
		cursor: pointer;
		user-select: none;
	}
</style>
