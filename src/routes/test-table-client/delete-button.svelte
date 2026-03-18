<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';

	let { id, onDelete }: { id: number; onDelete: (id: number) => void } = $props();
</script>

<Button variant="destructive" size="sm" onclick={() => onDelete(id)}>
	删除
</Button>
