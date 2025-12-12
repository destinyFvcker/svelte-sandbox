<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import type { TooltipPayload } from '$lib/components/ui/chart/chart-utils.js';
	import { BarChart, Tooltip } from 'layerchart';
	import { scaleOrdinal, scaleTime } from 'd3-scale';
	import { timeMinute, timeHour, timeDay } from 'd3-time';
	import { getRandomInteger } from '../(data)/utils';

	interface checkStatus {
		timestamp: Date;
		status: 'triggered' | 'warning' | 'release';
		relatedValue: string;
	}

	// 创建测试数据：一天之中的时间戳，均匀分布，每隔几秒钟一个数据点
	const today = timeDay.floor(new Date());
	const statuses: Array<'triggered' | 'warning' | 'release'> = ['triggered', 'warning', 'release'];

	// 数据点数量
	const dataCount = 20;
	// 每个数据点之间的间隔（秒）
	const intervalSeconds = 5;
	// 起始时间（从今天0点开始）
	const startTime = today;

	const data: checkStatus[] = Array.from({ length: dataCount }, (_, i) => {
		// 均匀分布：从起始时间开始，每隔 intervalSeconds 秒生成一个数据点
		const secondsOffset = i * intervalSeconds;
		const timestamp = new Date(startTime.getTime() + secondsOffset * 1000);

		// 随机选择状态
		const status = statuses[getRandomInteger(0, 2)];

		// 生成相关的检查值
		const relatedValue = `Value-${getRandomInteger(100, 999)}`;

		return {
			timestamp,
			status,
			relatedValue
		};
	});
	const chartConfig = {} satisfies Chart.ChartConfig;

	console.log('single-dimension-bar data = ', data);

	/**
	 * 将 Date 对象或时间戳格式化为 HH:MM:SS 字符串。
	 * @param dateValue - Date 对象或时间戳（number）。
	 * @returns 格式化后的时间字符串 (HH:MM:SS)。
	 */
	function formatTime(dateValue: Date | number): string {
		const date = new Date(dateValue);

		// 获取时、分、秒，并确保它们是两位数 (前置补零)
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');

		return `${hours}:${minutes}:${seconds}`;
	}

	/**
	 * 格式化状态显示文本
	 * @param status - 检查状态
	 * @returns 状态的中文显示文本
	 */
	function formatStatus(status: 'triggered' | 'warning' | 'release'): string {
		const statusMap = {
			triggered: '报警状态',
			warning: '预警状态',
			release: '正常状态'
		};
		return statusMap[status] || status;
	}
</script>

<Chart.Container config={chartConfig} class="mx-auto mt-20 h-[70px] w-[200px]">
	<BarChart
		{data}
		x="timestamp"
		y={(d) => 1}
		c="status"
		cScale={scaleOrdinal()}
		cDomain={['triggered', 'warning', 'release']}
		cRange={['var(--color-danger)', 'var(--color-warning)', 'var(--color-success)']}
		axis="x"
		bandPadding={0.1}
		props={{
			bars: { radius: 4, strokeWidth: 0, rounded: 'all' },
			highlight: {
				bar: { radius: 4, stroke: 'var(--foreground)', strokeWidth: 2, fill: 'none' }
			},
			xAxis: {
				// 关闭刻度：返回空数组
				ticks: () => [],
				format: formatTime
			},
			rule: { y: false }
		}}
	>
		{#snippet tooltip({ context })}
			{#snippet customFormatter({ item }: { item: TooltipPayload })}
				{@const data = item.payload as checkStatus}
				{#if data}
					<div class="grid gap-1.5">
						<div class="flex items-center gap-2">
							<div class="size-2.5 rounded-[2px]" style="background-color: {item.color}"></div>
							<span class="text-muted-foreground">状态</span>
							<span class="font-medium text-foreground">
								{formatStatus(data.status)}
							</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="size-2.5"></div>
							<span class="text-muted-foreground">时间</span>
							<span class="font-mono font-medium text-foreground tabular-nums">
								{formatTime(data.timestamp)}
							</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="size-2.5"></div>
							<span class="text-muted-foreground">检查值</span>
							<span class="font-mono font-medium text-foreground tabular-nums">
								{data.relatedValue}
							</span>
						</div>
					</div>
				{/if}
			{/snippet}
			<Chart.Tooltip labelFormatter={(value) => formatTime(value)} formatter={customFormatter} />
		{/snippet}
	</BarChart>
</Chart.Container>
