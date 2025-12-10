<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { AreaChart, BarChart, type ChartContextValue } from 'layerchart';
	import { scaleBand, scaleUtc } from 'd3-scale';
	import { curveNatural } from 'd3-shape';
	import { cubicInOut } from 'svelte/easing';

	const chartData1 = [
		{ month: 'January', desktop: 186, mobile: 80 },
		{ month: 'February', desktop: 305, mobile: 200 },
		{ month: 'March', desktop: 237, mobile: 120 },
		{ month: 'April', desktop: 73, mobile: 190 },
		{ month: 'May', desktop: 209, mobile: 130 },
		{ month: 'June', desktop: 214, mobile: 140 }
	];
	const chartConfig1 = {
		desktop: {
			label: 'Desktop',
			color: 'var(--chart-1)'
		},
		mobile: {
			label: 'Mobile',
			color: 'var(--chart-2)'
		}
	} satisfies Chart.ChartConfig;
	let context = $state<ChartContextValue>();

	const chartData2 = [
		{ date: new Date('2024-01-01'), desktop: 186 },
		{ date: new Date('2024-02-01'), desktop: 305 },
		{ date: new Date('2024-03-01'), desktop: 237 },
		{ date: new Date('2024-04-01'), desktop: 73 },
		{ date: new Date('2024-05-01'), desktop: 209 },
		{ date: new Date('2024-06-01'), desktop: 214 }
	];
	const chartConfig2 = {
		desktop: { label: 'Desktop', color: 'var(--chart-1)' }
	} satisfies Chart.ChartConfig;
</script>

<p>你们知道吗？</p>

<Chart.Container config={chartConfig1} class="min-h-[200px] w-full">
	<BarChart
		bind:context
		data={chartData1}
		xScale={scaleBand().padding(0.25)}
		x="month"
		axis="x"
		series={[
			{
				key: 'desktop',
				label: chartConfig1.desktop.label,
				color: chartConfig1.desktop.color
			},
			{
				key: 'mobile',
				label: chartConfig1.mobile.label,
				color: chartConfig1.mobile.color
			}
		]}
		x1Scale={scaleBand().paddingInner(0.2)}
		seriesLayout="group"
		rule={false}
		props={{
			bars: {
				stroke: 'none',
				strokeWidth: 0,
				rounded: 'all',
				// use the height of the chart to animate the bars
				initialY: context?.height,
				initialHeight: 0,
				motion: {
					y: { type: 'tween', duration: 500, easing: cubicInOut },
					height: { type: 'tween', duration: 500, easing: cubicInOut }
				}
			},
			highlight: { area: { fill: 'none' } },
			xAxis: { format: (d) => d.slice(0, 3) }
		}}
	>
		{#snippet tooltip()}
			<Chart.Tooltip indicator="dashed" />
		{/snippet}
	</BarChart>
</Chart.Container>

<Chart.Container config={chartConfig2}>
	<AreaChart
		data={chartData2}
		x="date"
		xScale={scaleUtc()}
		series={[
			{
				key: 'desktop',
				label: 'Desktop',
				color: chartConfig2.desktop.color
			}
		]}
		axis="x"
		props={{
			area: {
				curve: curveNatural,
				'fill-opacity': 0.4,
				line: { class: 'stroke-1' },
				motion: 'tween'
			},
			xAxis: {
				format: (v: Date) => v.toLocaleDateString('en-US', { month: 'short' })
			}
		}}
	>
		{#snippet tooltip()}
			<Chart.Tooltip
				labelFormatter={(v: Date) => v.toLocaleDateString('en-US', { month: 'long' })}
				indicator="line"
			/>
		{/snippet}
	</AreaChart>
</Chart.Container>
