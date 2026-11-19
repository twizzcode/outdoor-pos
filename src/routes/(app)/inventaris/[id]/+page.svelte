<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import {
		Archive,
		ArrowLeft,
		Box,
		CalendarClock,
		CircleDollarSign,
		ClipboardList,
		Edit3,
		MapPin,
		MoreHorizontal,
		PackageCheck,
		Plus,
		Search,
		Settings2,
		Tag,
		Trash2,
		Wrench
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import { Label } from '#lib/components/ui/label';
	import { Badge } from '#lib/components/ui/badge';
	import * as Card from '#lib/components/ui/card';
	import * as Table from '#lib/components/ui/table';
	import * as Dialog from '#lib/components/ui/dialog';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu';
	import StatusBadge from '#lib/components/status-badge.svelte';
	import {
		findProduct,
		inventoryActivities,
		rupiah,
		unitsForProduct
	} from '#lib/inventory/mock-data';
	import type { ProductUnit } from '#lib/inventory/types';

	const productId = page.params.id ?? '';
	const product = findProduct(productId);
	let variants = $state(product ? structuredClone(product.variants) : []);
	let units = $state<ProductUnit[]>(structuredClone(unitsForProduct(productId)));
	let activeTab = $state<'variants' | 'units' | 'history'>('variants');
	let unitSearch = $state('');
	let adjustmentOpen = $state(false);
	let archiveOpen = $state(false);
	let unitOpen = $state(false);
	let selectedUnit = $state<ProductUnit | null>(null);
	let adjustmentType = $state<'add' | 'remove' | 'correction'>('add');
	let adjustmentVariant = $state(product?.variants[0]?.id ?? '');
	let adjustmentAmount = $state(1);
	let adjustmentReason = $state('Pembelian baru');

	const totalStock = $derived(variants.reduce((sum, variant) => sum + variant.stock, 0));
	const availableStock = $derived(variants.reduce((sum, variant) => sum + variant.available, 0));
	const rentedStock = $derived(Math.max(0, totalStock - availableStock));
	const filteredUnits = $derived(
		units.filter((unit) =>
			`${unit.code} ${unit.variantName} ${unit.location}`
				.toLowerCase()
				.includes(unitSearch.toLowerCase())
		)
	);

	function editRoute() {
		return resolve('/(app)/inventaris/[id]/edit', { id: productId });
	}

	function applyAdjustment() {
		const variant = variants.find((item) => item.id === adjustmentVariant);
		if (!variant || adjustmentAmount < 1 || !adjustmentReason.trim()) {
			toast.error('Lengkapi data penyesuaian stok');
			return;
		}
		const delta = adjustmentType === 'remove' ? -adjustmentAmount : adjustmentAmount;
		if (adjustmentType === 'correction') {
			variant.stock = adjustmentAmount;
			variant.available = Math.min(variant.available, adjustmentAmount);
		} else {
			variant.stock = Math.max(0, variant.stock + delta);
			variant.available = Math.max(0, Math.min(variant.stock, variant.available + delta));
		}
		adjustmentOpen = false;
		toast.success('Stok berhasil disesuaikan', {
			description: `${variant.name} · ${adjustmentReason}`
		});
	}

	function openUnit(unit: ProductUnit) {
		selectedUnit = unit;
		unitOpen = true;
	}

	function saveUnit() {
		if (!selectedUnit) return;
		if (selectedUnit.condition !== 'Baik') selectedUnit.status = 'Perawatan';
		unitOpen = false;
		toast.success('Kondisi unit diperbarui', { description: selectedUnit.code });
	}

	async function archiveProduct() {
		archiveOpen = false;
		toast.success('Produk diarsipkan', { description: product?.name });
		await goto(resolve('/(app)/inventaris'));
	}
</script>

<svelte:head><title>{product?.name ?? 'Produk tidak ditemukan'} — OutdoorPOS</title></svelte:head>

{#if product}
	<div class="space-y-6">
		<section class="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
			<div class="flex min-w-0 items-start gap-3">
				<Button
					href={resolve('/(app)/inventaris')}
					variant="ghost"
					size="icon"
					aria-label="Kembali ke inventaris"
				>
					<ArrowLeft />
				</Button>
				<span class="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-muted">
					<Archive class="size-7" />
				</span>
				<div class="min-w-0">
					<div class="mb-2 flex flex-wrap items-center gap-2">
						<h1 class="truncate text-2xl font-bold tracking-tight md:text-3xl">{product.name}</h1>
						<StatusBadge status={product.status} />
					</div>
					<p class="text-sm text-muted-foreground">
						{product.sku} · {product.category} · {product.brand}
					</p>
				</div>
			</div>
			<div class="flex flex-wrap gap-2">
				<Button variant="outline" onclick={() => (adjustmentOpen = true)}>
					<Settings2 />Sesuaikan stok
				</Button>
				<Button href={editRoute()}><Edit3 />Edit barang</Button>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button variant="outline" size="icon" aria-label="Aksi lainnya">
							<MoreHorizontal />
						</Button>
					</DropdownMenu.Trigger><DropdownMenu.Content align="end">
						<DropdownMenu.Item
							onclick={() => toast.info('Duplikasi produk tersedia pada versi backend')}
						>
							Duplikasi produk
						</DropdownMenu.Item><DropdownMenu.Separator /><DropdownMenu.Item
							variant="destructive"
							onclick={() => (archiveOpen = true)}
						>
							<Trash2 />Arsipkan produk
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</section>

		<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each [{ label: 'Total stok', value: totalStock, detail: `${variants.length} varian`, icon: Box }, { label: 'Tersedia', value: availableStock, detail: `${Math.round((availableStock / Math.max(totalStock, 1)) * 100)}% dari total`, icon: PackageCheck }, { label: 'Tidak tersedia', value: rentedStock, detail: 'Disewa atau perawatan', icon: CalendarClock }, { label: 'Harga mulai', value: rupiah(Math.min(...variants.map((item) => item.packagePrice))), detail: 'Paket 3 hari 2 malam', icon: CircleDollarSign }] as stat (stat.label)}
				<Card.Root class="py-5">
					<Card.Content class="flex items-start justify-between px-5">
						<div>
							<p class="text-sm text-muted-foreground">{stat.label}</p>
							<p class="mt-2 text-2xl font-bold tracking-tight">{stat.value}</p>
							<p class="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
						</div>
						<span class="flex size-10 items-center justify-center rounded-xl bg-muted">
							<stat.icon class="size-5" />
						</span>
					</Card.Content>
				</Card.Root>
			{/each}
		</section>

		<section class="grid gap-4 xl:grid-cols-[1fr_320px]">
			<div class="space-y-4">
				<div class="flex gap-1 overflow-x-auto rounded-full bg-muted p-1">
					{#each [{ id: 'variants', label: 'Varian & harga', icon: Tag }, { id: 'units', label: `Unit (${units.length || totalStock})`, icon: Box }, { id: 'history', label: 'Riwayat', icon: ClipboardList }] as tab (tab.id)}
						<button
							class="flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors {activeTab ===
							tab.id
								? 'bg-background shadow-sm'
								: 'text-muted-foreground hover:text-foreground'}"
							onclick={() => (activeTab = tab.id as typeof activeTab)}
						>
							<tab.icon class="size-4" />{tab.label}
						</button>
					{/each}
				</div>

				{#if activeTab === 'variants'}
					<Card.Root>
						<Card.Header>
							<Card.Title>Varian dan harga sewa</Card.Title><Card.Description>
								Tarif paket dan biaya perpanjangan setiap varian.
							</Card.Description>
						</Card.Header><Card.Content class="px-0">
							<div class="overflow-x-auto">
								<Table.Root>
									<Table.Header>
										<Table.Row>
											<Table.Head>Varian</Table.Head><Table.Head>SKU</Table.Head><Table.Head>
												Stok
											</Table.Head><Table.Head>Harga paket</Table.Head><Table.Head>
												Tambahan/hari
											</Table.Head>
										</Table.Row>
									</Table.Header><Table.Body>
										{#each variants as variant (variant.id)}<Table.Row>
												<Table.Cell class="font-medium">{variant.name}</Table.Cell><Table.Cell
													class="text-muted-foreground"
												>
													{variant.sku}
												</Table.Cell><Table.Cell>
													{variant.available} / {variant.stock}
												</Table.Cell><Table.Cell>
													{rupiah(variant.packagePrice)}
												</Table.Cell><Table.Cell>{rupiah(variant.extraDailyPrice)}</Table.Cell>
											</Table.Row>{/each}
									</Table.Body>
								</Table.Root>
							</div>
						</Card.Content>
					</Card.Root>
				{:else if activeTab === 'units'}
					<Card.Root>
						<Card.Header class="flex-row items-start justify-between">
							<div>
								<Card.Title>
									{product.trackingMode === 'unit' ? 'Daftar kode unit' : 'Stok berdasarkan varian'}
								</Card.Title><Card.Description>
									{product.trackingMode === 'unit'
										? 'Pantau lokasi dan kondisi setiap unit.'
										: 'Produk ini dilacak berdasarkan jumlah stok.'}
								</Card.Description>
							</div>
							{#if product.trackingMode === 'unit'}<Button
									size="sm"
									variant="outline"
									onclick={() => toast.info('Tambah unit melalui penyesuaian stok')}
								>
									<Plus />Unit
								</Button>{/if}
						</Card.Header><Card.Content>
							{#if product.trackingMode === 'unit'}
								<label class="relative mb-4 block">
									<span class="sr-only">Cari kode unit</span><Search
										class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
									/><Input
										bind:value={unitSearch}
										class="pl-9"
										placeholder="Cari kode, varian, atau lokasi..."
									/>
								</label>
								<div class="space-y-2">
									{#each filteredUnits as unit (unit.id)}<button
											class="grid w-full gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/50 sm:grid-cols-[1.2fr_1fr_110px_130px] sm:items-center"
											onclick={() => openUnit(unit)}
										>
											<div>
												<p class="text-sm font-medium">{unit.code}</p>
												<p class="text-xs text-muted-foreground">{unit.variantName}</p>
											</div>
											<span class="flex items-center gap-1 text-xs text-muted-foreground">
												<MapPin class="size-3.5" />{unit.location}
											</span><Badge variant="outline">{unit.condition}</Badge><StatusBadge
												status={unit.status}
											/>
										</button>{/each}
								</div>
							{:else}
								<div class="space-y-3">
									{#each variants as variant (variant.id)}<div
											class="flex items-center justify-between rounded-xl border p-4"
										>
											<div>
												<p class="font-medium">{variant.name}</p>
												<p class="text-xs text-muted-foreground">{variant.sku}</p>
											</div>
											<div class="text-right">
												<p class="font-semibold">{variant.available} tersedia</p>
												<p class="text-xs text-muted-foreground">dari {variant.stock} unit</p>
											</div>
										</div>{/each}
								</div>
							{/if}
						</Card.Content>
					</Card.Root>
				{:else}
					<Card.Root>
						<Card.Header>
							<Card.Title>Riwayat perubahan</Card.Title><Card.Description>
								Aktivitas mock terakhir untuk produk ini.
							</Card.Description>
						</Card.Header><Card.Content>
							<div
								class="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:left-3 before:w-px before:bg-border"
							>
								{#each inventoryActivities as activity (activity.id)}<div
										class="relative flex gap-4"
									>
										<span
											class="z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted ring-4 ring-card"
										>
											<span class="size-2 rounded-full bg-foreground"></span>
										</span>
										<div class="min-w-0 flex-1">
											<div class="flex flex-col justify-between gap-1 sm:flex-row">
												<p class="text-sm font-medium">{activity.title}</p>
												<span class="text-xs text-muted-foreground">{activity.date}</span>
											</div>
											<p class="mt-1 text-xs text-muted-foreground">{activity.detail}</p>
											<p class="mt-1 text-xs">oleh {activity.actor}</p>
										</div>
									</div>{/each}
							</div>
						</Card.Content>
					</Card.Root>
				{/if}
			</div>

			<aside class="space-y-4">
				<Card.Root>
					<Card.Header><Card.Title>Informasi produk</Card.Title></Card.Header><Card.Content
						class="space-y-4 text-sm"
					>
						<div>
							<p class="text-xs text-muted-foreground">Deskripsi</p>
							<p class="mt-1 leading-relaxed">{product.description}</p>
						</div>
						<div class="grid grid-cols-2 gap-4 border-t pt-4">
							<div>
								<p class="text-xs text-muted-foreground">Kategori</p>
								<p class="mt-1 font-medium">{product.category}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground">Merek</p>
								<p class="mt-1 font-medium">{product.brand}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground">Model stok</p>
								<p class="mt-1 font-medium">
									{product.trackingMode === 'unit' ? 'Kode unit' : 'Jumlah'}
								</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground">SKU dasar</p>
								<p class="mt-1 font-medium">{product.sku}</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header><Card.Title>Kondisi singkat</Card.Title></Card.Header><Card.Content
						class="space-y-3"
					>
						<div class="flex items-center justify-between text-sm">
							<span class="flex items-center gap-2 text-muted-foreground">
								<PackageCheck class="size-4" />Baik
							</span><strong>{Math.max(0, totalStock - 2)}</strong>
						</div>
						<div class="flex items-center justify-between text-sm">
							<span class="flex items-center gap-2 text-muted-foreground">
								<Wrench class="size-4" />Perlu pemeriksaan
							</span><strong>1</strong>
						</div>
						<div class="flex items-center justify-between text-sm">
							<span class="flex items-center gap-2 text-muted-foreground">
								<Archive class="size-4" />Rusak
							</span><strong>1</strong>
						</div>
					</Card.Content>
				</Card.Root>
			</aside>
		</section>
	</div>

	<Dialog.Root bind:open={adjustmentOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Penyesuaian stok</Dialog.Title><Dialog.Description>
					Simulasi perubahan stok produk. Perubahan bertahan sampai halaman dimuat ulang.
				</Dialog.Description>
			</Dialog.Header>
			<div class="space-y-4">
				<div>
					<Label for="adjustment-type" class="mb-2">Jenis penyesuaian</Label><select
						id="adjustment-type"
						bind:value={adjustmentType}
						class="h-9 w-full rounded-xl border bg-background px-3 text-sm"
					>
						<option value="add">Tambah stok</option><option value="remove">
							Kurangi stok
						</option><option value="correction">Koreksi jumlah akhir</option>
					</select>
				</div>
				<div>
					<Label for="adjustment-variant" class="mb-2">Varian</Label><select
						id="adjustment-variant"
						bind:value={adjustmentVariant}
						class="h-9 w-full rounded-xl border bg-background px-3 text-sm"
					>
						{#each variants as variant (variant.id)}<option value={variant.id}>
								{variant.name} · {variant.stock} unit
							</option>{/each}
					</select>
				</div>
				<div>
					<Label for="adjustment-amount" class="mb-2">
						{adjustmentType === 'correction' ? 'Jumlah akhir' : 'Jumlah'}
					</Label><Input
						id="adjustment-amount"
						type="number"
						min="1"
						bind:value={adjustmentAmount}
					/>
				</div>
				<div>
					<Label for="adjustment-reason" class="mb-2">Alasan</Label><Input
						id="adjustment-reason"
						bind:value={adjustmentReason}
						placeholder="Contoh: Pembelian baru"
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (adjustmentOpen = false)}>Batal</Button><Button
					onclick={applyAdjustment}
				>
					Simpan penyesuaian
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root bind:open={unitOpen}>
		<Dialog.Content>
			{#if selectedUnit}<Dialog.Header>
					<Dialog.Title>Perbarui kondisi unit</Dialog.Title><Dialog.Description>
						{selectedUnit.code} · {selectedUnit.variantName}
					</Dialog.Description>
				</Dialog.Header>
				<div class="space-y-4">
					<div>
						<Label for="unit-condition" class="mb-2">Kondisi</Label><select
							id="unit-condition"
							bind:value={selectedUnit.condition}
							class="h-9 w-full rounded-xl border bg-background px-3 text-sm"
						>
							<option>Baik</option><option>Perlu pemeriksaan</option><option>Rusak</option>
						</select>
					</div>
					<div>
						<Label for="unit-status" class="mb-2">Status</Label><select
							id="unit-status"
							bind:value={selectedUnit.status}
							class="h-9 w-full rounded-xl border bg-background px-3 text-sm"
						>
							<option>Tersedia</option><option>Disewa</option><option>Dipesan</option><option>
								Perawatan
							</option>
						</select>
					</div>
					<div>
						<Label for="unit-location" class="mb-2">Lokasi</Label><Input
							id="unit-location"
							bind:value={selectedUnit.location}
						/>
					</div>
				</div>
				<Dialog.Footer>
					<Button variant="outline" onclick={() => (unitOpen = false)}>Batal</Button><Button
						onclick={saveUnit}
					>
						Simpan unit
					</Button>
				</Dialog.Footer>{/if}
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root bind:open={archiveOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Arsipkan produk?</Dialog.Title><Dialog.Description>
					{product.name} tidak akan muncul dalam pilihan penyewaan baru. Data riwayat tetap disimpan.
				</Dialog.Description>
			</Dialog.Header>
			<div class="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
				Aksi mock ini hanya mengarahkan kembali ke daftar inventaris.
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (archiveOpen = false)}>Batal</Button><Button
					variant="destructive"
					onclick={archiveProduct}
				>
					Arsipkan produk
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
		<Archive class="mb-4 size-10 text-muted-foreground" />
		<h1 class="text-xl font-semibold">Produk tidak ditemukan</h1>
		<p class="mt-1 text-sm text-muted-foreground">Data produk dengan ID ini tidak tersedia.</p>
		<Button href={resolve('/(app)/inventaris')} class="mt-5">
			<ArrowLeft />Kembali ke inventaris
		</Button>
	</div>
{/if}
