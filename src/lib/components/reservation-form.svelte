<script lang="ts">
	import { ArrowLeft, Box, Check, Minus, Plus, Search, Trash2, UserRound } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import { Label } from '#lib/components/ui/label';
	import { Textarea } from '#lib/components/ui/textarea';
	import * as Card from '#lib/components/ui/card';
	import { customers } from '#lib/customers/mock-data';
	import { inventoryProducts, rupiah } from '#lib/inventory/mock-data';
	import { availableQuantity } from '#lib/reservations/calculation';
	import { reservations } from '#lib/reservations/mock-data';
	import type { Reservation, ReservationStatus } from '#lib/reservations/types';
	import { rentalSubtotal } from '#lib/transactions/calculation';

	let {
		reservation,
		cancelHref,
		onSave
	}: {
		reservation?: Reservation;
		cancelHref: string;
		onSave: (value: Reservation) => void | Promise<void>;
	} = $props();

	const original = untrack(() => reservation);
	let form = $state<Reservation>(
		original
			? structuredClone(original)
			: {
					id: `res-${Date.now()}`,
					code: `RSV-261119-${String(Date.now()).slice(-3)}`,
					customerId: '',
					customerName: '',
					customerPhone: '',
					startDate: '2026-11-20',
					returnDate: '2026-11-22',
					pickupTime: '08:00',
					status: 'Draft',
					items: [],
					deposit: 100_000,
					notes: '',
					createdAt: '19 Nov 2026, 09.00'
				}
	);
	let search = $state('');
	let category = $state('Semua kategori');
	let error = $state('');
	let submitted = $state(false);
	const statuses: ReservationStatus[] = ['Draft', 'Dikonfirmasi', 'Siap diambil'];
	const categories = [
		'Semua kategori',
		...new Set(inventoryProducts.map((product) => product.category))
	];
	const customer = $derived(customers.find((item) => item.id === form.customerId));
	const filteredProducts = $derived(
		inventoryProducts.filter(
			(product) =>
				`${product.name} ${product.sku}`.toLowerCase().includes(search.toLowerCase()) &&
				(category === 'Semua kategori' || product.category === category)
		)
	);
	const subtotal = $derived(rentalSubtotal(form.items, form.startDate, form.returnDate));

	function available(variantId: string) {
		return availableQuantity(
			variantId,
			form.startDate,
			form.returnDate,
			reservations,
			reservation?.id
		);
	}

	function addVariant(productId: string, variantId: string) {
		const product = inventoryProducts.find((item) => item.id === productId);
		const variant = product?.variants.find((item) => item.id === variantId);
		if (!product || !variant || available(variantId) < 1) return;
		const existing = form.items.find((item) => item.variantId === variantId);
		if (existing) {
			if (existing.quantity < available(variantId)) existing.quantity++;
			return;
		}
		form.items.push({
			id: `reservation-item-${variantId}`,
			productId,
			productName: product.name,
			variantId,
			variantName: variant.name,
			quantity: 1,
			packagePrice: variant.packagePrice,
			extraDailyPrice: variant.extraDailyPrice,
			unitCodes: []
		});
	}

	function changeQuantity(index: number, delta: number) {
		const item = form.items[index];
		if (!item) return;
		item.quantity = Math.max(1, Math.min(available(item.variantId), item.quantity + delta));
	}

	async function save() {
		error = '';
		if (!customer) return (error = 'Pilih pelanggan aktif.');
		if (!form.startDate || !form.returnDate || form.startDate > form.returnDate)
			return (error = 'Periode reservasi tidak valid.');
		if (!form.items.length) return (error = 'Tambahkan minimal satu barang.');
		const unavailable = form.items.find((item) => item.quantity > available(item.variantId));
		if (unavailable)
			return (error = `${unavailable.productName} melebihi stok tersedia pada periode ini.`);
		form.customerName = customer.name;
		form.customerPhone = customer.phone;
		submitted = true;
		await onSave(structuredClone(form));
	}

	function beforeUnload(event: BeforeUnloadEvent) {
		if (!submitted && JSON.stringify(form) !== JSON.stringify(original)) event.preventDefault();
	}
</script>

<svelte:window onbeforeunload={beforeUnload} />

<div class="space-y-5">
	<div
		class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200"
	>
		Ketersediaan dihitung dari stok, reservasi aktif, dan transaksi yang bentrok tanggal. Data tetap
		mock selama frontend belum terhubung backend.
	</div>
	{#if error}<div
			role="alert"
			class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
		>
			{error}
		</div>{/if}

	<div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
		<div class="space-y-5">
			<Card.Root>
				<Card.Header>
					<Card.Title>Pelanggan dan jadwal</Card.Title><Card.Description>
						Tentukan waktu pengambilan dan pengembalian.
					</Card.Description>
				</Card.Header><Card.Content class="grid gap-4 sm:grid-cols-2">
					<div class="sm:col-span-2">
						<Label for="reservation-customer" class="mb-2">Pelanggan</Label><select
							id="reservation-customer"
							bind:value={form.customerId}
							class="h-9 w-full rounded-xl border bg-background px-3 text-sm"
						>
							<option value="" disabled>
								Pilih pelanggan
							</option>{#each customers.filter((item) => item.status === 'Aktif') as item (item.id)}<option
									value={item.id}
								>
									{item.name} · {item.phone}
								</option>{/each}
						</select>
					</div>
					<div>
						<Label for="reservation-start" class="mb-2">Tanggal mulai</Label><Input
							id="reservation-start"
							type="date"
							bind:value={form.startDate}
						/>
					</div>
					<div>
						<Label for="reservation-return" class="mb-2">Tanggal kembali</Label><Input
							id="reservation-return"
							type="date"
							min={form.startDate}
							bind:value={form.returnDate}
						/>
					</div>
					<div>
						<Label for="reservation-time" class="mb-2">Jam pengambilan</Label><Input
							id="reservation-time"
							type="time"
							bind:value={form.pickupTime}
						/>
					</div>
					<div>
						<Label for="reservation-status" class="mb-2">Status</Label><select
							id="reservation-status"
							bind:value={form.status}
							class="h-9 w-full rounded-xl border bg-background px-3 text-sm"
						>
							{#each statuses as status (status)}<option>{status}</option>{/each}
						</select>
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
					<Card.Title>Pilih barang</Card.Title><Card.Description>
						Angka tersedia mengikuti periode reservasi di atas.
					</Card.Description>
					<div class="grid gap-3 pt-3 sm:grid-cols-[1fr_190px]">
						<label class="relative">
							<span class="sr-only">Cari barang</span><Search
								class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
							/><Input bind:value={search} class="pl-9" placeholder="Cari barang atau SKU..." />
						</label><select
							bind:value={category}
							aria-label="Kategori barang"
							class="h-9 rounded-xl border bg-background px-3 text-sm"
						>
							{#each categories as item (item)}<option>{item}</option>{/each}
						</select>
					</div>
				</Card.Header><Card.Content class="grid gap-3 md:grid-cols-2">
					{#each filteredProducts as product (product.id)}<article class="rounded-2xl border p-4">
							<div class="mb-3 flex items-center gap-3">
								<span class="flex size-9 items-center justify-center rounded-xl bg-muted">
									<Box class="size-4" />
								</span>
								<div class="min-w-0">
									<p class="truncate text-sm font-medium">{product.name}</p>
									<p class="text-xs text-muted-foreground">{product.category}</p>
								</div>
							</div>
							<div class="space-y-2">
								{#each product.variants as variant (variant.id)}{@const remaining = available(
										variant.id
									)}<button
										class="flex w-full items-center justify-between rounded-xl bg-muted/50 p-3 text-left hover:bg-muted disabled:opacity-50"
										disabled={remaining < 1}
										onclick={() => addVariant(product.id, variant.id)}
									>
										<span>
											<span class="block text-xs font-medium">{variant.name}</span><span
												class="text-[11px] text-muted-foreground"
											>
												{remaining} tersedia
											</span>
										</span><span class="text-xs font-semibold">{rupiah(variant.packagePrice)}</span>
									</button>{/each}
							</div>
						</article>{/each}
				</Card.Content>
			</Card.Root>
		</div>

		<aside class="space-y-4 xl:sticky xl:top-20 xl:h-fit">
			<Card.Root>
				<Card.Header>
					<Card.Title>Ringkasan reservasi</Card.Title><Card.Description>
						{form.items.length} jenis barang dipilih
					</Card.Description>
				</Card.Header><Card.Content class="space-y-3">
					{#if form.items.length}{#each form.items as item, index (item.id)}<div
								class="rounded-xl border p-3"
							>
								<div class="flex items-start justify-between gap-2">
									<div>
										<p class="text-sm font-medium">{item.productName}</p>
										<p class="text-xs text-muted-foreground">{item.variantName}</p>
									</div>
									<Button
										variant="ghost"
										size="icon-sm"
										aria-label={`Hapus ${item.productName}`}
										onclick={() => form.items.splice(index, 1)}
									>
										<Trash2 />
									</Button>
								</div>
								<div class="mt-3 flex items-center justify-between">
									<div class="flex items-center gap-1">
										<Button
											variant="outline"
											size="icon-sm"
											aria-label="Kurangi jumlah"
											disabled={item.quantity <= 1}
											onclick={() => changeQuantity(index, -1)}
										>
											<Minus />
										</Button><span class="w-8 text-center text-sm">{item.quantity}</span><Button
											variant="outline"
											size="icon-sm"
											aria-label="Tambah jumlah"
											disabled={item.quantity >= available(item.variantId)}
											onclick={() => changeQuantity(index, 1)}
										>
											<Plus />
										</Button>
									</div>
									<span class="text-sm font-medium">
										{rupiah(item.packagePrice * item.quantity)}
									</span>
								</div>
							</div>{/each}{:else}<div
							class="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground"
						>
							Belum ada barang dipilih.
						</div>{/if}
					<div class="space-y-2 border-t pt-4 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Estimasi sewa</span><strong>
								{rupiah(subtotal)}
							</strong>
						</div>
						<div>
							<Label for="reservation-deposit" class="mb-2">Deposit</Label><Input
								id="reservation-deposit"
								type="number"
								min="0"
								bind:value={form.deposit}
							/>
						</div>
						<div>
							<Label for="reservation-notes" class="mb-2">Catatan</Label><Textarea
								id="reservation-notes"
								rows={3}
								bind:value={form.notes}
							/>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
			<div class="grid grid-cols-2 gap-2">
				<Button href={cancelHref} variant="outline"><ArrowLeft />Batal</Button><Button
					onclick={save}
				>
					<Check />{reservation ? 'Simpan' : 'Buat reservasi'}
				</Button>
			</div>
		</aside>
	</div>
</div>
