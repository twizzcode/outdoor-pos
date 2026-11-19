<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import {
		ArrowLeft,
		Box,
		Check,
		Minus,
		Plus,
		Search,
		ShoppingCart,
		Trash2,
		UserRound
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import { Label } from '#lib/components/ui/label';
	import { Textarea } from '#lib/components/ui/textarea';
	import { Badge } from '#lib/components/ui/badge';
	import * as Card from '#lib/components/ui/card';
	import * as Dialog from '#lib/components/ui/dialog';
	import { inventoryProducts, productUnits, rupiah } from '#lib/inventory/mock-data';
	import { rentalCustomers } from '#lib/transactions/mock-data';
	import {
		extraRentalDays,
		rentalDays,
		rentalSubtotal,
		rentalTotal
	} from '#lib/transactions/calculation';
	import type { RentalItem } from '#lib/transactions/types';

	const today = new Date().toISOString().slice(0, 10);
	const defaultReturn = new Date(Date.now() + 2 * 86_400_000).toISOString().slice(0, 10);
	let customerId = $state('');
	let startDate = $state(today);
	let returnDate = $state(defaultReturn);
	let search = $state('');
	let category = $state('Semua kategori');
	let cart = $state<RentalItem[]>([]);
	let discount = $state(0);
	let deposit = $state(100_000);
	let paid = $state(0);
	let paymentMethod = $state('Tunai');
	let notes = $state('');
	let reviewOpen = $state(false);
	let submitted = $state(false);

	const categories = [
		'Semua kategori',
		...new Set(inventoryProducts.map((product) => product.category))
	];
	const customer = $derived(rentalCustomers.find((item) => item.id === customerId));
	const filteredProducts = $derived(
		inventoryProducts.filter(
			(product) =>
				product.status !== 'Habis' &&
				`${product.name} ${product.sku}`.toLowerCase().includes(search.toLowerCase()) &&
				(category === 'Semua kategori' || product.category === category)
		)
	);
	const duration = $derived(rentalDays(startDate, returnDate));
	const extraDays = $derived(extraRentalDays(startDate, returnDate));
	const subtotal = $derived(rentalSubtotal(cart, startDate, returnDate));
	const total = $derived(
		rentalTotal(cart, startDate, returnDate, Number(discount || 0), Number(deposit || 0))
	);
	const remaining = $derived(Math.max(0, total - Number(paid || 0)));

	function addVariant(productId: string, variantId: string) {
		const product = inventoryProducts.find((item) => item.id === productId);
		const variant = product?.variants.find((item) => item.id === variantId);
		if (!product || !variant || variant.available < 1) return;
		const existing = cart.find((item) => item.variantId === variantId);
		if (existing) {
			if (existing.quantity < variant.available) existing.quantity++;
			return;
		}
		const unitCode =
			product.trackingMode === 'unit'
				? productUnits.find((unit) => unit.variantId === variantId && unit.status === 'Tersedia')
						?.code
				: undefined;
		cart.push({
			id: `cart-${variantId}`,
			productId,
			productName: product.name,
			variantId,
			variantName: variant.name,
			quantity: 1,
			packagePrice: variant.packagePrice,
			extraDailyPrice: variant.extraDailyPrice,
			unitCodes: unitCode ? [unitCode] : []
		});
	}

	function changeQuantity(item: RentalItem, delta: number) {
		const available =
			inventoryProducts
				.find((product) => product.id === item.productId)
				?.variants.find((variant) => variant.id === item.variantId)?.available ?? 0;
		item.quantity = Math.max(1, Math.min(available, item.quantity + delta));
	}

	function validate() {
		if (!customer) return toast.error('Pilih pelanggan aktif terlebih dahulu');
		if (duration < 1) return toast.error('Tanggal pengembalian tidak valid');
		if (!cart.length) return toast.error('Tambahkan minimal satu barang');
		reviewOpen = true;
	}

	async function submit() {
		submitted = true;
		reviewOpen = false;
		toast.success('Transaksi berhasil dibuat', {
			description: 'RNT-MOCK-006 · Data frontend sementara.'
		});
		await goto(resolve('/(app)/transaksi/[id]', { id: 'tr1' }));
	}

	function beforeUnload(event: BeforeUnloadEvent) {
		if (!submitted && (customerId || cart.length)) event.preventDefault();
	}
</script>

<svelte:window onbeforeunload={beforeUnload} />
<svelte:head><title>Transaksi Baru — OutdoorPOS</title></svelte:head>

<div class="space-y-5">
	<section class="flex items-start gap-3">
		<Button href={resolve('/(app)/transaksi')} variant="ghost" size="icon" aria-label="Kembali">
			<ArrowLeft />
		</Button>
		<div>
			<h1 class="text-2xl font-bold tracking-tight md:text-3xl">Transaksi baru</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Pilih pelanggan, periode, lalu tambahkan perlengkapan.
			</p>
		</div>
	</section>

	<div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
		<div class="space-y-5">
			<Card.Root>
				<Card.Header>
					<Card.Title>Pelanggan dan periode</Card.Title><Card.Description>
						Paket dasar mencakup 3 hari 2 malam.
					</Card.Description>
				</Card.Header><Card.Content class="grid gap-4 md:grid-cols-3">
					<div>
						<Label for="customer" class="mb-2">Pelanggan</Label><select
							id="customer"
							bind:value={customerId}
							class="h-9 w-full rounded-xl border bg-background px-3 text-sm"
						>
							<option value="" disabled>
								Pilih pelanggan
							</option>{#each rentalCustomers.filter((item) => item.status === 'Aktif') as item (item.id)}<option
									value={item.id}
								>
									{item.name} · {item.phone}
								</option>{/each}
						</select>
					</div>
					<div>
						<Label for="start-date" class="mb-2">Tanggal mulai</Label><Input
							id="start-date"
							type="date"
							bind:value={startDate}
						/>
					</div>
					<div>
						<Label for="return-date" class="mb-2">Tanggal kembali</Label><Input
							id="return-date"
							type="date"
							min={startDate}
							bind:value={returnDate}
						/>
					</div>
				</Card.Content>{#if customer}<Card.Footer class="gap-3 border-t text-sm">
						<span class="flex size-9 items-center justify-center rounded-full bg-muted">
							<UserRound class="size-4" />
						</span>
						<div>
							<p class="font-medium">{customer.name}</p>
							<p class="text-xs text-muted-foreground">{customer.phone} · {customer.address}</p>
						</div>
					</Card.Footer>{/if}
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Katalog barang</Card.Title><Card.Description>
						Harga per paket 3H2M. Ketersediaan memakai data mock saat ini.
					</Card.Description>
					<div class="grid gap-3 pt-3 sm:grid-cols-[1fr_200px]">
						<label class="relative">
							<span class="sr-only">Cari barang</span><Search
								class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
							/><Input bind:value={search} class="pl-9" placeholder="Cari barang atau SKU..." />
						</label><select
							bind:value={category}
							aria-label="Kategori"
							class="h-9 rounded-xl border bg-background px-3 text-sm"
						>
							{#each categories as item (item)}<option>{item}</option>{/each}
						</select>
					</div>
				</Card.Header><Card.Content class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{#each filteredProducts as product (product.id)}
						<article class="flex flex-col rounded-2xl border p-4">
							<div class="flex items-start gap-3">
								<span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
									<Box class="size-5" />
								</span>
								<div class="min-w-0">
									<p class="truncate font-medium">{product.name}</p>
									<p class="text-xs text-muted-foreground">{product.category} · {product.brand}</p>
								</div>
							</div>
							<div class="mt-4 space-y-2">
								{#each product.variants as variant (variant.id)}<button
										class="flex w-full items-center justify-between gap-2 rounded-xl bg-muted/50 p-3 text-left transition-colors hover:bg-muted disabled:opacity-50"
										disabled={variant.available < 1}
										onclick={() => addVariant(product.id, variant.id)}
									>
										<div class="min-w-0">
											<p class="truncate text-xs font-medium">{variant.name}</p>
											<p class="text-[11px] text-muted-foreground">{variant.available} tersedia</p>
										</div>
										<div class="shrink-0 text-right">
											<p class="text-xs font-semibold">{rupiah(variant.packagePrice)}</p>
											<Plus class="mt-1 ml-auto size-3.5" />
										</div>
									</button>{/each}
							</div>
						</article>
					{/each}
				</Card.Content>
			</Card.Root>
		</div>

		<aside class="space-y-4 xl:sticky xl:top-20 xl:h-fit">
			<Card.Root>
				<Card.Header class="flex-row items-center justify-between">
					<div>
						<Card.Title>Keranjang sewa</Card.Title><Card.Description>
							{cart.length} jenis barang
						</Card.Description>
					</div>
					<span class="flex size-10 items-center justify-center rounded-xl bg-muted">
						<ShoppingCart class="size-5" />
					</span>
				</Card.Header><Card.Content class="space-y-3">
					{#if cart.length}
						{#each cart as item, index (item.id)}<div class="rounded-xl border p-3">
								<div class="flex items-start justify-between gap-2">
									<div>
										<p class="text-sm font-medium">{item.productName}</p>
										<p class="text-xs text-muted-foreground">
											{item.variantName}{item.unitCodes.length
												? ` · ${item.unitCodes.join(', ')}`
												: ''}
										</p>
									</div>
									<Button
										variant="ghost"
										size="icon-xs"
										aria-label={`Hapus ${item.productName}`}
										onclick={() => cart.splice(index, 1)}
									>
										<Trash2 />
									</Button>
								</div>
								<div class="mt-3 flex items-center justify-between">
									<div class="flex items-center gap-1">
										<Button
											variant="outline"
											size="icon-xs"
											onclick={() => changeQuantity(item, -1)}
										>
											<Minus />
										</Button><span class="w-8 text-center text-sm font-medium">
											{item.quantity}
										</span><Button
											variant="outline"
											size="icon-xs"
											onclick={() => changeQuantity(item, 1)}
										>
											<Plus />
										</Button>
									</div>
									<p class="text-sm font-semibold">
										{rupiah((item.packagePrice + item.extraDailyPrice * extraDays) * item.quantity)}
									</p>
								</div>
							</div>{/each}
					{:else}<div class="py-10 text-center">
							<ShoppingCart class="mx-auto mb-3 size-8 text-muted-foreground" />
							<p class="text-sm font-medium">Keranjang masih kosong</p>
							<p class="mt-1 text-xs text-muted-foreground">Pilih varian dari katalog.</p>
						</div>{/if}
				</Card.Content><Card.Footer class="block space-y-4 border-t">
					<div class="grid grid-cols-2 gap-3">
						<div>
							<Label for="discount" class="mb-2">Diskon</Label><Input
								id="discount"
								type="number"
								min="0"
								bind:value={discount}
							/>
						</div>
						<div>
							<Label for="deposit" class="mb-2">Deposit</Label><Input
								id="deposit"
								type="number"
								min="0"
								bind:value={deposit}
							/>
						</div>
					</div>
					<div class="space-y-2 border-y py-4 text-sm">
						<div class="flex justify-between text-muted-foreground">
							<span>Durasi</span><span>{duration} hari</span>
						</div>
						<div class="flex justify-between text-muted-foreground">
							<span>Paket 3H2M</span><span>
								{rupiah(cart.reduce((sum, item) => sum + item.packagePrice * item.quantity, 0))}
							</span>
						</div>
						{#if extraDays}<div class="flex justify-between text-muted-foreground">
								<span>Tambahan {extraDays} hari</span><span>
									{rupiah(
										subtotal -
											cart.reduce((sum, item) => sum + item.packagePrice * item.quantity, 0)
									)}
								</span>
							</div>{/if}
						<div class="flex justify-between text-muted-foreground">
							<span>Diskon</span><span>-{rupiah(Number(discount || 0))}</span>
						</div>
						<div class="flex justify-between text-muted-foreground">
							<span>Deposit</span><span>{rupiah(Number(deposit || 0))}</span>
						</div>
						<div class="flex justify-between pt-2 text-base font-bold">
							<span>Total</span><span>{rupiah(total)}</span>
						</div>
					</div>
					<Button class="w-full" size="lg" onclick={validate}>Tinjau transaksi</Button>
				</Card.Footer>
			</Card.Root>
		</aside>
	</div>

	<Dialog.Root bind:open={reviewOpen}>
		<Dialog.Content class="sm:max-w-lg">
			<Dialog.Header>
				<Dialog.Title>Tinjau transaksi</Dialog.Title><Dialog.Description>
					Periksa ringkasan sebelum membuat transaksi mock.
				</Dialog.Description>
			</Dialog.Header>
			<div class="space-y-4">
				<div class="grid grid-cols-2 gap-3 rounded-xl bg-muted p-4 text-sm">
					<div>
						<p class="text-xs text-muted-foreground">Pelanggan</p>
						<p class="mt-1 font-medium">{customer?.name}</p>
					</div>
					<div>
						<p class="text-xs text-muted-foreground">Periode</p>
						<p class="mt-1 font-medium">{startDate} — {returnDate}</p>
					</div>
					<div>
						<p class="text-xs text-muted-foreground">Durasi</p>
						<p class="mt-1 font-medium">{duration} hari · +{extraDays} hari tambahan</p>
					</div>
					<div>
						<p class="text-xs text-muted-foreground">Barang</p>
						<p class="mt-1 font-medium">
							{cart.reduce((sum, item) => sum + item.quantity, 0)} unit
						</p>
					</div>
				</div>
				<div class="space-y-3">
					<div class="grid grid-cols-2 gap-3">
						<div>
							<Label for="payment-method" class="mb-2">Metode pembayaran</Label><select
								id="payment-method"
								bind:value={paymentMethod}
								class="h-9 w-full rounded-xl border bg-background px-3 text-sm"
							>
								<option>Tunai</option><option>Transfer</option><option>QRIS</option>
							</select>
						</div>
						<div>
							<Label for="paid" class="mb-2">Dibayar sekarang</Label><Input
								id="paid"
								type="number"
								min="0"
								max={total}
								bind:value={paid}
							/>
						</div>
					</div>
					<div>
						<Label for="transaction-notes" class="mb-2">Catatan</Label><Textarea
							id="transaction-notes"
							bind:value={notes}
							rows={2}
							placeholder="Catatan pengambilan atau perlengkapan..."
						/>
					</div>
					<div class="flex justify-between rounded-xl border p-4">
						<span>
							<p class="text-xs text-muted-foreground">Sisa pembayaran</p>
							<p class="mt-1 text-lg font-bold">{rupiah(remaining)}</p>
						</span><Badge variant={remaining === 0 ? 'default' : 'outline'}>
							{remaining === 0 ? 'Lunas' : paid > 0 ? 'DP' : 'Belum dibayar'}
						</Badge>
					</div>
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (reviewOpen = false)}>Kembali</Button><Button
					onclick={submit}
				>
					<Check />Buat transaksi
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>
