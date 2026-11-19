<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '#lib/components/ui/sonner';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>OutdoorPOS — Manajemen Rental</title>
	<meta name="description" content="Manajemen inventaris dan penyewaan perlengkapan outdoor" />
</svelte:head>

<ModeWatcher />
{@render children()}
<Toaster richColors />
