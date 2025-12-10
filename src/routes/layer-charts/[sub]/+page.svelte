<script lang="ts">
	import type { PageProps } from './$types';
	import DurationCharts from './duration-charts.svelte';
	import OfficialExample from './official-example.svelte';
	import SimpleChart from './simple-chart.svelte';

	let { data }: PageProps = $props();
</script>

{#if data.sub == 'simple'}
	<SimpleChart />
{:else if data.sub == 'test-duration'}
	<DurationCharts />
{:else if data.sub == 'official-example'}
	<OfficialExample />
{:else}
	<h1>Layer Charts - Not Found</h1>
{/if}
