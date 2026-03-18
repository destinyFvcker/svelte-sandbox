<script lang="ts">
	import TableShellClient from '$lib/components/custom/table/table-shell-client.svelte';
	import { createColumnHelper } from '@tanstack/table-core';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Trash2 } from 'lucide-svelte';
	import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
	import { cellCenter } from '$lib/components/custom/common/helper-snippet.svelte';
	import DeleteButton from './delete-button.svelte';

	// 测试数据类型
	type TestData = {
		id: number;
		name: string;
		value: number;
		status: string;
	};

	// 生成测试数据
	function generateTestData(count: number): TestData[] {
		return Array.from({ length: count }, (_, i) => ({
			id: i + 1,
			name: `项目 ${i + 1}`,
			value: Math.floor(Math.random() * 1000),
			status: ['活跃', '暂停', '完成'][i % 3]
		}));
	}

	let testData = $state<TestData[]>(generateTestData(1200));

	// 删除数据函数
	function deleteItem(id: number) {
		testData = testData.filter((item) => item.id !== id);
	}

	// 创建列定义
	const columnHelper = createColumnHelper<TestData>();
	const columns = [
		columnHelper.accessor('id', {
			header: () => renderSnippet(cellCenter, { value: 'ID' }),
			cell: (info) => renderSnippet(cellCenter, { value: info.getValue().toString() })
		}),
		columnHelper.accessor('name', {
			header: () => renderSnippet(cellCenter, { value: '名称' }),
			cell: (info) => renderSnippet(cellCenter, { value: info.getValue() })
		}),
		columnHelper.accessor('value', {
			header: () => renderSnippet(cellCenter, { value: '数值' }),
			cell: (info) => renderSnippet(cellCenter, { value: info.getValue().toLocaleString() })
		}),
		columnHelper.accessor('status', {
			header: () => renderSnippet(cellCenter, { value: '状态' }),
			cell: (info) => renderSnippet(cellCenter, { value: info.getValue() })
		}),
		columnHelper.display({
			id: 'delete',
			header: () => renderSnippet(cellCenter, { value: '操作' }),
			cell: ({ row }) =>
				renderComponent(DeleteButton, { id: row.original.id, onDelete: deleteItem })
		})
	];

	// 刷新数据（模拟删除操作）
	function refreshData() {
		// 随机删除一些数据
		const deleteCount = Math.floor(Math.random() * 10) + 5;
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const indicesToDelete = new Set<number>();
		while (indicesToDelete.size < deleteCount && indicesToDelete.size < testData.length) {
			indicesToDelete.add(Math.floor(Math.random() * testData.length));
		}
		testData = testData.filter((_, index) => !indicesToDelete.has(index));
	}

	// 重置数据
	function resetData() {
		testData = generateTestData(250);
	}
</script>

<div class="container mx-auto space-y-4 p-4">
	<h1 class="text-2xl font-bold">测试 Table Shell Client - 删除数据导致排序/分页错乱</h1>

	<div class="space-y-2">
		<div class="flex items-center gap-2">
			<Button onclick={refreshData} variant="outline">
				<Trash2 class="mr-2 size-4" />
				随机删除数据（模拟刷新）
			</Button>
			<Button onclick={resetData} variant="outline">重置数据</Button>
		</div>

		<div class="text-sm text-gray-600">
			<p>当前数据总数: {testData.length}</p>
			<p class="font-semibold text-red-600">
				提示：可以点击表格中每行的"删除"按钮，或者使用"随机删除数据"按钮来复现问题
			</p>
		</div>
	</div>

	<div class="rounded border bg-yellow-50 p-4">
		<h2 class="mb-2 text-lg font-semibold">问题说明：</h2>
		<ol class="mb-4 list-inside list-decimal space-y-1 text-sm text-gray-700">
			<li>启用分页（每页 100 条）</li>
			<li>对某一列进行排序（例如点击"数值"列）</li>
			<li>切换到第 2 页或第 3 页</li>
			<li>删除一些数据（特别是当前页的数据，或使用"随机删除数据"按钮）</li>
			<li>观察分页和排序状态是否错乱</li>
		</ol>
		<div class="mt-4 rounded border border-red-200 bg-red-50 p-3">
			<p class="mb-2 text-sm font-semibold text-red-800">预期问题：</p>
			<ul class="list-inside list-disc space-y-1 text-sm text-red-700">
				<li>删除数据后，当前页可能显示为空或显示错误的数据</li>
				<li>分页器可能显示错误的页码或总页数</li>
				<li>排序状态可能丢失或显示不正确</li>
				<li>如果删除后数据总数少于当前页的起始索引，应该自动跳转到最后一页，但可能没有</li>
			</ul>
		</div>
	</div>

	<TableShellClient data={testData} {columns} height={600} />
</div>
