<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import {
		ArrowLeft,
		Banknote,
		CalendarDays,
		Check,
		CircleUserRound,
		Clock3,
		FileText,
		PackageCheck,
		Printer
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button';
	import { Badge } from '#lib/components/ui/badge';
	import * as Card from '#lib/components/ui/card';
	import * as Table from '#lib/components/ui/table';
	import TransactionStatusBadge from '#lib/components/transaction-status-badge.svelte';
	import { rupiah } from '#lib/inventory/mock-data';
	import { findTransaction } from '#lib/transactions/mock-data';
	import {
		extraRentalDays,
		rentalDays,
		rentalSubtotal,
		rentalTotal
	} from '#lib/transactions/calculation';

	const transaction = findTransaction(page.params.id ?? '');
	const duration = transaction ? rentalDays(transaction.startDate, transaction.returnDate) : 0;
	const extraDays = transaction
		? extraRentalDays(transaction.startDate, transaction.returnDate)
		: 0;
	const subtotal = transaction
		? rentalSubtotal(transaction.items, transaction.startDate, transaction.returnDate)
		: 0;
	const total = transaction
		? rentalTotal(
				transaction.items,
				transaction.startDate,
				transaction.returnDate,
				transaction.discount,
				transaction.deposit
			)
		: 0;
	const remaining = transaction ? Math.max(0, total - transaction.paid) : 0;

	const timeline = transaction
		? [
				{ label: 'Transaksi dibuat', detail: transaction.createdAt, done: true },
				{
					label: 'Pembayaran dicatat',
					detail: `${transaction.paymentStatus} · ${transaction.paymentMethod}`,
					done: transaction.paid > 0
				},
				{
					label: 'Barang disiapkan',
					detail:
						transaction.status === 'Reservasi'
							? 'Menunggu diproses'
							: 'Inventaris sudah dialokasikan',
					done: !['Draft', 'Reservasi'].includes(transaction.status)
				},
				{
					label: 'Barang diserahkan',
					detail: ['Sedang disewa', 'Terlambat', 'Selesai'].includes(transaction.status)
						? transaction.startDate
						: 'Belum diserahkan',
					done: ['Sedang disewa', 'Terlambat', 'Selesai'].includes(transaction.status)
				},
				{
					label: 'Pengembalian',
					detail:
						transaction.status === 'Selesai'
							? transaction.returnDate
							: `Rencana ${transaction.returnDate}`,
					done: transaction.status === 'Selesai'
				}
			]
		: [];

	function printReceipt() {
		toast.success('Nota siap dicetak', {
			description: 'Gunakan dialog print browser untuk menyimpan PDF.'
		});
		window.print();
	}
</script>

<svelte:head>
	<title>{transaction?.code ?? 'Transaksi tidak ditemukan'} — OutdoorPOS</title>
</svelte:head>

{#if transaction}
	<div class="space-y-6 print:bg-white print:text-black">
		<section class="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
			<div class="flex items-start gap-3">
				<Button
					href={resolve('/(app)/transaksi')}
					variant="ghost"
					size="icon"
					aria-label="Kembali"
					class="print:hidden"
				>
					<ArrowLeft />
				</Button>
				<div>
					<div class="mb-2 flex flex-wrap items-center gap-2">
						<h1 class="text-2xl font-bold tracking-tight md:text-3xl">{transaction.code}</h1>
						<TransactionStatusBadge status={transaction.status} />
					</div>
					<p class="text-sm text-muted-foreground">
						Dibuat {transaction.createdAt} oleh Admin OutdoorPOS
					</p>
				</div>
			</div>
			<div class="flex flex-wrap gap-2 print:hidden">
				<Button
					variant="outline"
					onclick={() => toast.info('Status transaksi diperbarui secara mock')}
				>
					<PackageCheck />Ubah status
				</Button><Button onclick={printReceipt}><Printer />Cetak nota</Button>
			</div>
		</section>

		<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each [{ label: 'Pelanggan', value: transaction.customerName, detail: transaction.customerPhone, icon: CircleUserRound }, { label: 'Periode sewa', value: `${duration} hari`, detail: `${transaction.startDate} — ${transaction.returnDate}`, icon: CalendarDays }, { label: 'Total transaksi', value: rupiah(total), detail: `Termasuk deposit ${rupiah(transaction.deposit)}`, icon: Banknote }, { label: 'Sisa pembayaran', value: rupiah(remaining), detail: transaction.paymentStatus, icon: Clock3 }] as stat (stat.label)}<Card.Root
					class="py-5"
				>
					<Card.Content class="flex items-start justify-between px-5">
						<div class="min-w-0">
							<p class="text-sm text-muted-foreground">{stat.label}</p>
							<p class="mt-2 truncate text-xl font-bold">{stat.value}</p>
							<p class="mt-1 truncate text-xs text-muted-foreground">{stat.detail}</p>
						</div>
						<span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
							<stat.icon class="size-5" />
						</span>
					</Card.Content>
				</Card.Root>{/each}
		</section>

		<section class="grid gap-4 xl:grid-cols-[1fr_340px]">
			<div class="space-y-4">
				<Card.Root>
					<Card.Header>
						<Card.Title>Barang disewa</Card.Title><Card.Description>
							{transaction.items.reduce((sum, item) => sum + item.quantity, 0)} unit dalam transaksi ini.
						</Card.Description>
					</Card.Header><Card.Content class="px-0">
						<div class="overflow-x-auto">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Barang</Table.Head><Table.Head>Unit/kode</Table.Head><Table.Head>
											Jumlah
										</Table.Head><Table.Head>Harga paket</Table.Head><Table.Head>
											Tambahan
										</Table.Head><Table.Head>Total</Table.Head>
									</Table.Row>
								</Table.Header><Table.Body>
									{#each transaction.items as item (item.id)}<Table.Row>
											<Table.Cell>
												<p class="font-medium">{item.productName}</p>
												<p class="text-xs text-muted-foreground">{item.variantName}</p>
											</Table.Cell><Table.Cell class="text-xs text-muted-foreground">
												{item.unitCodes.join(', ') || 'Stok jumlah'}
											</Table.Cell><Table.Cell>{item.quantity}</Table.Cell><Table.Cell>
												{rupiah(item.packagePrice)}
											</Table.Cell><Table.Cell>
												{extraDays ? `${extraDays} × ${rupiah(item.extraDailyPrice)}` : '-'}
											</Table.Cell><Table.Cell class="font-medium">
												{rupiah(
													(item.packagePrice + item.extraDailyPrice * extraDays) * item.quantity
												)}
											</Table.Cell>
										</Table.Row>{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header><Card.Title>Catatan transaksi</Card.Title></Card.Header><Card.Content>
						<p class="text-sm leading-relaxed text-muted-foreground">
							{transaction.notes ?? 'Tidak ada catatan tambahan untuk transaksi ini.'}
						</p>
					</Card.Content>
				</Card.Root>
			</div>

			<aside class="space-y-4">
				<Card.Root>
					<Card.Header><Card.Title>Ringkasan pembayaran</Card.Title></Card.Header><Card.Content
						class="space-y-3 text-sm"
					>
						<div class="flex justify-between text-muted-foreground">
							<span>Subtotal sewa</span><span>{rupiah(subtotal)}</span>
						</div>
						{#if extraDays}<div class="flex justify-between text-muted-foreground">
								<span>Tambahan durasi</span><Badge variant="outline">{extraDays} hari</Badge>
							</div>{/if}
						<div class="flex justify-between text-muted-foreground">
							<span>Diskon</span><span>-{rupiah(transaction.discount)}</span>
						</div>
						<div class="flex justify-between text-muted-foreground">
							<span>Deposit</span><span>{rupiah(transaction.deposit)}</span>
						</div>
						<div class="flex justify-between border-t pt-3 text-base font-bold">
							<span>Total</span><span>{rupiah(total)}</span>
						</div>
						<div class="flex justify-between text-emerald-600">
							<span>Sudah dibayar</span><span>-{rupiah(transaction.paid)}</span>
						</div>
						<div class="flex justify-between rounded-xl bg-muted p-3 font-semibold">
							<span>Sisa</span><span>{rupiah(remaining)}</span>
						</div>
						<div class="flex justify-between pt-1 text-muted-foreground">
							<span>Metode</span><span>{transaction.paymentMethod}</span>
						</div>
					</Card.Content><Card.Footer class="border-t">
						<Button
							class="w-full print:hidden"
							variant={remaining ? 'default' : 'outline'}
							onclick={() =>
								toast.success(
									remaining ? 'Pembayaran mock berhasil dicatat' : 'Transaksi sudah lunas'
								)}
						>
							<Check />{remaining ? 'Catat pembayaran' : 'Sudah lunas'}
						</Button>
					</Card.Footer>
				</Card.Root>

				<Card.Root>
					<Card.Header><Card.Title>Timeline transaksi</Card.Title></Card.Header><Card.Content>
						<div
							class="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-3 before:w-px before:bg-border"
						>
							{#each timeline as entry (entry.label)}<div class="relative flex gap-4">
									<span
										class="z-10 flex size-6 shrink-0 items-center justify-center rounded-full {entry.done
											? 'bg-primary text-primary-foreground'
											: 'bg-muted text-muted-foreground'} ring-4 ring-card"
									>
										{#if entry.done}<Check class="size-3" />{:else}<span
												class="size-2 rounded-full bg-current"
											></span>{/if}
									</span>
									<div>
										<p class="text-sm font-medium">{entry.label}</p>
										<p class="mt-1 text-xs text-muted-foreground">{entry.detail}</p>
									</div>
								</div>{/each}
						</div>
					</Card.Content>
				</Card.Root>
			</aside>
		</section>

		<footer class="hidden border-t pt-6 text-center text-xs print:block">
			<p class="font-bold">OutdoorPOS · Manajemen Rental Outdoor</p>
			<p>Terima kasih telah menggunakan layanan kami.</p>
		</footer>
	</div>
{:else}
	<div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
		<FileText class="mb-4 size-10 text-muted-foreground" />
		<h1 class="text-xl font-semibold">Transaksi tidak ditemukan</h1>
		<p class="mt-1 text-sm text-muted-foreground">Kode transaksi tidak tersedia dalam data mock.</p>
		<Button href={resolve('/(app)/transaksi')} class="mt-5">
			<ArrowLeft />Kembali ke transaksi
		</Button>
	</div>
{/if}
