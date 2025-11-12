<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import {
		createColumnHelper,
		getCoreRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type ColumnDef,
		type ColumnOrderState,
		type ColumnPinningState,
		type HeaderGroup,
		type PaginationState,
		type SortingState
	} from '@tanstack/table-core';
	import { makeData, type Person } from './(data)/make-many-col-data';
	import { createSvelteTable, FlexRender, renderSnippet } from '$lib/components/ui/data-table';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Icon from '@iconify/svelte';
	import { cn } from '$lib/utils';

	let sorting: SortingState = $state([]);
	let pagination: PaginationState = $state({ pageIndex: 0, pageSize: 50 });
	let columnOrder: ColumnOrderState = $state([]);
	let columnPinning: ColumnPinningState = $state({});

	const columnHelper = createColumnHelper<Person>();
	let collapse = $state(true);

	const columns: ColumnDef<Person>[] = $derived([
		columnHelper.group({
			id: 'basic-info',
			header: 'Basic Info',
			columns: [
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
				}
			]
		}),
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
		}),
		columnHelper.group({
			id: 'contact-work-info',
			header: 'Contact & Work Info',
			columns: [
				{
					accessorKey: 'email',
					header: 'Email'
				},
				{
					accessorKey: 'address',
					header: 'Address'
				},
				{
					accessorKey: 'phone',
					header: 'Phone'
				},
				{
					accessorKey: 'company',
					header: 'Company'
				},
				{
					accessorKey: 'department',
					header: 'Department'
				},
				{
					accessorKey: 'city',
					header: 'City'
				},
				{
					accessorKey: 'startDate',
					header: 'Start Date'
				},
				{
					accessorKey: 'salary',
					header: 'Salary'
				},
				{
					accessorKey: 'manager',
					header: 'Manager'
				},
				{
					accessorKey: 'notes',
					header: 'Notes'
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
			},
			get columnOrder() {
				return columnOrder;
			},
			get columnPinning() {
				return columnPinning;
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
		onColumnOrderChange: (updater) => {
			if (updater instanceof Function) columnOrder = updater(columnOrder);
			else columnOrder = updater;
		},
		onColumnPinningChange: (updater) => {
			if (updater instanceof Function) columnPinning = updater(columnPinning);
			else columnPinning = updater;
		},
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel() //load client-side pagination code
	});

	let tableContainerRef: HTMLDivElement | null = $state(null);
	let scrollDirection: 'up' | 'down' | null = $state(null); // 追踪滚动方向
	// svelte-ignore state_referenced_locally
	let previousPageIndex = $state(pagination.pageIndex);
	let scrollTop = $state(0); // 追踪 scrollTop 的响应式变量

	const BUFFER_ROW_HEIGHT = 100; // 缓冲行高度(固定)

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
		const threshold = 20; // 距离顶部 10px 就触发

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
					// 向下翻页,滚动位置设为刚好隐藏顶部缓冲行
					tableContainerRef.scrollTop = BUFFER_ROW_HEIGHT + 10;
					console.log('已重置到顶部(隐藏缓冲行), scrollTop:', tableContainerRef.scrollTop);
				} else if (scrollDirection === 'up') {
					// 向上翻页,滚动位置设为刚好隐藏底部缓冲行
					const maxScroll = tableContainerRef.scrollHeight - tableContainerRef.clientHeight;
					tableContainerRef.scrollTop = maxScroll - BUFFER_ROW_HEIGHT - 10;
					console.log('已重置到底部(隐藏缓冲行), scrollTop:', tableContainerRef.scrollTop);
				}

				// 重置滚动方向
				scrollDirection = null;
			}, 50);

			previousPageIndex = pagination.pageIndex;
		}
	});

	// 综合滚动处理函数
	function handleScroll() {
		if (tableContainerRef) {
			scrollTop = tableContainerRef.scrollTop; // 更新响应式变量
		}
		checkIfScrolledToBottom();
		checkIfScrolledToTop();
	}

	// 防抖处理的滚动监听器
	const debouncedScrollHandler = debounce(handleScroll, 500);

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
		<div class="space-y-1 pb-5 *:border-b-2">
			<div>pagin param: {JSON.stringify(pagination, null, 2)}</div>
			<div>scrollTop: {scrollTop}</div>
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
				<!-- 顶部缓冲行 - 始终存在 -->
				{#if pagination.pageIndex > 0}
					<Table.Row class="bg-blue-100" style="height: {BUFFER_ROW_HEIGHT}px;">
						<Table.Cell colspan={table.getAllLeafColumns().length} class="text-center">
							<div class="flex items-center justify-center gap-2 py-4">
								<Icon icon="mdi:arrow-up" width="24" height="24" class="text-blue-600" />
								<span class="font-semibold text-blue-600">继续向上滑动返回上一页</span>
							</div>
						</Table.Cell>
					</Table.Row>
				{/if}
				{#each table.getRowModel().rows as row, idx (row.id)}
					<Table.Row
						data-state={row.getIsSelected() && 'selected'}
						data-idx={row.id}
						class="first:border-t hover:bg-blue-100"
					>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell
								class={cn(
									'h-0 border-r border-b border-gray-200 px-1 py-0 first:sticky first:left-0 first:border-l first:bg-white',
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

				<!-- 底部缓冲行 - 始终存在 -->
				<Table.Row class="bg-green-100" style="height: {BUFFER_ROW_HEIGHT}px;">
					<Table.Cell colspan={table.getAllLeafColumns().length} class="text-center">
						<div class="flex items-center justify-center gap-2 py-4">
							<span class="font-semibold text-green-600">继续向下滑动进入下一页</span>
							<Icon icon="mdi:arrow-down" width="24" height="24" class="text-green-600" />
						</div>
					</Table.Cell>
				</Table.Row>
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
				class={cn('border-t border-l')}
			>
				<!-- first:sticky first:left-0 first:bg-gray-300 -->
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
				{#if !header.isPlaceholder && header.column.getCanPin()}
					<div class="flex justify-center gap-1">
						{#if header.column.getIsPinned() !== 'left'}
							<button
								class="rounded border px-2"
								onclick={() => {
									header.column.pin('left');
								}}
							>
								{'<='}
							</button>
						{/if}
						{#if header.column.getIsPinned()}
							<button
								class="rounded border px-2"
								onclick={() => {
									header.column.pin(false);
								}}
							>
								X
							</button>
						{/if}
						{#if header.column.getIsPinned() !== 'right'}
							<button
								class="rounded border px-2"
								onclick={() => {
									header.column.pin('right');
								}}
							>
								{'=>'}
							</button>
						{/if}
					</div>
				{/if}
			</Table.Head>
		{/each}
	</Table.Row>
{/snippet}
