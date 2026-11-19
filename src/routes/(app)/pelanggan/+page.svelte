<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import {
		Ban,
		CircleUserRound,
		MoreHorizontal,
		Plus,
		Search,
		ShoppingBasket,
		Users
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import * as Card from '#lib/components/ui/card';
	import * as Table from '#lib/components/ui/table';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu';
	import CustomerStatusBadge from '#lib/components/customer-status-badge.svelte';
	import { customers } from '#lib/customers/mock-data';
	import { customerMetrics } from '#lib/customers/calculation';
	import { rupiah } from '#lib/inventory/mock-data';
	import { rentalTransactions } from '#lib/transactions/mock-data';

	let search = $state('');
	let status = $state('Semua status');
	const statuses = ['Semua status', 'Aktif', 'Diblokir'];
	const filtered = $derived(
		customers.filter(
			(customer) =>
				`${customer.code} ${customer.name} ${customer.phone} ${customer.email}`
					.toLowerCase()
					.includes(search.toLowerCase()) &&
				(status === 'Semua status' || customer.status === status)
		)
	);

	function detailRoute(id: string) {
		return resolve('/(app)/pelanggan/[id]', { id });
	}

	function editRoute(id: string) {
		return resolve('/(app)/pelanggan/[id]/edit', { id });
	}
</script>

<svelte:head><title>Pelanggan — OutdoorPOS</title></svelte:head>

<div class="space-y-6">
	<section class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p class="mb-1 text-sm text-muted-foreground">Data penyewa operasional</p>
			<h1 class="text-2xl font-bold tracking-tight md:text-3xl">Pelanggan</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Kelola identitas, status, dan aktivitas penyewaan pelanggan.
			</p>
		</div>
		<Button href={resolve('/(app)/pelanggan/tambah')}><Plus />Tambah Pelanggan</Button>
	</section>

	<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each [{ label: 'Total pelanggan', value: customers.length, detail: 'Terdaftar saat ini', icon: Users }, { label: 'Pelanggan aktif', value: customers.filter((item) => item.status === 'Aktif').length, detail: 'Dapat membuat transaksi', icon: CircleUserRound }, { label: 'Sedang menyewa', value: new Set(rentalTransactions
							.filter((item) => ['Sedang disewa', 'Terlambat'].includes(item.status))
							.map((item) => item.customerId)).size, detail: 'Punya sewa aktif', icon: ShoppingBasket }, { label: 'Diblokir', value: customers.filter((item) => item.status === 'Diblokir').length, detail: 'Tidak dapat menyewa', icon: Ban }] as stat (stat.label)}
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
			<div class="grid gap-3 sm:grid-cols-[1fr_190px_auto]">
				<label class="relative">
					<span class="sr-only">Cari pelanggan</span><Search
						class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
					/><Input
						bind:value={search}
						class="pl-9"
						placeholder="Cari kode, nama, telepon, atau email..."
					/>
				</label><select
					bind:value={status}
					aria-label="Filter status pelanggan"
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
		</Card.Header><Card.Content class="px-0">
			<div class="hidden overflow-x-auto md:block">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Pelanggan</Table.Head><Table.Head>Kontak</Table.Head><Table.Head>
								Transaksi
							</Table.Head><Table.Head>Total sewa</Table.Head><Table.Head>
								Sewa aktif
							</Table.Head><Table.Head>Status</Table.Head><Table.Head class="w-12">
								<span class="sr-only">Aksi</span>
							</Table.Head>
						</Table.Row>
					</Table.Header><Table.Body>
						{#each filtered as customer (customer.id)}{@const metrics = customerMetrics(
								customer.id,
								rentalTransactions
							)}<Table.Row class="cursor-pointer" onclick={() => goto(detailRoute(customer.id))}>
								<Table.Cell>
									<p class="font-medium">{customer.name}</p>
									<p class="text-xs text-muted-foreground">
										{customer.code} · Bergabung {customer.joinedAt}
									</p>
								</Table.Cell><Table.Cell>
									<p>{customer.phone}</p>
									<p class="text-xs text-muted-foreground">{customer.email}</p>
								</Table.Cell><Table.Cell>{metrics.totalTransactions}</Table.Cell><Table.Cell>
									{rupiah(metrics.totalSpent)}
								</Table.Cell><Table.Cell>{metrics.activeRentals}</Table.Cell><Table.Cell>
									<CustomerStatusBadge status={customer.status} />
								</Table.Cell><Table.Cell>
									<div onclick={(event) => event.stopPropagation()} role="presentation">
										<DropdownMenu.Root>
											<DropdownMenu.Trigger>
												{#snippet child({ props })}
													<Button
														{...props}
														variant="ghost"
														size="icon-sm"
														aria-label={`Aksi ${customer.name}`}
													>
														<MoreHorizontal />
													</Button>
												{/snippet}
											</DropdownMenu.Trigger><DropdownMenu.Content align="end">
												<DropdownMenu.Item onclick={() => goto(detailRoute(customer.id))}>
													Lihat detail
												</DropdownMenu.Item><DropdownMenu.Item
													onclick={() => goto(editRoute(customer.id))}
												>
													Edit pelanggan
												</DropdownMenu.Item><DropdownMenu.Separator /><DropdownMenu.Item
													variant="destructive"
													onclick={() =>
														toast.info(
															customer.status === 'Aktif'
																? 'Pelanggan diblokir secara mock'
																: 'Blokir pelanggan dibuka secara mock'
														)}
												>
													{customer.status === 'Aktif' ? 'Blokir pelanggan' : 'Buka blokir'}
												</DropdownMenu.Item>
											</DropdownMenu.Content>
										</DropdownMenu.Root>
									</div>
								</Table.Cell>
							</Table.Row>{/each}
					</Table.Body>
				</Table.Root>
			</div>
			<div class="grid gap-3 p-4 md:hidden">
				{#each filtered as customer (customer.id)}{@const metrics = customerMetrics(
						customer.id,
						rentalTransactions
					)}<a
						href={detailRoute(customer.id)}
						class="rounded-xl border p-4 transition-colors hover:bg-muted/40"
					>
						<div class="flex items-start justify-between gap-3">
							<div>
								<p class="font-medium">{customer.name}</p>
								<p class="text-xs text-muted-foreground">{customer.code} · {customer.phone}</p>
							</div>
							<CustomerStatusBadge status={customer.status} />
						</div>
						<div class="mt-4 grid grid-cols-3 gap-2 border-t pt-3 text-center">
							<div>
								<p class="font-semibold">{metrics.totalTransactions}</p>
								<p class="text-[11px] text-muted-foreground">Transaksi</p>
							</div>
							<div>
								<p class="font-semibold">{metrics.activeRentals}</p>
								<p class="text-[11px] text-muted-foreground">Aktif</p>
							</div>
							<div>
								<p class="truncate font-semibold">{rupiah(metrics.totalSpent)}</p>
								<p class="text-[11px] text-muted-foreground">Total sewa</p>
							</div>
						</div>
					</a>{/each}
			</div>
			{#if !filtered.length}<div
					class="flex min-h-72 flex-col items-center justify-center text-center"
				>
					<Users class="mb-3 size-8 text-muted-foreground" />
					<h2 class="font-semibold">Pelanggan tidak ditemukan</h2>
					<p class="mt-1 text-sm text-muted-foreground">Ubah pencarian atau filter.</p>
				</div>{/if}
		</Card.Content><Card.Footer class="justify-between border-t text-sm text-muted-foreground">
			<span>{filtered.length} pelanggan</span><span>Data mock frontend</span>
		</Card.Footer>
	</Card.Root>
</div>
