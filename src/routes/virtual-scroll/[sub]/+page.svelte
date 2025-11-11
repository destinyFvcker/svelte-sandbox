<script lang="ts">
	import { error } from '@sveltejs/kit';
	import SimpleVirtualTable from '../(components)/simple-virtual-table.svelte';
	import type { PageProps } from './$types';
	import DynHeightVirtualTable from '../(components)/dyn-height-virtual-table.svelte';
	import SimpleVirtualTableGrid from '../(components)/simple-virtual-table-grid.svelte';
	let { data }: PageProps = $props();
</script>

{#if data.sub == 'simple'}
	<SimpleVirtualTable />
{:else if data.sub == 'dynamic-height'}
	<DynHeightVirtualTable />
{:else if data.sub == 'grid'}
	<SimpleVirtualTableGrid />
{:else}
	{@html error(404, 'Not Found')}
{/if}
