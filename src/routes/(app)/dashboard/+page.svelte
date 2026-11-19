<script lang="ts">
	import {
		ArrowRight,
		Box,
		CalendarDays,
		ClipboardPlus,
		PackageCheck,
		RotateCcw,
		ShoppingBag,
		TriangleAlert,
		Wrench
	} from '@lucide/svelte';
	import { Button } from '#lib/components/ui/button';
	import * as Card from '#lib/components/ui/card';
	import { Progress } from '#lib/components/ui/progress';
	import { Badge } from '#lib/components/ui/badge';
	import StatusBadge from '#lib/components/status-badge.svelte';
	import { inventoryProducts } from '#lib/inventory/mock-data';

	const stats = [
		{ label: 'Total produk', value: '48', detail: '126 unit terdaftar', icon: Box },
		{ label: 'Unit tersedia', value: '87', detail: '69% dari total unit', icon: PackageCheck },
		{ label: 'Sedang disewa', value: '31', detail: '18 transaksi aktif', icon: ShoppingBag },
		{ label: 'Perlu perawatan', value: '8', detail: '3 perlu tindakan cepat', icon: Wrench }
	];

	const distribution = [
		{ label: 'Tersedia', value: 87, percentage: 69 },
		{ label: 'Disewa', value: 31, percentage: 25 },
		{ label: 'Dipesan', value: 5, percentage: 4 },
		{ label: 'Perawatan', value: 3, percentage: 2 }
	];

	const activities = [
		{ title: 'Stok Tenda Dome diperbarui', detail: 'Admin menambah 2 unit', time: '12 menit lalu' },
		{
			title: 'Unit CAR-CS60-B-02 masuk perawatan',
			detail: 'Resleting utama perlu diperiksa',
			time: '1 jam lalu'
		},
		{
			title: 'Varian Sepatu Hiking ditambahkan',
			detail: 'Ukuran 41 / Cokelat',
			time: '3 jam lalu'
		},
		{ title: 'Headlamp mencapai batas stok', detail: 'Tersisa 2 unit tersedia', time: 'Kemarin' }
	];

	const today = new Intl.DateTimeFormat('id-ID', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(new Date());
</script>

<svelte:head><title>Dashboard — OutdoorPOS</title></svelte:head>

<div class="space-y-6">
	<section class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p class="mb-1 text-sm text-muted-foreground">Ringkasan operasional</p>
			<h1 class="text-2xl font-bold tracking-tight md:text-3xl">Selamat datang kembali</h1>
			<p class="mt-1 text-sm text-muted-foreground">Pantau inventaris rental dari satu tempat.</p>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<Badge variant="outline" class="h-9 gap-2 px-3 font-normal">
				<CalendarDays class="size-4" />{today}
			</Badge>
			<Button href="/inventaris/tambah"><ClipboardPlus />Tambah Barang</Button>
		</div>
	</section>

	<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan inventaris">
		{#each stats as stat (stat.label)}
			<Card.Root class="py-5">
				<Card.Content class="flex items-start justify-between px-5">
					<div>
						<p class="text-sm text-muted-foreground">{stat.label}</p>
						<p class="mt-2 text-3xl font-bold tracking-tight">{stat.value}</p>
						<p class="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
					</div>
					<span class="flex size-10 items-center justify-center rounded-xl bg-muted">
						<stat.icon class="size-5" />
					</span>
				</Card.Content>
			</Card.Root>
		{/each}
	</section>

	<section class="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
		<Card.Root>
			<Card.Header>
				<Card.Title>Kondisi inventaris</Card.Title>
				<Card.Description>Distribusi 126 unit yang tercatat saat ini.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-5">
				{#each distribution as item (item.label)}
					<div>
						<div class="mb-2 flex items-center justify-between text-sm">
							<span class="font-medium">{item.label}</span>
							<span class="text-muted-foreground">{item.value} unit · {item.percentage}%</span>
						</div>
						<Progress value={item.percentage} class="h-2" />
					</div>
				{/each}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Aktivitas terbaru</Card.Title>
				<Card.Description>Perubahan inventaris terakhir.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-5">
					{#each activities as activity (activity.title)}
						<div class="flex gap-3">
							<span class="mt-1 size-2 shrink-0 rounded-full bg-foreground"></span>
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium">{activity.title}</p>
								<p class="text-xs text-muted-foreground">{activity.detail}</p>
							</div>
							<span class="shrink-0 text-xs text-muted-foreground">{activity.time}</span>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<section class="grid gap-4 lg:grid-cols-[1fr_320px]">
		<Card.Root>
			<Card.Header class="flex-row items-center justify-between">
				<div>
					<Card.Title>Stok perlu perhatian</Card.Title>
					<Card.Description>
						Barang dengan ketersediaan rendah atau sedang dirawat.
					</Card.Description>
				</div>
				<Button href="/inventaris" variant="ghost" size="sm">Lihat semua <ArrowRight /></Button>
			</Card.Header>
			<Card.Content class="space-y-3">
				{#each inventoryProducts
					.filter((product) => product.status !== 'Tersedia')
					.slice(0, 3) as product (product.id)}
					<div class="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center">
						<span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
							<TriangleAlert class="size-5" />
						</span>
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-medium">{product.name}</p>
							<p class="text-xs text-muted-foreground">
								{product.variants.reduce((sum, item) => sum + item.available, 0)} tersedia dari {product.variants.reduce(
									(sum, item) => sum + item.stock,
									0
								)} unit
							</p>
						</div>
						<StatusBadge status={product.status} />
					</div>
				{/each}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header><Card.Title>Aksi cepat</Card.Title></Card.Header>
			<Card.Content class="grid gap-2">
				<Button href="/inventaris/tambah" class="justify-start">
					<ClipboardPlus />Tambah barang
				</Button>
				<Button href="/inventaris" variant="outline" class="justify-start">
					<Box />Lihat inventaris
				</Button>
				<Button variant="outline" class="justify-start" disabled>
					<RotateCcw />Catat pengembalian
				</Button>
			</Card.Content>
		</Card.Root>
	</section>
</div>
