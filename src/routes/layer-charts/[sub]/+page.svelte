<script lang="ts">
	import type { PageProps } from './$types';
	import DurationCharts from './duration-charts1.svelte';
	import DurationCharts2 from './duration-charts2.svelte';
	import DurationCharts3 from './duration-charts3.svelte';
	import OfficialExample from './official-example.svelte';
	import SimpleChart from './simple-chart.svelte';
	import SingleDimensionBar from './single-dimension-bar.svelte';

	let { data }: PageProps = $props();
</script>

{#if data.sub == 'simple'}
	<SimpleChart />
{:else if data.sub == 'test-duration1'}
	<DurationCharts />
{:else if data.sub == 'official-example'}
	<OfficialExample />
{:else if data.sub == 'test-duration2'}
	<DurationCharts2 />
{:else if data.sub == 'test-duration3'}
	<DurationCharts3 />
{:else if data.sub == 'single-dimension-bar'}
	<SingleDimensionBar />
{:else}
	<h1>Layer Charts - Not Found</h1>
{/if}
