<script lang="ts">
	import { applyLanes, BarChart, Tooltip } from 'layerchart';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { scaleTime } from 'd3-scale';
	import { testDurationData } from '../(data)/test-duration-data';

	function formatYear(number: number): string {
		return Math.sign(number) === -1 ? Math.abs(number) + ' BC' : number + ' AD';
	}
	const chartConfig = {
		desktop: {
			label: 'Desktop',
			color: '#2563eb'
		},
		mobile: {
			label: 'Mobile',
			color: '#60a5fa'
		}
	} satisfies Chart.ChartConfig;

	// let renderContext: 'svg' | 'canvas' = $state('svg');
</script>

<Chart.Container config={chartConfig} class="min-h-[200px] w-full">
	<!-- <div class="h-[500px] rounded-sm border p-4"> -->
	<BarChart
		data={applyLanes(testDurationData)}
		x={['start', 'end']}
		y="lane"
		c="region"
		cRange={[
			'var(--color-danger)',
			'var(--color-warning)',
			'var(--color-success)',
			'var(--color-info)',
			'var(--color-primary)',
			'var(--color-secondary)',
			'var(--color-accent)'
		]}
		rule={false}
		axis="x"
		orientation="horizontal"
		padding={{ left: 20, bottom: 36, right: 20 }}
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
			tooltip: { context: { mode: 'bounds' } }
		}}
	>
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
