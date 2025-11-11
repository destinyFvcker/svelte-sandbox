<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import {
		createColumnHelper,
		getCoreRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type ColumnDef,
		type HeaderGroup,
		type PaginationState,
		type SortingState
	} from '@tanstack/table-core';
	import { makeData, type Person } from './(data)/make-simple-data';
	import { createSvelteTable, FlexRender, renderSnippet } from '$lib/components/ui/data-table';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Icon from '@iconify/svelte';
	import { cn } from '$lib/utils';

	let sorting: SortingState = $state([]);
	let pagination: PaginationState = $state({ pageIndex: 0, pageSize: 200 });

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
			},
			get pagination() {
				return pagination;
			}
		},
		onSortingChange: (updater) => {
			if (updater instanceof Function) sorting = updater(sorting);
			else sorting = updater;
		},
		onPaginationChange: (updater) => {
			if (updater instanceof Function) pagination = updater(pagination);
			else pagination = updater;
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel() //load client-side pagination code
	});

	let tableContainerRef: HTMLDivElement | null = $state(null);
	let scrollDirection: 'up' | 'down' | null = $state(null); // 追踪滚动方向
	// svelte-ignore state_referenced_locally
	let previousPageIndex = $state(pagination.pageIndex);

	// 防抖函数
	function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		return function (this: any, ...args: Parameters<T>) {
			if (timeoutId) clearTimeout(timeoutId);
			timeoutId = setTimeout(() => func.apply(this, args), delay);
		};
	}

	// 检查是否滚动到底部
	function checkIfScrolledToBottom() {
		if (!tableContainerRef) return;

		const { scrollTop, scrollHeight, clientHeight } = tableContainerRef;
		const threshold = 10; // 距离底部 10px 就触发

		if (scrollTop + clientHeight >= scrollHeight - threshold) {
			console.log('滚动到底部了!', {
				scrollTop,
				scrollHeight,
				clientHeight,
				remaining: scrollHeight - (scrollTop + clientHeight)
			});
			// 进行分页操作
			scrollDirection = 'down'; // 记录滚动方向
			table.setPagination({
				pageIndex: pagination.pageIndex + 1,
				pageSize: pagination.pageSize
			});
		}
	}

	// 检查是否滚动到顶部
	function checkIfScrolledToTop() {
		if (!tableContainerRef) return;

		const { scrollTop } = tableContainerRef;
		const threshold = 10; // 距离顶部 10px 就触发

		if (scrollTop <= threshold && pagination.pageIndex > 0) {
			console.log('滚动到顶部了!', {
				scrollTop,
				currentPage: pagination.pageIndex
			});
			// 进行分页操作 - 返回上一页
			scrollDirection = 'up'; // 记录滚动方向
			table.setPagination({
				pageIndex: pagination.pageIndex - 1,
				pageSize: pagination.pageSize
			});
		}
	}

	// 监听分页变化,调整滚动位置
	$effect(() => {
		if (pagination.pageIndex !== previousPageIndex && tableContainerRef) {
			// 使用 setTimeout 确保 DOM 已更新
			setTimeout(() => {
				if (!tableContainerRef) return;

				if (scrollDirection === 'down') {
					// 向下翻页,滚动到顶部
					tableContainerRef.scrollTop = 0;
					console.log('已重置到顶部');
				} else if (scrollDirection === 'up') {
					// 向上翻页,滚动到底部
					tableContainerRef.scrollTop = tableContainerRef.scrollHeight;
					console.log('已重置到底部');
				}

				// 重置滚动方向
				scrollDirection = null;
			}, 50);

			previousPageIndex = pagination.pageIndex;
		}
	});

	// 综合滚动处理函数
	function handleScroll() {
		checkIfScrolledToBottom();
		checkIfScrolledToTop();
	}

	// 防抖处理的滚动监听器
	const debouncedScrollHandler = debounce(handleScroll, 200);

	// 添加和移除事件监听器
	$effect(() => {
		if (tableContainerRef) {
			tableContainerRef.addEventListener('scroll', debouncedScrollHandler);
			console.log('滚动监听器已添加');

			return () => {
				if (tableContainerRef) {
					tableContainerRef.removeEventListener('scroll', debouncedScrollHandler);
					console.log('滚动监听器已移除');
				}
			};
		}
	});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>使用滚动事件监听是否滑动到底部，假如滑动到了底部则立即进行分页</Card.Title>
		<Card.Description>
			使用滚动事件监听是否滑动到底部，假如滑动到了底部则立即进行分页
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="space-y-1 *:border-b-2">
			<div>pagin param: {JSON.stringify(pagination, null, 2)}</div>
		</div>
		<Button
			onclick={() => {
				collapse = !collapse;
			}}
		>
			{collapse ? 'Expand More Info' : 'Collapse More Info'}
		</Button>
		<Table.Root
			class="relative w-fit max-w-full rounded-md border p-2"
			data-overflow
			bind:containerRef={tableContainerRef}
		>
			<Table.Header class="sticky top-0 z-10">
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					{@render renderHeader(headerGroup)}
				{/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row, idx (row.id)}
					<Table.Row
						data-state={row.getIsSelected() && 'selected'}
						data-idx={row.id}
						class="first:border-t hover:bg-blue-100"
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
	</Card.Content>
</Card.Root>

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
