<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import {
		Archive,
		BarChart3,
		CalendarClock,
		ClipboardPlus,
		LayoutDashboard,
		PackageCheck,
		RotateCcw,
		Settings,
		ShoppingBasket,
		TentTree,
		Users
	} from '@lucide/svelte';
	import * as Sidebar from '#lib/components/ui/sidebar';
	import { Badge } from '#lib/components/ui/badge';
	import { Avatar, AvatarFallback } from '#lib/components/ui/avatar';

	const mainItems = [
		{ title: 'Dashboard', href: '/dashboard', route: '/(app)/dashboard', icon: LayoutDashboard },
		{ title: 'Reservasi', href: '/reservasi', route: '/(app)/reservasi', icon: CalendarClock },
		{ title: 'Transaksi', href: '/transaksi', route: '/(app)/transaksi', icon: ShoppingBasket },
		{ title: 'Pengembalian', href: '/pengembalian', route: '/(app)/pengembalian', icon: RotateCcw },
		{ title: 'Perawatan', href: '/perawatan', route: '/(app)/perawatan', icon: PackageCheck },
		{ title: 'Pelanggan', href: '/pelanggan', route: '/(app)/pelanggan', icon: Users },
		{ title: 'Laporan', href: '/laporan', route: '/(app)/laporan', icon: BarChart3 },
		{ title: 'Semua Barang', href: '/inventaris', route: '/(app)/inventaris', icon: Archive },
		{
			title: 'Tambah Barang',
			href: '/inventaris/tambah',
			route: '/(app)/inventaris/tambah',
			icon: ClipboardPlus
		}
	] as const;
</script>

<Sidebar.Root collapsible="icon" variant="inset">
	<Sidebar.Header class="border-b">
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg" tooltipContent="OutdoorPOS">
					{#snippet child({ props })}
						<a href={resolve('/(app)/dashboard')} {...props}>
							<span
								class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
							>
								<TentTree class="size-5" />
							</span>
							<span class="grid flex-1 text-left leading-tight">
								<span class="truncate font-semibold">OutdoorPOS</span>
								<span class="truncate text-xs text-muted-foreground">Manajemen Rental</span>
							</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Operasional</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each mainItems as item (item.href)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								isActive={page.url.pathname === item.href ||
									page.url.pathname.startsWith(`${item.href}/`)}
								tooltipContent={item.title}
							>
								{#snippet child({ props })}
									<a href={resolve(item.route)} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer class="border-t">
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton tooltipContent="Pengaturan">
					<Settings />
					<span>Pengaturan</span>
					<Badge variant="outline" class="ml-auto group-data-[collapsible=icon]:hidden">
						Segera
					</Badge>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg" tooltipContent="Admin OutdoorPOS">
					<Avatar class="size-8 rounded-lg">
						<AvatarFallback class="rounded-lg">AO</AvatarFallback>
					</Avatar>
					<span class="grid flex-1 text-left leading-tight">
						<span class="truncate font-medium">Admin OutdoorPOS</span>
						<span class="truncate text-xs text-muted-foreground">admin@outdoorpos.id</span>
					</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
