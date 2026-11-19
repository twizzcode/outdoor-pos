<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import {
		CalendarCheck,
		CheckCircle2,
		Clock3,
		RotateCcw,
		Search,
		TriangleAlert
	} from '@lucide/svelte';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import * as Card from '#lib/components/ui/card';
	import * as Table from '#lib/components/ui/table';
	import ReturnStatusBadge from '#lib/components/return-status-badge.svelte';
	import TransactionStatusBadge from '#lib/components/transaction-status-badge.svelte';
	import { returnSummaries } from '#lib/returns/mock-data';
	import { rentalTransactions } from '#lib/transactions/mock-data';

	let search = $state('');
	let status = $state('Semua status');
	const statuses = ['Semua status', 'Menunggu', 'Jatuh tempo', 'Terlambat', 'Selesai'];
	const records = returnSummaries.flatMap((summary) => {
		const transaction = rentalTransactions.find((item) => item.id === summary.transactionId);
		return transaction ? [{ summary, transaction }] : [];
	});
	const filtered = $derived(
		records.filter(
			({ summary, transaction }) =>
				`${transaction.code} ${transaction.customerName} ${transaction.customerPhone}`
					.toLowerCase()
					.includes(search.toLowerCase()) &&
				(status === 'Semua status' || summary.status === status)
		)
	);

	function returnRoute(id: string) {
		return resolve('/(app)/pengembalian/[transactionId]', { transactionId: id });
	}
</script>

<svelte:head><title>Pengembalian — OutdoorPOS</title></svelte:head>

<div class="space-y-6">
	<section>
		<p class="mb-1 text-sm text-muted-foreground">Operasional rental admin</p>
		<h1 class="text-2xl font-bold tracking-tight md:text-3xl">Pengembalian barang</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Periksa barang kembali, biaya, dan penyelesaian deposit.
		</p>
	</section>

	<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each [{ label: 'Menunggu kembali', value: records.filter(({ summary }) => summary.status === 'Menunggu').length, detail: 'Sewa aktif', icon: RotateCcw }, { label: 'Jatuh tempo', value: records.filter(({ summary }) => summary.status === 'Jatuh tempo').length, detail: 'Hari ini', icon: CalendarCheck }, { label: 'Terlambat', value: records.filter(({ summary }) => summary.status === 'Terlambat').length, detail: 'Perlu tindak lanjut', icon: TriangleAlert }, { label: 'Selesai', value: records.filter(({ summary }) => summary.status === 'Selesai').length, detail: 'Riwayat terbaru', icon: CheckCircle2 }] as stat (stat.label)}
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
			<div class="grid gap-3 sm:grid-cols-[1fr_200px_auto]">
				<label class="relative">
					<span class="sr-only">Cari pengembalian</span><Search
						class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
					/><Input
						bind:value={search}
						class="pl-9"
						placeholder="Cari kode, pelanggan, atau telepon..."
					/>
				</label><select
					bind:value={status}
					aria-label="Filter status pengembalian"
					class="h-9 rounded-xl border bg-background px-3 text-sm"
				>
					{#each statuses as item (item)}<option>{item}</option>{/each}
				</select><Button
					variant="ghost"
					onclick={() => {
						search = '';
						status = 'Semua status';
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
								Jadwal kembali
							</Table.Head><Table.Head>Barang</Table.Head><Table.Head>
								Status transaksi
							</Table.Head><Table.Head>Pengembalian</Table.Head><Table.Head class="text-right">
								Aksi
							</Table.Head>
						</Table.Row>
					</Table.Header><Table.Body>
						{#each filtered as record (record.transaction.id)}<Table.Row
								class="cursor-pointer"
								onclick={() => goto(returnRoute(record.transaction.id))}
							>
								<Table.Cell class="font-medium">{record.transaction.code}</Table.Cell><Table.Cell>
									<p class="font-medium">{record.transaction.customerName}</p>
									<p class="text-xs text-muted-foreground">{record.transaction.customerPhone}</p>
								</Table.Cell><Table.Cell>{record.transaction.returnDate}</Table.Cell><Table.Cell>
									{record.transaction.items.reduce((sum, item) => sum + item.quantity, 0)} unit
								</Table.Cell><Table.Cell>
									<TransactionStatusBadge status={record.transaction.status} />
								</Table.Cell><Table.Cell>
									<ReturnStatusBadge status={record.summary.status} />
								</Table.Cell><Table.Cell class="text-right">
									<Button
										size="sm"
										variant={record.summary.status === 'Selesai' ? 'outline' : 'default'}
										onclick={(event) => {
											event.stopPropagation();
											goto(returnRoute(record.transaction.id));
										}}
									>
										{record.summary.status === 'Selesai' ? 'Lihat bukti' : 'Proses'}
									</Button>
								</Table.Cell>
							</Table.Row>{/each}
					</Table.Body>
				</Table.Root>
			</div>
			<div class="grid gap-3 p-4 md:hidden">
				{#each filtered as record (record.transaction.id)}<a
						href={returnRoute(record.transaction.id)}
						class="rounded-xl border p-4 transition-colors hover:bg-muted/40"
					>
						<div class="flex items-start justify-between gap-2">
							<div>
								<p class="font-medium">{record.transaction.code}</p>
								<p class="text-xs text-muted-foreground">{record.transaction.customerName}</p>
							</div>
							<ReturnStatusBadge status={record.summary.status} />
						</div>
						<div class="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
							<div>
								<p class="text-xs text-muted-foreground">Jadwal kembali</p>
								<p class="font-medium">{record.transaction.returnDate}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground">Barang</p>
								<p class="font-medium">
									{record.transaction.items.reduce((sum, item) => sum + item.quantity, 0)} unit
								</p>
							</div>
						</div>
					</a>{/each}
			</div>
			{#if !filtered.length}<div
					class="flex min-h-72 flex-col items-center justify-center text-center"
				>
					<Clock3 class="mb-3 size-8 text-muted-foreground" />
					<h2 class="font-semibold">Pengembalian tidak ditemukan</h2>
					<p class="mt-1 text-sm text-muted-foreground">Ubah pencarian atau filter.</p>
				</div>{/if}
		</Card.Content><Card.Footer class="justify-between border-t text-sm text-muted-foreground">
			<span>{filtered.length} data pengembalian</span><span>Data mock frontend</span>
		</Card.Footer>
	</Card.Root>
</div>
