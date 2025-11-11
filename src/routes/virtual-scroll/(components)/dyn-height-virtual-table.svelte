<script lang="ts">
	import {
		createColumnHelper,
		getCoreRowModel,
		getSortedRowModel,
		type ColumnDef,
		type SortingState
	} from '@tanstack/table-core';
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import { makeData, type Person } from '../(data)/make-simple-data';
	import * as Table from '$lib/components/ui/table/index.js';
	import { createSvelteTable, FlexRender, renderSnippet } from '$lib/components/ui/data-table';
	import { Button } from '$lib/components/ui/button/index.js';
	import { untrack } from 'svelte';

	let virtualListEl: HTMLDivElement;
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
		estimateSize: () => 34,
		overscan: 20
	});

	$effect(() => {
		console.log('set option triggered');
		const newLen = data.length;
		untrack(() => {
			$virtualizer.setOptions({
				count: newLen
			});
		});
	});
</script>

<div>collapse: {collapse}</div>

<div class="wrap-anywhere">virtualIndexes: {$virtualizer.getVirtualIndexes()}</div>

<Button
	onclick={() => {
		collapse = !collapse;
	}}
>
	{collapse ? 'Expand More Info' : 'Collapse More Info'}
</Button>

<div class="m-4 max-h-screen w-full overflow-auto rounded-md border p-4" bind:this={virtualListEl}>
	<Table.Root
		style="position: relative; height: {$virtualizer.getTotalSize()}px;"
		class="[display:initial]"
	>
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
					{#each headerGroup.headers as header (header.id)}
						<Table.Head
							colspan={header.colSpan}
							style="width: {header.getSize()}px;"
							class="border"
						>
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
						<Table.Cell class="h-0 border border-gray-200 px-1 py-0">
							<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
						</Table.Cell>
					{/each}
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

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
