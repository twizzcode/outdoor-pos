<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		CalendarDays,
		ChevronLeft,
		ChevronRight,
		Clock3,
		List,
		PackageCheck,
		Plus,
		Search,
		TriangleAlert
	} from '@lucide/svelte';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import * as Card from '#lib/components/ui/card';
	import * as Table from '#lib/components/ui/table';
	import * as Tabs from '#lib/components/ui/tabs';
	import ReservationStatusBadge from '#lib/components/reservation-status-badge.svelte';
	import { reservations } from '#lib/reservations/mock-data';

	let search = $state('');
	let status = $state('Semua status');
	let currentMonth = $state(new Date(2026, 10, 1));
	const statuses = [
		'Semua status',
		'Draft',
		'Dikonfirmasi',
		'Siap diambil',
		'Dikonversi',
		'Dibatalkan'
	];
	const filtered = $derived(
		reservations.filter(
			(item) =>
				`${item.code} ${item.customerName} ${item.customerPhone}`
					.toLowerCase()
					.includes(search.toLowerCase()) &&
				(status === 'Semua status' || item.status === status)
		)
	);
	const calendarDays = $derived.by(() => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();
		const firstDay = new Date(year, month, 1).getDay();
		const total = new Date(year, month + 1, 0).getDate();
		return [
			...Array.from({ length: firstDay }, () => null),
			...Array.from({ length: total }, (_, index) => {
				const day = index + 1;
				const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
				return {
					day,
					date,
					items: reservations.filter(
						(item) =>
							item.status !== 'Dibatalkan' && item.startDate <= date && item.returnDate >= date
					)
				};
			})
		];
	});
	const monthLabel = $derived(
		new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(currentMonth)
	);

	function detailRoute(id: string) {
		return resolve('/(app)/reservasi/[id]', { id });
	}

	function moveMonth(offset: number) {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
	}

	function shortDate(value: string) {
		return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(
			new Date(`${value}T12:00:00`)
		);
	}
</script>

<svelte:head><title>Reservasi — OutdoorPOS</title></svelte:head>

<div class="space-y-6">
	<section class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p class="mb-1 text-sm text-muted-foreground">Perencanaan penyewaan admin</p>
			<h1 class="text-2xl font-bold tracking-tight md:text-3xl">Reservasi dan ketersediaan</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Atur jadwal, cegah bentrok stok, dan siapkan pengambilan barang.
			</p>
		</div>
		<Button href={resolve('/(app)/reservasi/tambah')}><Plus />Buat Reservasi</Button>
	</section>

	<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each [{ label: 'Perlu konfirmasi', value: reservations.filter((item) => item.status === 'Draft').length, detail: 'Draft aktif', icon: Clock3 }, { label: 'Terkonfirmasi', value: reservations.filter((item) => item.status === 'Dikonfirmasi').length, detail: 'Jadwal mendatang', icon: CalendarDays }, { label: 'Siap diambil', value: reservations.filter((item) => item.status === 'Siap diambil').length, detail: 'Barang sudah disiapkan', icon: PackageCheck }, { label: 'Risiko bentrok', value: 1, detail: 'Periksa stok Headlamp', icon: TriangleAlert }] as stat (stat.label)}
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

	<Tabs.Root value="calendar">
		<Tabs.List class="grid w-full grid-cols-2 sm:w-80">
			<Tabs.Trigger value="calendar"><CalendarDays />Kalender</Tabs.Trigger><Tabs.Trigger
				value="list"
			>
				<List />Daftar
			</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="calendar" class="mt-4">
			<Card.Root>
				<Card.Header class="flex-row items-center justify-between border-b">
					<div>
						<Card.Title class="capitalize">{monthLabel}</Card.Title><Card.Description>
							Klik reservasi untuk membuka detail.
						</Card.Description>
					</div>
					<div class="flex gap-1">
						<Button
							variant="outline"
							size="icon"
							aria-label="Bulan sebelumnya"
							onclick={() => moveMonth(-1)}
						>
							<ChevronLeft />
						</Button><Button
							variant="outline"
							size="sm"
							onclick={() => (currentMonth = new Date(2026, 10, 1))}
						>
							Hari ini
						</Button><Button
							variant="outline"
							size="icon"
							aria-label="Bulan berikutnya"
							onclick={() => moveMonth(1)}
						>
							<ChevronRight />
						</Button>
					</div>
				</Card.Header><Card.Content class="px-0 pb-0">
					<div class="overflow-x-auto">
						<div class="min-w-[840px]">
							<div
								class="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-medium text-muted-foreground"
							>
								{#each ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as day (day)}<div
										class="p-3"
									>
										{day}
									</div>{/each}
							</div>
							<div class="grid grid-cols-7">
								{#each calendarDays as cell, index (index)}<div
										class="min-h-32 border-r border-b p-2 last:border-r-0 {cell
											? ''
											: 'bg-muted/20'}"
									>
										{#if cell}<p
												class="mb-2 text-xs font-medium"
												class:text-primary={cell.date === '2026-11-19'}
											>
												{cell.day}
											</p>
											<div class="space-y-1">
												{#each cell.items.slice(0, 3) as item (item.id)}<a
														href={detailRoute(item.id)}
														class="block truncate rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/20"
														title={`${item.code} · ${item.customerName}`}
													>
														{item.pickupTime}
														{item.customerName}
													</a>{/each}
												{#if cell.items.length > 3}<p
														class="px-2 text-[10px] text-muted-foreground"
													>
														+{cell.items.length - 3} lainnya
													</p>{/if}
											</div>{/if}
									</div>{/each}
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
		<Tabs.Content value="list" class="mt-4">
			<Card.Root>
				<Card.Header class="border-b">
					<div class="grid gap-3 sm:grid-cols-[1fr_190px_auto]">
						<label class="relative">
							<span class="sr-only">Cari reservasi</span><Search
								class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
							/><Input bind:value={search} class="pl-9" placeholder="Cari kode atau pelanggan..." />
						</label><select
							bind:value={status}
							aria-label="Filter status reservasi"
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
									<Table.Head>Reservasi</Table.Head><Table.Head>Pelanggan</Table.Head><Table.Head>
										Periode
									</Table.Head><Table.Head>Barang</Table.Head><Table.Head>Status</Table.Head>
								</Table.Row>
							</Table.Header><Table.Body>
								{#each filtered as item (item.id)}<Table.Row
										class="cursor-pointer"
										onclick={() => goto(detailRoute(item.id))}
									>
										<Table.Cell>
											<p class="font-medium">{item.code}</p>
											<p class="text-xs text-muted-foreground">Dibuat {item.createdAt}</p>
										</Table.Cell><Table.Cell>
											<p class="font-medium">{item.customerName}</p>
											<p class="text-xs text-muted-foreground">{item.customerPhone}</p>
										</Table.Cell><Table.Cell>
											<p>{shortDate(item.startDate)}–{shortDate(item.returnDate)}</p>
											<p class="text-xs text-muted-foreground">Ambil {item.pickupTime}</p>
										</Table.Cell><Table.Cell>
											{item.items.reduce((total, product) => total + product.quantity, 0)} unit
										</Table.Cell><Table.Cell>
											<ReservationStatusBadge status={item.status} />
										</Table.Cell>
									</Table.Row>{/each}
							</Table.Body>
						</Table.Root>
					</div>
					<div class="grid gap-3 p-4 md:hidden">
						{#each filtered as item (item.id)}<a
								href={detailRoute(item.id)}
								class="rounded-xl border p-4"
							>
								<div class="flex items-start justify-between gap-2">
									<div>
										<p class="font-medium">{item.code}</p>
										<p class="text-xs text-muted-foreground">{item.customerName}</p>
									</div>
									<ReservationStatusBadge status={item.status} />
								</div>
								<p class="mt-3 text-sm">
									{shortDate(item.startDate)}–{shortDate(item.returnDate)} · {item.pickupTime}
								</p>
							</a>{/each}
					</div>
					{#if !filtered.length}<div
							class="flex min-h-64 items-center justify-center text-sm text-muted-foreground"
						>
							Reservasi tidak ditemukan.
						</div>{/if}
				</Card.Content><Card.Footer class="border-t text-sm text-muted-foreground">
					{filtered.length} reservasi · Data mock frontend
				</Card.Footer>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</div>
