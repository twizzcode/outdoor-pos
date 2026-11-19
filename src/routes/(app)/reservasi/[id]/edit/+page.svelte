<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { toast } from 'svelte-sonner';
	import ReservationForm from '#lib/components/reservation-form.svelte';
	import { findReservation } from '#lib/reservations/mock-data';
	import type { Reservation } from '#lib/reservations/types';

	const reservation = findReservation(page.params.id ?? '');

	async function save(value: Reservation) {
		toast.success('Reservasi diperbarui', {
			description: 'Perubahan tersimpan selama sesi frontend.'
		});
		await goto(resolve('/(app)/reservasi/[id]', { id: value.id }));
	}
</script>

<svelte:head><title>Edit Reservasi — OutdoorPOS</title></svelte:head>

{#if reservation}
	<div class="space-y-5">
		<div>
			<h1 class="text-2xl font-bold tracking-tight md:text-3xl">Edit {reservation.code}</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Perbarui jadwal, status, atau barang reservasi.
			</p>
		</div>
		<ReservationForm
			{reservation}
			cancelHref={resolve('/(app)/reservasi/[id]', { id: reservation.id })}
			onSave={save}
		/>
	</div>
{:else}
	<div class="rounded-xl border p-8 text-center">
		<h1 class="font-semibold">Reservasi tidak ditemukan</h1>
		<a class="mt-2 inline-block text-sm text-primary underline" href={resolve('/(app)/reservasi')}>
			Kembali ke daftar
		</a>
	</div>
{/if}
