<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { ArrowLeft, Users } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button';
	import CustomerForm from '#lib/components/customer-form.svelte';
	import { findCustomer } from '#lib/customers/mock-data';
	import type { Customer } from '#lib/customers/types';

	const customerId = page.params.id ?? '';
	const customer = findCustomer(customerId);
	const detailRoute = resolve('/(app)/pelanggan/[id]', { id: customerId });

	async function save(value: Customer) {
		toast.success('Perubahan pelanggan disimpan', {
			description: `${value.code} · Data mock frontend.`
		});
		await goto(detailRoute);
	}
</script>

<svelte:head><title>Edit {customer?.name ?? 'Pelanggan'} — OutdoorPOS</title></svelte:head>

{#if customer}<div class="mx-auto max-w-4xl space-y-6">
		<section class="flex items-start gap-3">
			<Button href={detailRoute} variant="ghost" size="icon" aria-label="Kembali">
				<ArrowLeft />
			</Button>
			<div>
				<p class="mb-1 text-sm text-muted-foreground">{customer.code}</p>
				<h1 class="text-2xl font-bold tracking-tight md:text-3xl">Edit pelanggan</h1>
				<p class="mt-1 text-sm text-muted-foreground">
					Perbarui identitas, kontak, status, dan catatan.
				</p>
			</div>
		</section>
		<CustomerForm {customer} cancelHref={detailRoute} onSave={save} />
	</div>{:else}<div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
		<Users class="mb-4 size-10 text-muted-foreground" />
		<h1 class="text-xl font-semibold">Pelanggan tidak ditemukan</h1>
		<Button href={resolve('/(app)/pelanggan')} class="mt-5"><ArrowLeft />Kembali</Button>
	</div>{/if}
