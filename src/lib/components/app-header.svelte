<script lang="ts">
	import { page } from '$app/state';
	import { Bell, Search } from '@lucide/svelte';
	import * as Sidebar from '#lib/components/ui/sidebar';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import ThemeToggle from './theme-toggle.svelte';

	const title = $derived.by(() => {
		if (page.url.pathname === '/dashboard') return 'Dashboard';
		if (page.url.pathname === '/inventaris/tambah') return 'Tambah Barang';
		if (page.url.pathname.startsWith('/inventaris')) return 'Inventaris';
		if (page.url.pathname === '/transaksi/baru') return 'Transaksi Baru';
		if (page.url.pathname.startsWith('/transaksi')) return 'Transaksi';
		if (page.url.pathname.startsWith('/pengembalian')) return 'Pengembalian';
		if (page.url.pathname.startsWith('/perawatan')) return 'Perawatan';
		if (page.url.pathname === '/pelanggan/tambah') return 'Tambah Pelanggan';
		if (page.url.pathname.startsWith('/pelanggan')) return 'Pelanggan';
		if (page.url.pathname.startsWith('/laporan')) return 'Laporan';
		return 'OutdoorPOS';
	});
</script>

<header
	class="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur md:px-6"
>
	<Sidebar.Trigger />
	<div class="h-5 w-px bg-border"></div>
	<div class="min-w-0 flex-1">
		<p class="truncate text-sm font-semibold">{title}</p>
		<p class="hidden text-xs text-muted-foreground sm:block">OutdoorPOS / {title}</p>
	</div>
	<div class="relative hidden w-full max-w-xs lg:block">
		<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
		<Input class="pl-9" placeholder="Cari barang atau unit..." aria-label="Pencarian global" />
	</div>
	<ThemeToggle />
	<Button variant="ghost" size="icon" aria-label="Notifikasi" class="relative">
		<Bell />
		<span class="absolute top-2 right-2 size-1.5 rounded-full bg-red-500"></span>
	</Button>
</header>
