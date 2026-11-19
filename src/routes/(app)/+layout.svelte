<script lang="ts">
	import type { LayoutProps } from './$types';
	import * as Sidebar from '#lib/components/ui/sidebar';
	import AppSidebar from '#lib/components/app-sidebar.svelte';
	import AppHeader from '#lib/components/app-header.svelte';

	let { children }: LayoutProps = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset class="min-w-0 overflow-hidden">
		<AppHeader />
		<main class="flex-1 bg-muted/30 p-4 md:p-6 lg:p-8">
			<div class="mx-auto w-full max-w-[1440px]">{@render children()}</div>
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
