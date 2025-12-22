<script lang="ts">
	import { resource } from 'runed';

	// const stream = resource(
	// 	() => streamId,
	// 	async (id, _, { signal, onCleanup }) => {
	// 		const eventSource = new EventSource(`/api/stream/${id}`);
	// 		onCleanup(() => eventSource.close());

	// 		const res = await fetch(`/api/stream/${id}/init`, { signal });
	// 		return res.json();
	// 	}
	// );
</script>
