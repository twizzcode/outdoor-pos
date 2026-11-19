<script lang="ts">
	import {
		BarChart3,
		Banknote,
		CalendarDays,
		Download,
		PackageCheck,
		ReceiptText,
		TrendingUp,
		Wrench
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { BarChart } from 'layerchart';
	import { Button } from '#lib/components/ui/button';
	import * as Card from '#lib/components/ui/card';
	import * as Table from '#lib/components/ui/table';
	import * as Chart from '#lib/components/ui/chart';
	import { rupiah } from '#lib/inventory/mock-data';
	import { reportSummary } from '#lib/reports/calculation';
	import { reportData } from '#lib/reports/mock-data';
	import type { ReportPeriod } from '#lib/reports/types';

	let period = $state<ReportPeriod>('30 hari');
	let detail = $state('Produk');
	const periods: ReportPeriod[] = ['7 hari', '30 hari', '6 bulan'];
	const data = $derived(reportData[period]);
	const summary = $derived(reportSummary(data));
	const maxStatus = $derived(Math.max(...data.status.map((item) => item.count), 1));
	const revenueConfig = {
		revenue: { label: 'Pendapatan', color: 'var(--chart-2)' },
		transactions: { label: 'Transaksi', color: 'var(--chart-4)' }
	} satisfies Chart.ChartConfig;
	const maintenanceConfig = {
		cost: { label: 'Biaya perawatan', color: 'var(--chart-3)' }
	} satisfies Chart.ChartConfig;

	function exportReport() {
		toast.success('Export laporan disiapkan', {
			description: 'Mode frontend belum menghasilkan file CSV.'
		});
	}
</script>

<svelte:head><title>Laporan — OutdoorPOS</title></svelte:head>

<div class="space-y-6">
	<section class="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
		<div>
			<p class="mb-1 text-sm text-muted-foreground">Analitik operasional admin</p>
			<h1 class="text-2xl font-bold tracking-tight md:text-3xl">Laporan</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Pendapatan, transaksi, performa inventaris, dan biaya perawatan.
			</p>
		</div>
		<div class="flex flex-wrap gap-2">
			<div class="flex rounded-full bg-muted p-1">
				{#each periods as item (item)}<button
						class="h-8 rounded-full px-3 text-sm font-medium transition-colors {period === item
							? 'bg-background shadow-sm'
							: 'text-muted-foreground hover:text-foreground'}"
						onclick={() => (period = item)}
					>
						{item}
					</button>{/each}
			</div>
			<Button variant="outline" onclick={exportReport}><Download />Export</Button>
		</div>
	</section>

	<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
		{#each [{ label: 'Pendapatan', value: rupiah(summary.revenue), detail: `Periode ${period}`, icon: Banknote }, { label: 'Transaksi', value: summary.transactions, detail: 'Transaksi tercatat', icon: ReceiptText }, { label: 'Rata-rata transaksi', value: rupiah(summary.averageOrder), detail: 'Nilai sewa per transaksi', icon: TrendingUp }, { label: 'Utilisasi', value: `${summary.averageUtilization}%`, detail: 'Rata-rata produk teratas', icon: PackageCheck }, { label: 'Biaya perawatan', value: rupiah(summary.maintenanceCost), detail: 'Semua pekerjaan', icon: Wrench }] as stat (stat.label)}
			<Card.Root class="py-5">
				<Card.Content class="flex items-start justify-between px-5">
					<div class="min-w-0">
						<p class="text-sm text-muted-foreground">{stat.label}</p>
						<p class="mt-2 truncate text-xl font-bold tracking-tight">{stat.value}</p>
						<p class="mt-1 truncate text-xs text-muted-foreground">{stat.detail}</p>
					</div>
					<span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
						<stat.icon class="size-5" />
					</span>
				</Card.Content>
			</Card.Root>
		{/each}
	</section>

	<section class="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
		<Card.Root>
			<Card.Header>
				<div class="flex items-start justify-between gap-3">
					<div>
						<Card.Title>Tren pendapatan</Card.Title><Card.Description>
							Pendapatan sewa dan jumlah transaksi selama {period}.
						</Card.Description>
					</div>
					<span class="flex items-center gap-2 text-xs text-muted-foreground">
						<span class="size-2.5 rounded-sm bg-chart-2"></span>Pendapatan
					</span>
				</div>
			</Card.Header><Card.Content>
				<Chart.Container config={revenueConfig} class="aspect-auto h-[300px] w-full">
					<BarChart
						data={data.revenue}
						x="label"
						axis="x"
						series={[
							{
								key: 'revenue',
								label: revenueConfig.revenue.label,
								color: revenueConfig.revenue.color
							}
						]}
						bandPadding={0.35}
						props={{
							yAxis: { format: (value) => `${Math.round(Number(value) / 1_000_000)}jt` },
							bars: { radius: 6 }
						}}
					>
						{#snippet tooltip()}<Chart.Tooltip labelKey="label">
								{#snippet formatter({ value, name })}<div
										class="flex min-w-36 items-center justify-between gap-4"
									>
										<span class="text-muted-foreground">{name}</span><strong>
											{rupiah(Number(value))}
										</strong>
									</div>{/snippet}
							</Chart.Tooltip>{/snippet}
					</BarChart>
				</Chart.Container>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Status transaksi</Card.Title><Card.Description>
					Komposisi status transaksi pada data laporan.
				</Card.Description>
			</Card.Header><Card.Content class="space-y-5">
				{#each data.status as item, index (item.status)}<div class="space-y-2">
						<div class="flex items-center justify-between text-sm">
							<span class="font-medium">{item.status}</span><strong>{item.count}</strong>
						</div>
						<div class="h-2.5 overflow-hidden rounded-full bg-muted">
							<div
								class="h-full rounded-full transition-all"
								style={`width: ${(item.count / maxStatus) * 100}%; background: var(--chart-${index + 1})`}
							></div>
						</div>
					</div>{/each}
				<div class="grid grid-cols-2 gap-3 border-t pt-4 text-sm">
					<div>
						<p class="text-xs text-muted-foreground">Total status</p>
						<p class="mt-1 text-lg font-bold">
							{data.status.reduce((sum, item) => sum + item.count, 0)}
						</p>
					</div>
					<div>
						<p class="text-xs text-muted-foreground">Terlambat</p>
						<p class="mt-1 text-lg font-bold text-red-600">
							{data.status.find((item) => item.status === 'Terlambat')?.count ?? 0}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<section class="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,1fr)]">
		<Card.Root>
			<Card.Header>
				<Card.Title>Produk teratas</Card.Title><Card.Description>
					Pendapatan dan tingkat pemakaian inventaris.
				</Card.Description>
			</Card.Header><Card.Content class="px-0">
				<div class="overflow-x-auto">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Produk</Table.Head><Table.Head>Penyewaan</Table.Head><Table.Head>
									Pendapatan
								</Table.Head><Table.Head>Utilisasi</Table.Head>
							</Table.Row>
						</Table.Header><Table.Body>
							{#each data.products as product, index (product.name)}<Table.Row>
									<Table.Cell>
										<div class="flex items-center gap-3">
											<span
												class="flex size-7 items-center justify-center rounded-lg bg-muted text-xs font-bold"
											>
												{index + 1}
											</span>
											<div>
												<p class="font-medium">{product.name}</p>
												<p class="text-xs text-muted-foreground">{product.category}</p>
											</div>
										</div>
									</Table.Cell><Table.Cell>{product.rentals} kali</Table.Cell><Table.Cell
										class="font-medium"
									>
										{rupiah(product.revenue)}
									</Table.Cell><Table.Cell>
										<div class="flex min-w-32 items-center gap-2">
											<div class="h-2 flex-1 overflow-hidden rounded-full bg-muted">
												<div
													class="h-full rounded-full bg-primary"
													style={`width: ${product.utilization}%`}
												></div>
											</div>
											<span class="w-9 text-right text-xs font-medium">{product.utilization}%</span>
										</div>
									</Table.Cell>
								</Table.Row>{/each}
						</Table.Body>
					</Table.Root>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Biaya perawatan</Card.Title><Card.Description>
					Distribusi biaya berdasarkan kelompok barang.
				</Card.Description>
			</Card.Header><Card.Content>
				<Chart.Container config={maintenanceConfig} class="aspect-auto h-[280px] w-full">
					<BarChart
						data={data.maintenance}
						x="label"
						axis="x"
						series={[
							{
								key: 'cost',
								label: maintenanceConfig.cost.label,
								color: maintenanceConfig.cost.color
							}
						]}
						bandPadding={0.4}
						props={{
							yAxis: { format: (value) => `${Math.round(Number(value) / 1_000)}rb` },
							bars: { radius: 6 }
						}}
					>
						{#snippet tooltip()}<Chart.Tooltip labelKey="label">
								{#snippet formatter({ value, name })}<div
										class="flex min-w-40 items-center justify-between gap-4"
									>
										<span class="text-muted-foreground">{name}</span><strong>
											{rupiah(Number(value))}
										</strong>
									</div>{/snippet}
							</Chart.Tooltip>{/snippet}
					</BarChart>
				</Chart.Container>
			</Card.Content>
		</Card.Root>
	</section>

	<Card.Root>
		<Card.Header class="flex-row items-start justify-between">
			<div>
				<Card.Title>Rincian laporan</Card.Title><Card.Description>
					Tampilan operasional berdasarkan kategori data.
				</Card.Description>
			</div>
			<select
				bind:value={detail}
				aria-label="Jenis rincian laporan"
				class="h-9 rounded-xl border bg-background px-3 text-sm"
			>
				<option>Produk</option><option>Transaksi</option><option>Perawatan</option>
			</select>
		</Card.Header><Card.Content>
			{#if detail === 'Produk'}<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.products as product (product.name)}<div class="rounded-xl border p-4">
							<div class="flex items-start justify-between gap-2">
								<div>
									<p class="font-medium">{product.name}</p>
									<p class="text-xs text-muted-foreground">{product.category}</p>
								</div>
								<BarChart3 class="size-4 text-muted-foreground" />
							</div>
							<div class="mt-4 grid grid-cols-2 gap-2 border-t pt-3 text-sm">
								<div>
									<p class="text-xs text-muted-foreground">Pendapatan</p>
									<p class="font-semibold">{rupiah(product.revenue)}</p>
								</div>
								<div>
									<p class="text-xs text-muted-foreground">Utilisasi</p>
									<p class="font-semibold">{product.utilization}%</p>
								</div>
							</div>
						</div>{/each}
				</div>{:else if detail === 'Transaksi'}<div
					class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
				>
					{#each data.status as item (item.status)}<div class="rounded-xl border p-4">
							<p class="text-xs text-muted-foreground">{item.status}</p>
							<p class="mt-2 text-2xl font-bold">{item.count}</p>
							<p class="mt-1 text-xs text-muted-foreground">transaksi</p>
						</div>{/each}
				</div>{:else}<div class="space-y-3">
					{#each data.maintenance as item (item.label)}<div
							class="flex items-center justify-between rounded-xl border p-4"
						>
							<span class="flex items-center gap-3">
								<Wrench class="size-4 text-muted-foreground" /><strong>{item.label}</strong>
							</span><span>{rupiah(item.cost)}</span>
						</div>{/each}
				</div>{/if}
		</Card.Content><Card.Footer class="justify-between border-t text-sm text-muted-foreground">
			<span><CalendarDays class="mr-1 inline size-4" />Periode {period}</span><span>
				Data mock frontend
			</span>
		</Card.Footer>
	</Card.Root>
</div>
