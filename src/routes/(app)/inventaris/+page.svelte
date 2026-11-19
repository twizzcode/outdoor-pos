<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { Archive, MoreHorizontal, Plus, Search, SlidersHorizontal } from '@lucide/svelte';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import * as Card from '#lib/components/ui/card';
	import * as Table from '#lib/components/ui/table';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu';
	import { Badge } from '#lib/components/ui/badge';
	import StatusBadge from '#lib/components/status-badge.svelte';
	import { inventoryProducts, rupiah } from '#lib/inventory/mock-data';

	let search = $state('');
	let category = $state('Semua kategori');
	let status = $state('Semua status');
	let tracking = $state('Semua model');

	const categories = ['Semua kategori', ...new Set(inventoryProducts.map((item) => item.category))];
	const statuses = ['Semua status', 'Tersedia', 'Stok rendah', 'Perawatan', 'Habis'];
	const trackingModes = ['Semua model', 'Jumlah stok', 'Kode unit'];

	const filteredProducts = $derived(
		inventoryProducts.filter((product) => {
			const matchesSearch = `${product.name} ${product.sku}`
				.toLowerCase()
				.includes(search.toLowerCase());
			const matchesCategory = category === 'Semua kategori' || product.category === category;
			const matchesStatus = status === 'Semua status' || product.status === status;
			const matchesTracking =
				tracking === 'Semua model' ||
				(tracking === 'Jumlah stok'
					? product.trackingMode === 'quantity'
					: product.trackingMode === 'unit');
			return matchesSearch && matchesCategory && matchesStatus && matchesTracking;
		})
	);

	function resetFilters() {
		search = '';
		category = 'Semua kategori';
		status = 'Semua status';
		tracking = 'Semua model';
	}

	function productRoute(id: string, edit = false) {
		const path = edit ? `/(app)/inventaris/${id}/edit` : `/(app)/inventaris/${id}`;
		return resolve(path as '/(app)/inventaris/[id]' | '/(app)/inventaris/[id]/edit', { id });
	}
</script>

<svelte:head><title>Inventaris — OutdoorPOS</title></svelte:head>

<div class="space-y-6">
	<section class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p class="mb-1 text-sm text-muted-foreground">Kelola semua barang rental</p>
			<h1 class="text-2xl font-bold tracking-tight md:text-3xl">Inventaris</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				{inventoryProducts.length} produk aktif dengan 126 unit tercatat.
			</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" disabled>
				Ekspor <Badge variant="secondary" class="ml-1">Segera</Badge>
			</Button>
			<Button href={resolve('/(app)/inventaris/tambah')}><Plus />Tambah Barang</Button>
		</div>
	</section>

	<Card.Root>
		<Card.Header class="border-b">
			<div class="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_repeat(3,180px)_auto]">
				<label class="relative">
					<span class="sr-only">Cari barang</span>
					<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input bind:value={search} class="pl-9" placeholder="Cari nama atau SKU..." />
				</label>
				<label>
					<span class="sr-only">Kategori</span>
					<select
						bind:value={category}
						class="h-9 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
					>
						{#each categories as item (item)}<option>{item}</option>{/each}
					</select>
				</label>
				<label>
					<span class="sr-only">Status</span>
					<select
						bind:value={status}
						class="h-9 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
					>
						{#each statuses as item (item)}<option>{item}</option>{/each}
					</select>
				</label>
				<label>
					<span class="sr-only">Model stok</span>
					<select
						bind:value={tracking}
						class="h-9 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
					>
						{#each trackingModes as item (item)}<option>{item}</option>{/each}
					</select>
				</label>
				<Button variant="ghost" onclick={resetFilters}><SlidersHorizontal />Reset</Button>
			</div>
		</Card.Header>

		<Card.Content class="px-0">
			{#if filteredProducts.length}
				<div class="hidden overflow-x-auto md:block">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Barang</Table.Head><Table.Head>Kategori</Table.Head><Table.Head>
									Varian
								</Table.Head><Table.Head>Ketersediaan</Table.Head><Table.Head>
									Harga paket
								</Table.Head><Table.Head>Status</Table.Head><Table.Head class="w-12">
									<span class="sr-only">Aksi</span>
								</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each filteredProducts as product (product.id)}
								{@const available = product.variants.reduce((sum, item) => sum + item.available, 0)}
								{@const stock = product.variants.reduce((sum, item) => sum + item.stock, 0)}
								<Table.Row class="cursor-pointer" onclick={() => goto(productRoute(product.id))}>
									<Table.Cell>
										<div class="flex items-center gap-3">
											<span class="flex size-10 items-center justify-center rounded-xl bg-muted">
												<Archive class="size-5" />
											</span>
											<div>
												<p class="font-medium">{product.name}</p>
												<p class="text-xs text-muted-foreground">{product.sku}</p>
											</div>
										</div>
									</Table.Cell>
									<Table.Cell>{product.category}</Table.Cell>
									<Table.Cell>{product.variants.length} varian</Table.Cell>
									<Table.Cell>
										<p class="font-medium">{available} / {stock}</p>
										<p class="text-xs text-muted-foreground">
											{product.trackingMode === 'unit' ? 'Kode unit' : 'Jumlah stok'}
										</p>
									</Table.Cell>
									<Table.Cell>
										<p class="font-medium">
											{rupiah(Math.min(...product.variants.map((item) => item.packagePrice)))}
										</p>
										<p class="text-xs text-muted-foreground">3 hari 2 malam</p>
									</Table.Cell>
									<Table.Cell><StatusBadge status={product.status} /></Table.Cell>
									<Table.Cell>
										<div onclick={(event) => event.stopPropagation()} role="presentation">
											<DropdownMenu.Root>
												<DropdownMenu.Trigger>
													<Button
														variant="ghost"
														size="icon-sm"
														aria-label={`Aksi ${product.name}`}
													>
														<MoreHorizontal />
													</Button>
												</DropdownMenu.Trigger><DropdownMenu.Content align="end">
													<DropdownMenu.Item onclick={() => goto(productRoute(product.id))}>
														Lihat detail
													</DropdownMenu.Item><DropdownMenu.Item
														onclick={() => goto(productRoute(product.id, true))}
													>
														Edit barang
													</DropdownMenu.Item><DropdownMenu.Separator /><DropdownMenu.Item
														variant="destructive"
													>
														Nonaktifkan
													</DropdownMenu.Item>
												</DropdownMenu.Content>
											</DropdownMenu.Root>
										</div>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>

				<div class="grid gap-3 p-4 md:hidden">
					{#each filteredProducts as product (product.id)}
						{@const available = product.variants.reduce((sum, item) => sum + item.available, 0)}
						{@const stock = product.variants.reduce((sum, item) => sum + item.stock, 0)}
						<a
							href={productRoute(product.id)}
							class="block rounded-xl border p-4 transition-colors hover:bg-muted/40"
						>
							<div class="flex items-start gap-3">
								<span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
									<Archive class="size-5" />
								</span>
								<div class="min-w-0 flex-1">
									<p class="truncate font-medium">{product.name}</p>
									<p class="text-xs text-muted-foreground">{product.sku} · {product.category}</p>
								</div>
								<StatusBadge status={product.status} />
							</div>
							<div class="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
								<div>
									<p class="text-xs text-muted-foreground">Ketersediaan</p>
									<p class="font-medium">{available} / {stock} unit</p>
								</div>
								<div>
									<p class="text-xs text-muted-foreground">Harga paket</p>
									<p class="font-medium">
										{rupiah(Math.min(...product.variants.map((item) => item.packagePrice)))}
									</p>
								</div>
							</div>
						</a>
					{/each}
				</div>
			{:else}
				<div class="flex min-h-80 flex-col items-center justify-center px-4 text-center">
					<span class="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
						<Archive />
					</span>
					<h2 class="font-semibold">Inventaris tidak ditemukan</h2>
					<p class="mt-1 max-w-sm text-sm text-muted-foreground">
						Ubah kata pencarian atau reset filter untuk melihat barang lainnya.
					</p>
					<Button variant="outline" class="mt-4" onclick={resetFilters}>Reset filter</Button>
				</div>
			{/if}
		</Card.Content>
		<Card.Footer class="justify-between border-t text-sm text-muted-foreground">
			<span>Menampilkan {filteredProducts.length} dari {inventoryProducts.length} produk</span>
			<div class="flex gap-1">
				<Button variant="outline" size="sm" disabled>Sebelumnya</Button><Button
					variant="outline"
					size="sm"
					disabled
				>
					Berikutnya
				</Button>
			</div>
		</Card.Footer>
	</Card.Root>
</div>
