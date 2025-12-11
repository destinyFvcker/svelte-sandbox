<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { BarChart, Highlight, Tooltip } from 'layerchart';
	import { alternatingAlarmDataList } from '../(data)/test-alarm-duration-data';
	import { scaleTime } from 'd3-scale';
	const chartConfig = {
		// trigger: {
		// 	label: '报警状态',
		// 	color: 'var(--color-danger)'
		// },
		// warning: {
		// 	label: '预警状态',
		// 	color: 'var(--color-warning)'
		// },
		// release: {
		// 	label: '正常状态',
		// 	color: 'var(--color-success)'
		// }
	} satisfies Chart.ChartConfig;

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
	 * @param status - 报警状态
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

	/**
	 * 计算持续时间并格式化为可读字符串
	 * @param start - 开始时间
	 * @param end - 结束时间
	 * @returns 格式化的持续时间字符串
	 */
	function formatDuration(start: Date, end: Date): string {
		const durationMs = end.getTime() - start.getTime();
		const seconds = Math.floor(durationMs / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);

		if (hours > 0) {
			return `${hours}小时${minutes % 60}分钟`;
		} else if (minutes > 0) {
			return `${minutes}分钟${seconds % 60}秒`;
		} else {
			return `${seconds}秒`;
		}
	}
</script>

<Chart.Container config={chartConfig} class="max-h-[400px] pl-3">
	<BarChart
		data={alternatingAlarmDataList}
		x={['start', 'end']}
		xScale={scaleTime()}
		y="category"
		xBaseline={undefined}
		xNice={false}
		c="status"
		cRange={['var(--color-success)', 'var(--color-danger)', 'var(--color-warning)']}
		grid={{ y: true, bandAlign: 'between' }}
		orientation="horizontal"
		props={{
			xAxis: {
				format: formatTime
			},
			bars: {
				radius: 0,
				stroke: 'none'
			},
			tooltip: {
				context: { mode: 'bounds' }
			}
		}}
		padding={{ left: 20, bottom: 36, right: 20 }}
	>
		{#snippet belowMarks()}
			<Highlight area={{ class: 'fill-muted' }} />
		{/snippet}
		{#snippet tooltip({ context })}
			<Tooltip.Root>
				{#snippet children({ data })}
					<Tooltip.Header>{data.category}</Tooltip.Header>
					<Tooltip.List>
						<Tooltip.Item label="状态" value={formatStatus(data.status)} />
						<Tooltip.Item label="开始时间" value={data.start} format={formatTime} />
						<Tooltip.Item label="结束时间" value={data.end} format={formatTime} />
						<Tooltip.Item label="持续时间" value={formatDuration(data.start, data.end)} />
					</Tooltip.List>
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</BarChart>
</Chart.Container>
