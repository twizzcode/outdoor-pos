<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import {
		CalendarDays,
		CheckCircle2,
		Clock3,
		MoreHorizontal,
		Plus,
		Search,
		ShoppingBasket,
		TriangleAlert
	} from '@lucide/svelte';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import { Badge } from '#lib/components/ui/badge';
	import * as Card from '#lib/components/ui/card';
	import * as Table from '#lib/components/ui/table';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu';
	import TransactionStatusBadge from '#lib/components/transaction-status-badge.svelte';
	import { rupiah } from '#lib/inventory/mock-data';
	import { rentalTransactions } from '#lib/transactions/mock-data';
	import { rentalTotal } from '#lib/transactions/calculation';

	let search = $state('');
	let status = $state('Semua status');
	let payment = $state('Semua pembayaran');

	const statuses = [
		'Semua status',
		'Reservasi',
		'Siap diambil',
		'Sedang disewa',
		'Terlambat',
		'Selesai',
		'Dibatalkan'
	];
	const payments = ['Semua pembayaran', 'Belum dibayar', 'DP', 'Lunas'];
	const filtered = $derived(
		rentalTransactions.filter(
			(transaction) =>
				`${transaction.code} ${transaction.customerName} ${transaction.customerPhone}`
					.toLowerCase()
					.includes(search.toLowerCase()) &&
				(status === 'Semua status' || transaction.status === status) &&
				(payment === 'Semua pembayaran' || transaction.paymentStatus === payment)
		)
	);

	function detailRoute(id: string) {
		return resolve('/(app)/transaksi/[id]', { id });
	}
</script>

<svelte:head><title>Transaksi — OutdoorPOS</title></svelte:head>

<div class="space-y-6">
	<section class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p class="mb-1 text-sm text-muted-foreground">Operasional penyewaan admin</p>
			<h1 class="text-2xl font-bold tracking-tight md:text-3xl">Transaksi penyewaan</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Pantau reservasi, sewa aktif, dan pembayaran.
			</p>
		</div>
		<Button href={resolve('/(app)/transaksi/baru')}><Plus />Buat Transaksi</Button>
	</section>

	<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each [{ label: 'Reservasi', value: rentalTransactions.filter((item) => item.status === 'Reservasi' || item.status === 'Siap diambil').length, detail: 'Menunggu pengambilan', icon: CalendarDays }, { label: 'Sedang disewa', value: rentalTransactions.filter((item) => item.status === 'Sedang disewa').length, detail: 'Transaksi aktif', icon: ShoppingBasket }, { label: 'Terlambat', value: rentalTransactions.filter((item) => item.status === 'Terlambat').length, detail: 'Perlu tindak lanjut', icon: TriangleAlert }, { label: 'Selesai', value: rentalTransactions.filter((item) => item.status === 'Selesai').length, detail: 'Bulan ini', icon: CheckCircle2 }] as stat (stat.label)}
			<Card.Root class="py-5">
				<Card.Content class="flex items-start justify-between px-5">
					<div>
						<p class="text-sm text-muted-foreground">{stat.label}</p>
						<p class="mt-2 text-3xl font-bold">{stat.value}</p>
						<p class="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
					</div>
					<span class="flex size-10 items-center justify-center rounded-xl bg-muted">
						<stat.icon class="size-5" />
					</span>
				</Card.Content>
			</Card.Root>
		{/each}
	</section>

	<Card.Root>
		<Card.Header class="border-b">
			<div class="grid gap-3 lg:grid-cols-[1fr_190px_190px_auto]">
				<label class="relative">
					<span class="sr-only">Cari transaksi</span><Search
						class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
					/><Input
						bind:value={search}
						class="pl-9"
						placeholder="Cari kode, nama, atau telepon..."
					/>
				</label><select
					bind:value={status}
					aria-label="Filter status"
					class="h-9 rounded-xl border bg-background px-3 text-sm"
				>
					{#each statuses as item (item)}<option>{item}</option>{/each}
				</select><select
					bind:value={payment}
					aria-label="Filter pembayaran"
					class="h-9 rounded-xl border bg-background px-3 text-sm"
				>
					{#each payments as item (item)}<option>{item}</option>{/each}
				</select><Button
					variant="ghost"
					onclick={() => {
						search = '';
						status = 'Semua status';
						payment = 'Semua pembayaran';
					}}
				>
					Reset
				</Button>
			</div>
		</Card.Header>
		<Card.Content class="px-0">
			<div class="hidden overflow-x-auto md:block">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Transaksi</Table.Head><Table.Head>Pelanggan</Table.Head><Table.Head>
								Periode sewa
							</Table.Head><Table.Head>Total</Table.Head><Table.Head>
								Pembayaran
							</Table.Head><Table.Head>Status</Table.Head><Table.Head class="w-12">
								<span class="sr-only">Aksi</span>
							</Table.Head>
						</Table.Row>
					</Table.Header><Table.Body>
						{#each filtered as transaction (transaction.id)}{@const total = rentalTotal(
								transaction.items,
								transaction.startDate,
								transaction.returnDate,
								transaction.discount,
								transaction.deposit
							)}<Table.Row class="cursor-pointer" onclick={() => goto(detailRoute(transaction.id))}>
								<Table.Cell>
									<p class="font-medium">{transaction.code}</p>
									<p class="text-xs text-muted-foreground">
										{transaction.items.length} jenis barang
									</p>
								</Table.Cell><Table.Cell>
									<p class="font-medium">{transaction.customerName}</p>
									<p class="text-xs text-muted-foreground">{transaction.customerPhone}</p>
								</Table.Cell><Table.Cell>
									<p>{transaction.startDate}</p>
									<p class="text-xs text-muted-foreground">s.d. {transaction.returnDate}</p>
								</Table.Cell><Table.Cell class="font-medium">
									{rupiah(total)}
								</Table.Cell><Table.Cell>
									<Badge variant={transaction.paymentStatus === 'Lunas' ? 'default' : 'outline'}>
										{transaction.paymentStatus}
									</Badge>
									<p class="mt-1 text-xs text-muted-foreground">{transaction.paymentMethod}</p>
								</Table.Cell><Table.Cell>
									<TransactionStatusBadge status={transaction.status} />
								</Table.Cell><Table.Cell>
									<div onclick={(event) => event.stopPropagation()} role="presentation">
										<DropdownMenu.Root>
											<DropdownMenu.Trigger>
												<Button
													variant="ghost"
													size="icon-sm"
													aria-label={`Aksi ${transaction.code}`}
												>
													<MoreHorizontal />
												</Button>
											</DropdownMenu.Trigger><DropdownMenu.Content align="end">
												<DropdownMenu.Item onclick={() => goto(detailRoute(transaction.id))}>
													Lihat detail
												</DropdownMenu.Item><DropdownMenu.Item>Cetak nota</DropdownMenu.Item>
											</DropdownMenu.Content>
										</DropdownMenu.Root>
									</div>
								</Table.Cell>
							</Table.Row>{/each}
					</Table.Body>
				</Table.Root>
			</div>
			<div class="grid gap-3 p-4 md:hidden">
				{#each filtered as transaction (transaction.id)}{@const total = rentalTotal(
						transaction.items,
						transaction.startDate,
						transaction.returnDate,
						transaction.discount,
						transaction.deposit
					)}<a
						href={detailRoute(transaction.id)}
						class="rounded-xl border p-4 transition-colors hover:bg-muted/40"
					>
						<div class="flex items-start justify-between gap-2">
							<div>
								<p class="font-medium">{transaction.code}</p>
								<p class="text-xs text-muted-foreground">{transaction.customerName}</p>
							</div>
							<TransactionStatusBadge status={transaction.status} />
						</div>
						<div class="mt-4 grid grid-cols-2 gap-3 border-t pt-3">
							<div>
								<p class="text-xs text-muted-foreground">Periode</p>
								<p class="text-sm font-medium">{transaction.startDate}</p>
								<p class="text-xs text-muted-foreground">hingga {transaction.returnDate}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground">Total</p>
								<p class="text-sm font-medium">{rupiah(total)}</p>
								<p class="text-xs text-muted-foreground">{transaction.paymentStatus}</p>
							</div>
						</div>
					</a>{/each}
			</div>
			{#if !filtered.length}<div
					class="flex min-h-72 flex-col items-center justify-center text-center"
				>
					<Clock3 class="mb-3 size-8 text-muted-foreground" />
					<h2 class="font-semibold">Transaksi tidak ditemukan</h2>
					<p class="mt-1 text-sm text-muted-foreground">Ubah pencarian atau filter transaksi.</p>
				</div>{/if}
		</Card.Content>
		<Card.Footer class="justify-between border-t text-sm text-muted-foreground">
			<span>Menampilkan {filtered.length} transaksi</span><span>Data mock frontend</span>
		</Card.Footer>
	</Card.Root>
</div>
