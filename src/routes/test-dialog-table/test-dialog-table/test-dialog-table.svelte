<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import TableShellClient from '$lib/components/custom/table/table-shell-client.svelte';
	import { createColumnHelper } from '@tanstack/table-core';
	import { renderSnippet } from '$lib/components/ui/data-table';
	import { cellCenter } from '$lib/components/custom/common/helper-snippet.svelte';

	// 测试数据类型
	type TestData = {
		id: number;
		name: string;
		value: number;
		date: string;
	};

	// 创建测试数据
	const testData: TestData[] = Array.from({ length: 20 }, (_, i) => ({
		id: i + 1,
		name: `项目 ${i + 1}`,
		value: Math.floor(Math.random() * 1000),
		date: new Date(2024, 0, i + 1).toLocaleDateString('zh-CN')
	}));

	// 创建列定义
	const columnHelper = createColumnHelper<TestData>();

	const tableColumns = [
		columnHelper.accessor('id', {
			header: () => renderSnippet(cellCenter, { value: 'ID' }),
			cell: (props) => renderSnippet(cellCenter, { value: props.getValue().toString() })
		}),
		columnHelper.accessor('name', {
			header: () => renderSnippet(cellCenter, { value: '名称' }),
			cell: (props) => renderSnippet(cellCenter, { value: props.getValue() })
		}),
		columnHelper.accessor('value', {
			header: () => renderSnippet(cellCenter, { value: '数值' }),
			cell: (props) => renderSnippet(cellCenter, { value: props.getValue().toString() })
		}),
		columnHelper.accessor('date', {
			header: () => renderSnippet(cellCenter, { value: '日期' }),
			cell: (props) => renderSnippet(cellCenter, { value: props.getValue() })
		})
	];

	// Dialog 打开状态
	let dialogOpen = $state(false);

	console.log('[test-dialog-table] Component created, testData length:', testData.length);
</script>

<div class="p-8">
	<h1 class="text-2xl font-bold mb-4">Dialog 中表格数据为空问题复现</h1>
	<p class="text-muted-foreground mb-4">
		点击按钮打开 Dialog，Dialog 中的表格应该显示 20 条测试数据，但可能会显示为空。
	</p>

	<Dialog.Root bind:open={dialogOpen}>
		<Dialog.Trigger>
			<Button>打开 Dialog 查看表格</Button>
		</Dialog.Trigger>
		<Dialog.Content class="max-w-4xl max-h-[80vh]">
			<Dialog.Header>
				<Dialog.Title>测试表格数据</Dialog.Title>
				<Dialog.Description>
					这个表格应该显示 {testData.length} 条数据。如果显示为空，说明存在延迟挂载的问题。
				</Dialog.Description>
			</Dialog.Header>
			<div class="mt-4">
				<div class="mb-2 text-sm text-muted-foreground">
					数据长度: {testData.length} | Dialog 打开状态: {dialogOpen}
				</div>
				<TableShellClient
					data={testData}
					columns={tableColumns}
					initSortParam={{ id: 'id', desc: false }}
				/>
			</div>
		</Dialog.Content>
	</Dialog.Root>

	<div class="mt-8 p-4 bg-muted rounded-lg">
		<h2 class="text-lg font-semibold mb-2">问题描述</h2>
		<ul class="list-disc list-inside space-y-1 text-sm">
			<li>Dialog 中的内容在初始时不会渲染到 DOM</li>
			<li>当 Dialog 打开时，TableShellClient 才被挂载</li>
			<li>此时即使数据存在，表格也可能显示为空</li>
			<li>这是因为 createSvelteTable 的响应式追踪在延迟挂载时可能没有正确建立</li>
		</ul>
	</div>
</div>
