<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { BarChart, Highlight } from 'layerchart';
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
			}
		}}
		padding={{ left: 20, bottom: 36, right: 20 }}
	>
		{#snippet belowMarks()}
			<Highlight area={{ class: 'fill-muted' }} />
		{/snippet}
		{#snippet tooltip()}
			<Chart.Tooltip />
		{/snippet}
	</BarChart>
</Chart.Container>
