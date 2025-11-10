<script lang="ts">
	import { error } from '@sveltejs/kit';
	import SimpleVirtualTable from '../(components)/simple-virtual-table.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

{#if data.sub == 'simple'}
	<SimpleVirtualTable />
{:else}
	{@html error(404, 'Not Found')}
{/if}
