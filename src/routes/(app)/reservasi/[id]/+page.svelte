<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		ArrowLeft,
		CalendarDays,
		Check,
		Clock3,
		Edit,
		FileText,
		PackageCheck,
		Phone,
		ShoppingBasket,
		UserRound,
		X
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button';
	import * as Card from '#lib/components/ui/card';
	import * as Dialog from '#lib/components/ui/dialog';
	import * as Table from '#lib/components/ui/table';
	import ReservationStatusBadge from '#lib/components/reservation-status-badge.svelte';
	import { rupiah } from '#lib/inventory/mock-data';
	import { findReservation } from '#lib/reservations/mock-data';
	import { rentalSubtotal } from '#lib/transactions/calculation';

	const original = findReservation(page.params.id ?? '');
	let reservation = $state(original ? structuredClone(original) : undefined);
	let cancelOpen = $state(false);
	let convertOpen = $state(false);
	const subtotal = $derived(
		reservation
			? rentalSubtotal(reservation.items, reservation.startDate, reservation.returnDate)
			: 0
	);

	function confirmReservation() {
		if (!reservation) return;
		reservation.status = 'Dikonfirmasi';
		toast.success('Reservasi dikonfirmasi');
	}

	function prepareItems() {
		if (!reservation) return;
		reservation.status = 'Siap diambil';
		toast.success('Barang ditandai siap diambil');
	}

	function cancelReservation() {
		if (!reservation) return;
		reservation.status = 'Dibatalkan';
		cancelOpen = false;
		toast.success('Reservasi dibatalkan');
	}

	async function convertReservation() {
		if (!reservation) return;
		reservation.status = 'Dikonversi';
		convertOpen = false;
		toast.success('Reservasi dikonversi menjadi transaksi', {
			description: 'Data pelanggan dan barang siap diteruskan ke transaksi.'
		});
		await goto(resolve('/(app)/transaksi/baru'));
	}

	function formatDate(value: string) {
		return new Intl.DateTimeFormat('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(new Date(`${value}T12:00:00`));
	}
</script>

<svelte:head>
	<title>{reservation ? reservation.code : 'Reservasi tidak ditemukan'} — OutdoorPOS</title>
</svelte:head>

{#if reservation}
	<div class="space-y-6">
		<section class="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
			<div class="flex items-start gap-3">
				<Button href={resolve('/(app)/reservasi')} variant="ghost" size="icon" aria-label="Kembali">
					<ArrowLeft />
				</Button>
				<div>
					<div class="mb-2 flex flex-wrap items-center gap-2">
						<h1 class="text-2xl font-bold tracking-tight md:text-3xl">{reservation.code}</h1>
						<ReservationStatusBadge status={reservation.status} />
					</div>
					<p class="text-sm text-muted-foreground">Dibuat {reservation.createdAt}</p>
				</div>
			</div>
			<div class="flex flex-wrap gap-2">
				{#if !['Dikonversi', 'Dibatalkan'].includes(reservation.status)}<Button
						href={resolve('/(app)/reservasi/[id]/edit', { id: reservation.id })}
						variant="outline"
					>
						<Edit />Edit
					</Button>{/if}
				{#if reservation.status === 'Draft'}<Button onclick={confirmReservation}>
						<Check />Konfirmasi
					</Button>{:else if reservation.status === 'Dikonfirmasi'}<Button onclick={prepareItems}>
						<PackageCheck />Siapkan barang
					</Button>{:else if reservation.status === 'Siap diambil'}<Button
						onclick={() => (convertOpen = true)}
					>
						<ShoppingBasket />Buat transaksi
					</Button>{/if}
			</div>
		</section>

		<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each [{ label: 'Pelanggan', value: reservation.customerName, detail: reservation.customerPhone, icon: UserRound }, { label: 'Tanggal mulai', value: formatDate(reservation.startDate), detail: `Ambil pukul ${reservation.pickupTime}`, icon: CalendarDays }, { label: 'Tanggal kembali', value: formatDate(reservation.returnDate), detail: 'Estimasi pengembalian', icon: Clock3 }, { label: 'Estimasi', value: rupiah(subtotal), detail: `Deposit ${rupiah(reservation.deposit)}`, icon: FileText }] as stat (stat.label)}
				<Card.Root class="py-5">
					<Card.Content class="flex items-start justify-between px-5">
						<div class="min-w-0">
							<p class="text-sm text-muted-foreground">{stat.label}</p>
							<p class="mt-2 truncate text-base font-bold">{stat.value}</p>
							<p class="mt-1 truncate text-xs text-muted-foreground">{stat.detail}</p>
						</div>
						<span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
							<stat.icon class="size-5" />
						</span>
					</Card.Content>
				</Card.Root>
			{/each}
		</section>

		<div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
			<Card.Root>
				<Card.Header>
					<Card.Title>Barang dipesan</Card.Title><Card.Description>
						{reservation.items.reduce((total, item) => total + item.quantity, 0)} unit dalam {reservation
							.items.length} jenis barang.
					</Card.Description>
				</Card.Header><Card.Content class="px-0">
					<div class="overflow-x-auto">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Barang</Table.Head><Table.Head>Jumlah</Table.Head><Table.Head>
										Harga paket
									</Table.Head><Table.Head>Subtotal</Table.Head>
								</Table.Row>
							</Table.Header><Table.Body>
								{#each reservation.items as item (item.id)}<Table.Row>
										<Table.Cell>
											<p class="font-medium">{item.productName}</p>
											<p class="text-xs text-muted-foreground">{item.variantName}</p>
										</Table.Cell><Table.Cell>{item.quantity}</Table.Cell><Table.Cell>
											{rupiah(item.packagePrice)}
										</Table.Cell><Table.Cell class="font-medium">
											{rupiah(item.packagePrice * item.quantity)}
										</Table.Cell>
									</Table.Row>{/each}
							</Table.Body>
						</Table.Root>
					</div>
				</Card.Content><Card.Footer class="justify-end border-t">
					<div class="w-full max-w-xs space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Estimasi sewa</span><strong>
								{rupiah(subtotal)}
							</strong>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Deposit</span><strong>
								{rupiah(reservation.deposit)}
							</strong>
						</div>
					</div>
				</Card.Footer>
			</Card.Root>

			<div class="space-y-4">
				<Card.Root>
					<Card.Header><Card.Title>Informasi pelanggan</Card.Title></Card.Header><Card.Content
						class="space-y-3 text-sm"
					>
						<div class="flex gap-3">
							<UserRound class="mt-0.5 size-4 text-muted-foreground" />
							<div>
								<p class="font-medium">{reservation.customerName}</p>
								<p class="text-muted-foreground">ID {reservation.customerId}</p>
							</div>
						</div>
						<div class="flex gap-3">
							<Phone class="mt-0.5 size-4 text-muted-foreground" />
							<p>{reservation.customerPhone}</p>
						</div>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header><Card.Title>Catatan internal</Card.Title></Card.Header><Card.Content>
						<p class="text-sm text-muted-foreground">{reservation.notes || 'Tidak ada catatan.'}</p>
					</Card.Content>
				</Card.Root>
				{#if !['Dikonversi', 'Dibatalkan'].includes(reservation.status)}<Button
						variant="outline"
						class="w-full text-destructive hover:text-destructive"
						onclick={() => (cancelOpen = true)}
					>
						<X />Batalkan reservasi
					</Button>{/if}
			</div>
		</div>
	</div>

	<Dialog.Root bind:open={cancelOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Batalkan reservasi?</Dialog.Title><Dialog.Description>
					Jadwal dan alokasi stok {reservation.code} akan dilepas. Aksi mock ini hanya berlaku selama
					halaman aktif.
				</Dialog.Description>
			</Dialog.Header><Dialog.Footer>
				<Button variant="outline" onclick={() => (cancelOpen = false)}>Kembali</Button><Button
					variant="destructive"
					onclick={cancelReservation}
				>
					Batalkan reservasi
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
	<Dialog.Root bind:open={convertOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Buat transaksi dari reservasi?</Dialog.Title><Dialog.Description>
					Data pelanggan, periode, dan {reservation.items.length} jenis barang akan diteruskan ke transaksi
					baru.
				</Dialog.Description>
			</Dialog.Header><Dialog.Footer>
				<Button variant="outline" onclick={() => (convertOpen = false)}>Kembali</Button><Button
					onclick={convertReservation}
				>
					<ShoppingBasket />Lanjutkan
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<div class="rounded-xl border p-10 text-center">
		<h1 class="text-lg font-semibold">Reservasi tidak ditemukan</h1>
		<p class="mt-1 text-sm text-muted-foreground">ID reservasi tidak tersedia pada data mock.</p>
		<Button href={resolve('/(app)/reservasi')} class="mt-4"><ArrowLeft />Kembali</Button>
	</div>
{/if}
