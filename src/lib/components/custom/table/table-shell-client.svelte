<!-- 客户端排序 + 分页 + 筛选表格 -->
<script lang="ts" generics="TData">
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import {
		getCoreRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type ColumnDef,
		type ColumnSort,
		type PaginationState,
		type SortingState
	} from '@tanstack/table-core';
	import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-svelte';
	import { type ClassValue } from 'tailwind-variants';
	import { cn } from '$lib/utils';
	import type { PaginParam } from '$lib';
	import MyPaginator from '../toolbar/my-paginator.svelte';

	let {
		data,
		columns,
		paginator = false,
		height,
		initSortParam,
		class: ClassName
	}: {
		data: TData[];
		columns: ColumnDef<TData, any>[];
		paginator?: boolean;
		height?: number | null;
		initSortParam?: ColumnSort;
		class?: ClassValue | null;
	} = $props();

	const tableStatus: {
		sorting: SortingState;
		pagination: PaginationState;
	} = $state({
		sorting: initSortParam ? [initSortParam] : [],
		pagination: {
			pageIndex: 1,
			pageSize: paginator ? 100 : Number.MAX_SAFE_INTEGER
		}
	});

	// 使用 $derived 确保响应式追踪正确建立，特别是在延迟挂载的场景下（如 Dialog）
	// 这确保了即使在组件延迟挂载时，响应式系统也能正确追踪到数据变化
	const reactiveData = $derived(data);
	const reactiveColumns = $derived(columns);

	let table = createSvelteTable({
		get data() {
			return reactiveData;
		},
		get columns() {
			return reactiveColumns;
		},
		state: {
			get sorting() {
				return tableStatus.sorting;
			},
			get pagination() {
				return tableStatus.pagination;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				tableStatus.sorting = updater(tableStatus.sorting);
			} else {
				tableStatus.sorting = updater;
			}
		},
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				tableStatus.pagination = updater(tableStatus.pagination);
			} else {
				tableStatus.pagination = updater;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel()
	});

	// 确保在组件挂载后，特别是在延迟挂载的场景下（如 Dialog），强制触发一次更新
	// 这解决了 Dialog 中表格数据为空的问题
	$effect(() => {
		// 访问 reactiveData 和 reactiveColumns 以确保响应式追踪建立
		// 当数据或列发生变化时，这个 effect 会运行，确保表格正确更新
		if (reactiveData.length > 0 && reactiveColumns.length > 0) {
			// 通过访问 getRowModel 来确保表格内部状态正确更新
			table.getRowModel();
		}
	});

	// 使用 $derived 包装行数据，确保在延迟挂载时响应式追踪正确建立
	const tableRows = $derived(table.getRowModel().rows);

	let paginParam: PaginParam = $state({
		page: 1,
		page_size: paginator ? 100 : Number.MAX_SAFE_INTEGER
	});
</script>

<!-- <div>pagin param: {JSON.stringify(paginParam)}</div>
<div>table pagin param: {table.getPageOptions()}</div> -->

<div class={cn('w-full space-y-2', ClassName)}>
	{#if paginator}
		<MyPaginator
			bind:paginParam
			totalCnt={data.length}
			pageSize={paginParam.page_size}
			onValueChange={(param) => {
				table.setPagination({
					pageIndex: param.page - 1,
					pageSize: param.page_size
				});
			}}
		/>
	{/if}
	<Table.Root
		style="max-width: 100vw; scrollbar-width: thin; max-height: {height ? height + 'px' : '150vh'};"
		class="relative rounded-md border p-1"
	>
		<!-- scrollable={true} -->
		<Table.Header class="sticky top-0 z-10">
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row class="bg-slate-100 text-sm! hover:bg-slate-100">
					{#each headerGroup.headers as header (header.id)}
						<Table.Head colspan={header.colSpan} class="h-0! space-y-1 border px-1! py-1">
							<button
								class="group flex w-full cursor-pointer items-center justify-center gap-1 rounded-sm px-0 transition select-none hover:bg-slate-500 hover:text-white"
								onclick={header.column.getToggleSortingHandler()}
								disabled={!header.column.getCanSort()}
							>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
								{#if header.column.getIsSorted().toString() === 'asc'}
									<ArrowUpNarrowWide class="size-4 text-blue-700 group-hover:text-white" />
								{:else if header.column.getIsSorted().toString() === 'desc'}
									<ArrowDownWideNarrow class="size-4 text-blue-700 group-hover:text-white" />
								{/if}
							</button>
						</Table.Head>
					{/each}
				</Table.Row>
			{/each}
		</Table.Header>
		<Table.Body class="text-sm!">
			{#each tableRows as row (row.id)}
				<Table.Row class="even:bg-gray-50" data-state={row.getIsSelected() && 'selected'}>
					{#each row.getVisibleCells() as cell (cell.id)}
						<Table.Cell class="h-0 border px-1 py-0">
							<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
						</Table.Cell>
					{/each}
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
