<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import {
		ArrowLeft,
		Ban,
		Banknote,
		CalendarDays,
		CircleUserRound,
		Edit3,
		FileText,
		Mail,
		MapPin,
		Phone,
		Plus,
		ShieldCheck,
		ShoppingBasket,
		Users
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button';
	import { Textarea } from '#lib/components/ui/textarea';
	import * as Card from '#lib/components/ui/card';
	import * as Table from '#lib/components/ui/table';
	import * as Dialog from '#lib/components/ui/dialog';
	import CustomerStatusBadge from '#lib/components/customer-status-badge.svelte';
	import TransactionStatusBadge from '#lib/components/transaction-status-badge.svelte';
	import { customerMetrics } from '#lib/customers/calculation';
	import { findCustomer } from '#lib/customers/mock-data';
	import { rupiah } from '#lib/inventory/mock-data';
	import { rentalTotal } from '#lib/transactions/calculation';
	import { rentalTransactions } from '#lib/transactions/mock-data';

	const customer = findCustomer(page.params.id ?? '');
	const transactions = customer
		? rentalTransactions.filter((item) => item.customerId === customer.id)
		: [];
	const metrics = customer ? customerMetrics(customer.id, rentalTransactions) : undefined;
	let status = $state(customer?.status ?? 'Aktif');
	let notes = $state(customer?.notes ?? '');
	let blockOpen = $state(false);

	function editRoute() {
		return resolve('/(app)/pelanggan/[id]/edit', { id: customer?.id ?? '' });
	}

	function toggleBlock() {
		status = status === 'Aktif' ? 'Diblokir' : 'Aktif';
		blockOpen = false;
		toast.success(status === 'Diblokir' ? 'Pelanggan diblokir' : 'Blokir pelanggan dibuka', {
			description: 'Perubahan hanya berlaku selama halaman aktif.'
		});
	}
</script>

<svelte:head>
	<title>{customer?.name ?? 'Pelanggan tidak ditemukan'} — OutdoorPOS</title>
</svelte:head>

{#if customer && metrics}
	<div class="space-y-6">
		<section class="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
			<div class="flex items-start gap-3">
				<Button href={resolve('/(app)/pelanggan')} variant="ghost" size="icon" aria-label="Kembali">
					<ArrowLeft />
				</Button><span
					class="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted"
				>
					<CircleUserRound class="size-7" />
				</span>
				<div>
					<div class="mb-2 flex flex-wrap items-center gap-2">
						<h1 class="text-2xl font-bold tracking-tight md:text-3xl">{customer.name}</h1>
						<CustomerStatusBadge {status} />
					</div>
					<p class="text-sm text-muted-foreground">
						{customer.code} · Bergabung {customer.joinedAt}
					</p>
				</div>
			</div>
			<div class="flex flex-wrap gap-2">
				<Button href={resolve('/(app)/transaksi/baru')} disabled={status === 'Diblokir'}>
					<Plus />Buat penyewaan
				</Button><Button href={editRoute()} variant="outline"><Edit3 />Edit</Button><Button
					variant="destructive"
					onclick={() => (blockOpen = true)}
				>
					{#if status === 'Aktif'}<Ban />Blokir{:else}<ShieldCheck />Buka blokir{/if}
				</Button>
			</div>
		</section>

		{#if status === 'Diblokir'}<div
				class="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
			>
				<Ban class="size-5 shrink-0" />
				<div>
					<p class="font-semibold">Pelanggan diblokir</p>
					<p>Penyewaan baru dinonaktifkan sampai blokir dibuka oleh admin.</p>
				</div>
			</div>{/if}

		<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each [{ label: 'Total transaksi', value: metrics.totalTransactions, detail: 'Semua penyewaan', icon: ShoppingBasket }, { label: 'Sewa aktif', value: metrics.activeRentals, detail: 'Reservasi atau berjalan', icon: CalendarDays }, { label: 'Total nilai sewa', value: rupiah(metrics.totalSpent), detail: 'Tidak termasuk deposit', icon: Banknote }, { label: 'Pernah terlambat', value: metrics.lateRentals, detail: metrics.lateRentals ? 'Perlu perhatian' : 'Riwayat baik', icon: ShieldCheck }] as stat (stat.label)}
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

		<section class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
			<div class="space-y-4">
				<Card.Root>
					<Card.Header>
						<Card.Title>Riwayat transaksi</Card.Title><Card.Description>
							Penyewaan yang terkait dengan pelanggan ini.
						</Card.Description>
					</Card.Header><Card.Content class="px-0">
						{#if transactions.length}<div class="overflow-x-auto">
								<Table.Root>
									<Table.Header>
										<Table.Row>
											<Table.Head>Kode</Table.Head><Table.Head>Periode</Table.Head><Table.Head>
												Barang
											</Table.Head><Table.Head>Total sewa</Table.Head><Table.Head>
												Pembayaran
											</Table.Head><Table.Head>Status</Table.Head>
										</Table.Row>
									</Table.Header><Table.Body>
										{#each transactions as transaction (transaction.id)}<Table.Row>
												<Table.Cell>
													<a
														href={resolve('/(app)/transaksi/[id]', { id: transaction.id })}
														class="font-medium hover:underline"
													>
														{transaction.code}
													</a>
												</Table.Cell><Table.Cell>
													<p>{transaction.startDate}</p>
													<p class="text-xs text-muted-foreground">
														hingga {transaction.returnDate}
													</p>
												</Table.Cell><Table.Cell>
													{transaction.items.reduce((sum, item) => sum + item.quantity, 0)} unit
												</Table.Cell><Table.Cell>
													{rupiah(
														rentalTotal(
															transaction.items,
															transaction.startDate,
															transaction.returnDate,
															transaction.discount,
															0
														)
													)}
												</Table.Cell><Table.Cell>
													{transaction.paymentStatus}
												</Table.Cell><Table.Cell>
													<TransactionStatusBadge status={transaction.status} />
												</Table.Cell>
											</Table.Row>{/each}
									</Table.Body>
								</Table.Root>
							</div>{:else}<div
								class="flex min-h-60 flex-col items-center justify-center text-center"
							>
								<FileText class="mb-3 size-8 text-muted-foreground" />
								<p class="font-medium">Belum ada transaksi</p>
								<p class="mt-1 text-sm text-muted-foreground">
									Pelanggan belum pernah menyewa barang.
								</p>
								<Button
									href={resolve('/(app)/transaksi/baru')}
									class="mt-4"
									disabled={status === 'Diblokir'}
								>
									<Plus />Buat penyewaan
								</Button>
							</div>{/if}
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="flex-row items-center justify-between">
						<div>
							<Card.Title>Catatan internal</Card.Title><Card.Description>
								Informasi operasional untuk admin.
							</Card.Description>
						</div>
						<Button
							size="sm"
							variant="outline"
							onclick={() => toast.success('Catatan pelanggan diperbarui')}
						>
							Simpan
						</Button>
					</Card.Header><Card.Content>
						<Textarea bind:value={notes} rows={4} placeholder="Belum ada catatan pelanggan..." />
					</Card.Content>
				</Card.Root>
			</div>

			<aside class="space-y-4">
				<Card.Root>
					<Card.Header><Card.Title>Informasi kontak</Card.Title></Card.Header><Card.Content
						class="space-y-4 text-sm"
					>
						<div class="flex gap-3">
							<Phone class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
							<div>
								<p class="text-xs text-muted-foreground">Nomor telepon</p>
								<p class="font-medium">{customer.phone}</p>
							</div>
						</div>
						<div class="flex gap-3">
							<Mail class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
							<div class="min-w-0">
								<p class="text-xs text-muted-foreground">Email</p>
								<p class="truncate font-medium">{customer.email || '-'}</p>
							</div>
						</div>
						<div class="flex gap-3">
							<MapPin class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
							<div>
								<p class="text-xs text-muted-foreground">Alamat</p>
								<p class="leading-relaxed font-medium">{customer.address}</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header><Card.Title>Identitas dan darurat</Card.Title></Card.Header><Card.Content
						class="space-y-4 text-sm"
					>
						<div>
							<p class="text-xs text-muted-foreground">Nomor identitas</p>
							<p class="mt-1 font-medium">{customer.identityNumber || '-'}</p>
						</div>
						<div class="border-t pt-4">
							<p class="text-xs text-muted-foreground">Kontak darurat</p>
							<p class="mt-1 font-medium">{customer.emergencyContact || '-'}</p>
						</div>
					</Card.Content>
				</Card.Root>
			</aside>
		</section>
	</div>

	<Dialog.Root bind:open={blockOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>
					{status === 'Aktif' ? 'Blokir pelanggan?' : 'Buka blokir pelanggan?'}
				</Dialog.Title><Dialog.Description>
					{status === 'Aktif'
						? `${customer.name} tidak dapat membuat penyewaan baru.`
						: `${customer.name} dapat membuat penyewaan kembali.`}
				</Dialog.Description>
			</Dialog.Header>{#if status === 'Aktif'}<div
					class="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
				>
					Transaksi aktif tidak dibatalkan otomatis. Tindak lanjuti secara terpisah.
				</div>{/if}<Dialog.Footer>
				<Button variant="outline" onclick={() => (blockOpen = false)}>Batal</Button><Button
					variant={status === 'Aktif' ? 'destructive' : 'default'}
					onclick={toggleBlock}
				>
					Konfirmasi
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
		<Users class="mb-4 size-10 text-muted-foreground" />
		<h1 class="text-xl font-semibold">Pelanggan tidak ditemukan</h1>
		<p class="mt-1 text-sm text-muted-foreground">ID pelanggan tidak tersedia dalam data mock.</p>
		<Button href={resolve('/(app)/pelanggan')} class="mt-5"><ArrowLeft />Kembali ke daftar</Button>
	</div>
{/if}
