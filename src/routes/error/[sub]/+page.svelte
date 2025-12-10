<script lang="ts">
	import { error } from '@sveltejs/kit';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const referrerUrl = document.referrer;
	console.log('访问来源:', referrerUrl);
</script>

{#if data.sub == '401'}
	<p>401</p>
{:else if data.sub == '404'}
	<p>404</p>
{:else}
	{@html error(404, 'Not Found')}
{/if}
