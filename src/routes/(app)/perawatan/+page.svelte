<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { CircleCheckBig, Clock3, Search, ShieldAlert, Wrench } from '@lucide/svelte';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import * as Card from '#lib/components/ui/card';
	import * as Table from '#lib/components/ui/table';
	import MaintenanceStatusBadge from '#lib/components/maintenance-status-badge.svelte';
	import { rupiah } from '#lib/inventory/mock-data';
	import { maintenanceCosts } from '#lib/maintenance/calculation';
	import { maintenanceRecords } from '#lib/maintenance/mock-data';

	let search = $state('');
	let status = $state('Semua status');
	let damage = $state('Semua tingkat');
	const statuses = [
		'Semua status',
		'Menunggu pemeriksaan',
		'Menunggu perbaikan',
		'Sedang dikerjakan',
		'Selesai',
		'Tidak dapat diperbaiki'
	];
	const damages = ['Semua tingkat', 'Ringan', 'Sedang', 'Berat'];
	const filtered = $derived(
		maintenanceRecords.filter(
			(record) =>
				`${record.unitCode} ${record.productName} ${record.assignee} ${record.issue}`
					.toLowerCase()
					.includes(search.toLowerCase()) &&
				(status === 'Semua status' || record.status === status) &&
				(damage === 'Semua tingkat' || record.damageLevel === damage)
		)
	);
	const costs = maintenanceCosts(maintenanceRecords);

	function detailRoute(id: string) {
		return resolve('/(app)/perawatan/[id]', { id });
	}
</script>

<svelte:head><title>Perawatan — OutdoorPOS</title></svelte:head>

<div class="space-y-6">
	<section>
		<p class="mb-1 text-sm text-muted-foreground">Kondisi dan kesiapan inventaris</p>
		<h1 class="text-2xl font-bold tracking-tight md:text-3xl">Perawatan unit</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Pantau pemeriksaan, perbaikan, dan biaya unit bermasalah.
		</p>
	</section>

	<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each [{ label: 'Menunggu', value: maintenanceRecords.filter( (item) => item.status.startsWith('Menunggu') ).length, detail: 'Pemeriksaan atau perbaikan', icon: Clock3 }, { label: 'Dikerjakan', value: maintenanceRecords.filter((item) => item.status === 'Sedang dikerjakan').length, detail: 'Sedang diproses', icon: Wrench }, { label: 'Selesai', value: maintenanceRecords.filter((item) => item.status === 'Selesai').length, detail: 'Siap kembali ke inventaris', icon: CircleCheckBig }, { label: 'Estimasi biaya', value: rupiah(costs.estimated), detail: `Aktual ${rupiah(costs.actual)}`, icon: ShieldAlert }] as stat (stat.label)}
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

	<Card.Root>
		<Card.Header class="border-b">
			<div class="grid gap-3 lg:grid-cols-[1fr_210px_170px_auto]">
				<label class="relative">
					<span class="sr-only">Cari perawatan</span><Search
						class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
					/><Input
						bind:value={search}
						class="pl-9"
						placeholder="Cari unit, barang, masalah, atau petugas..."
					/>
				</label><select
					bind:value={status}
					aria-label="Filter status"
					class="h-9 rounded-xl border bg-background px-3 text-sm"
				>
					{#each statuses as item (item)}<option>{item}</option>{/each}
				</select><select
					bind:value={damage}
					aria-label="Filter tingkat kerusakan"
					class="h-9 rounded-xl border bg-background px-3 text-sm"
				>
					{#each damages as item (item)}<option>{item}</option>{/each}
				</select><Button
					variant="ghost"
					onclick={() => {
						search = '';
						status = 'Semua status';
						damage = 'Semua tingkat';
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
							<Table.Head>Unit</Table.Head><Table.Head>Masalah</Table.Head><Table.Head>
								Tingkat
							</Table.Head><Table.Head>Penanggung jawab</Table.Head><Table.Head>
								Biaya
							</Table.Head><Table.Head>Status</Table.Head><Table.Head class="text-right">
								Aksi
							</Table.Head>
						</Table.Row>
					</Table.Header><Table.Body>
						{#each filtered as record (record.id)}<Table.Row
								class="cursor-pointer"
								onclick={() => goto(detailRoute(record.id))}
							>
								<Table.Cell>
									<p class="font-medium">{record.unitCode}</p>
									<p class="text-xs text-muted-foreground">
										{record.productName} · {record.variantName}
									</p>
								</Table.Cell><Table.Cell class="max-w-xs">
									<p class="truncate text-sm">{record.issue}</p>
									<p class="text-xs text-muted-foreground">{record.source}</p>
								</Table.Cell><Table.Cell>
									<span
										class="rounded-full px-2.5 py-1 text-xs font-medium {record.damageLevel ===
										'Berat'
											? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
											: record.damageLevel === 'Sedang'
												? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
												: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'}"
									>
										{record.damageLevel}
									</span>
								</Table.Cell><Table.Cell>{record.assignee}</Table.Cell><Table.Cell>
									<p>{rupiah(record.actualCost || record.estimatedCost)}</p>
									<p class="text-xs text-muted-foreground">
										{record.actualCost ? 'Aktual' : 'Estimasi'}
									</p>
								</Table.Cell><Table.Cell>
									<MaintenanceStatusBadge status={record.status} />
								</Table.Cell><Table.Cell class="text-right">
									<Button
										size="sm"
										variant="outline"
										onclick={(event) => {
											event.stopPropagation();
											goto(detailRoute(record.id));
										}}
									>
										Detail
									</Button>
								</Table.Cell>
							</Table.Row>{/each}
					</Table.Body>
				</Table.Root>
			</div>
			<div class="grid gap-3 p-4 md:hidden">
				{#each filtered as record (record.id)}<a
						href={detailRoute(record.id)}
						class="rounded-xl border p-4 transition-colors hover:bg-muted/40"
					>
						<div class="flex items-start justify-between gap-3">
							<div>
								<p class="font-medium">{record.unitCode}</p>
								<p class="text-xs text-muted-foreground">
									{record.productName} · {record.variantName}
								</p>
							</div>
							<MaintenanceStatusBadge status={record.status} />
						</div>
						<p class="mt-3 line-clamp-2 text-sm text-muted-foreground">{record.issue}</p>
						<div class="mt-4 flex items-center justify-between border-t pt-3 text-sm">
							<span>{record.assignee}</span><strong>
								{rupiah(record.actualCost || record.estimatedCost)}
							</strong>
						</div>
					</a>{/each}
			</div>
			{#if !filtered.length}<div
					class="flex min-h-72 flex-col items-center justify-center text-center"
				>
					<Wrench class="mb-3 size-8 text-muted-foreground" />
					<h2 class="font-semibold">Data perawatan tidak ditemukan</h2>
					<p class="mt-1 text-sm text-muted-foreground">Ubah pencarian atau filter.</p>
				</div>{/if}
		</Card.Content><Card.Footer class="justify-between border-t text-sm text-muted-foreground">
			<span>{filtered.length} pekerjaan perawatan</span><span>Data mock frontend</span>
		</Card.Footer>
	</Card.Root>
</div>
