<script lang="ts">
	import { applyLanes, BarChart, Tooltip, Highlight } from 'layerchart';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { testDurationData } from '../(data)/test-duration-data';

	function formatYear(number: number): string {
		return Math.sign(number) === -1 ? Math.abs(number) + ' BC' : number + ' AD';
	}
	const chartConfig = {} satisfies Chart.ChartConfig;
</script>

<Chart.Container config={chartConfig} class="max-h-[400px]">
	<BarChart
		data={applyLanes(testDurationData)}
		x={['start', 'end']}
		y="lane"
		c="region"
		cRange={[
			// 'var(--chart-1)',
			// 'var(--chart-2)',
			// 'var(--chart-3)',
			'var(--color-danger)',
			'var(--color-warning)',
			'var(--color-success)',
			'var(--chart-4)',
			'var(--chart-5)'
		]}
		rule={false}
		axis="x"
		orientation="horizontal"
		padding={{ left: 20, bottom: 36, right: 20 }}
		grid={{ y: true, bandAlign: 'between' }}
		props={{
			xAxis: {
				format: formatYear
			},
			yAxis: {
				tickLabelProps: {
					width: 300,
					truncate: { position: 'middle' }
				}
			},
			bars: {
				// stroke: 'none',
				radius: 5,
				// insets: {
				// 	left: 24
				// },
				rounded: 'all'
				// initialWidth: 0,
				// initialX: 0,
				// motion: {
				// 	x: { type: 'tween', duration: 500, easing: cubicInOut },
				// 	width: { type: 'tween', duration: 500, easing: cubicInOut }
				// }
			}
		}}
	>
		{#snippet belowMarks()}
			<Highlight area={{ class: 'fill-muted' }} />
		{/snippet}
		<!-- {#snippet tooltip()}
			<Chart.Tooltip />
		{/snippet} -->
		{#snippet tooltip({ context })}
			<Tooltip.Root {context}>
				{#snippet children({ data })}
					<Tooltip.Header>{data.civilization}</Tooltip.Header>
					<Tooltip.List>
						<Tooltip.Item label="region" value={data.region} />
						<Tooltip.Item label="timeline" value={data.timeline} />
						<Tooltip.Item label="start" value={data.start} format={formatYear} />
						<Tooltip.Item label="end" value={data.end} format={formatYear} />
					</Tooltip.List>
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</BarChart>
</Chart.Container>

<!-- <BarChart data={dateSeriesData} x="date" y="value" xInterval={timeDay} {renderContext} {debug} /> -->
