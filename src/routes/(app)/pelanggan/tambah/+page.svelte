<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { ArrowLeft } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button';
	import CustomerForm from '#lib/components/customer-form.svelte';
	import type { Customer } from '#lib/customers/types';

	async function save(customer: Customer) {
		toast.success('Pelanggan berhasil ditambahkan', {
			description: `${customer.code} · ${customer.name}`
		});
		await goto(resolve('/(app)/pelanggan'));
	}
</script>

<svelte:head><title>Tambah Pelanggan — OutdoorPOS</title></svelte:head>

<div class="mx-auto max-w-4xl space-y-6">
	<section class="flex items-start gap-3">
		<Button href={resolve('/(app)/pelanggan')} variant="ghost" size="icon" aria-label="Kembali">
			<ArrowLeft />
		</Button>
		<div>
			<p class="mb-1 text-sm text-muted-foreground">Data penyewa baru</p>
			<h1 class="text-2xl font-bold tracking-tight md:text-3xl">Tambah pelanggan</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Masukkan data yang dibutuhkan untuk transaksi penyewaan.
			</p>
		</div>
	</section>
	<CustomerForm cancelHref={resolve('/(app)/pelanggan')} onSave={save} />
</div>
