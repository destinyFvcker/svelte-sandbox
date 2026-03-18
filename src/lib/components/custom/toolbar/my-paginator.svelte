<script lang="ts">
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { PaginParam } from '$lib';
	import { cn, type ClassValue } from 'tailwind-variants';

	let {
		paginParam = $bindable(),
		totalCnt,
		pageSize,
		onValueChange = () => {},
		class: ClassName
	}: {
		paginParam: PaginParam;
		totalCnt: number;
		pageSize: number;
		onValueChange?: (newValue: PaginParam) => void;
		class?: ClassValue | null;
	} = $props();

	// 分页页号绑定
	function getPage() {
		return paginParam.pageIndex;
	}
	function setPage(newPage: number) {
		paginParam.pageIndex = newPage;
		paginIndexInput = paginParam.pageIndex.toString();
		onValueChange(paginParam);
	}
	// 分页大小绑定
	function getPaginSize() {
		return paginParam.pageSize.toString();
	}
	function setPaginSize(newValue: string) {
		let newSize = Number.parseInt(newValue);
		paginParam.pageSize = newSize;
		onValueChange(paginParam);
	}
	// 页面输入框
	let paginIndexInput = $state(paginParam.pageIndex.toString());
</script>

<div class={cn('relative', ClassName)}>
	<div class="flex flex-wrap items-center justify-center gap-2">
		<Select.Root type="single" bind:value={getPaginSize, setPaginSize}>
			<Select.Trigger class="h-8! w-fit cursor-pointer transition hover:scale-105"
				>{paginParam.pageSize}</Select.Trigger
			>
			<Select.Content>
				<Select.Item value="100">100</Select.Item>
				<Select.Item value="150">150</Select.Item>
				<Select.Item value="200">200</Select.Item>
				<!-- <Select.Item value="250">250</Select.Item>
				<Select.Item value="300">300</Select.Item>
				<Select.Item value="500">500</Select.Item>
				<Select.Item value="800">800</Select.Item>
				<Select.Item value="1000">1000</Select.Item> -->
			</Select.Content>
		</Select.Root>

		<div class="max-w-full overflow-x-auto">
			<Pagination.Root
				bind:page={getPage, setPage}
				count={totalCnt}
				perPage={pageSize}
				siblingCount={2}
			>
				{#snippet children({ pages, currentPage })}
					<!-- {@html console.log('pages:', pages, 'currentPage:', currentPage)} -->
					<Pagination.Content class="whitespace-nowrap">
						<Pagination.Item>
							<Pagination.PrevButton />
						</Pagination.Item>
						{#each pages as page}
							{#if page.type === 'ellipsis'}
								<Pagination.Item>
									<Pagination.Ellipsis />
								</Pagination.Item>
							{:else}
								<!-- {@html console.log('currentPage:', currentPage, 'page.value:', page.value)} -->
								<Pagination.Item>
									<Pagination.Link {page} isActive={currentPage === page.value}>
										{page.value}
									</Pagination.Link>
								</Pagination.Item>
							{/if}
						{/each}
						<Pagination.Item>
							<Pagination.NextButton />
						</Pagination.Item>
					</Pagination.Content>
				{/snippet}
			</Pagination.Root>
		</div>
		<Input
			type="number"
			bind:value={paginIndexInput}
			class="w-16 px-0! text-center"
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					paginParam.pageIndex =
						Number.parseInt(paginIndexInput) > 0 ? Number.parseInt(paginIndexInput) : 1;
				}
			}}
			onblur={() => {
				paginIndexInput = paginParam.pageIndex.toString();
			}}
		/>
	</div>
</div>
