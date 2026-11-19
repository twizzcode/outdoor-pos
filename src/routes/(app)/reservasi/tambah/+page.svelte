<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { CalendarPlus } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import ReservationForm from '#lib/components/reservation-form.svelte';
	import type { Reservation } from '#lib/reservations/types';

	async function save(reservation: Reservation) {
		toast.success('Reservasi berhasil dibuat', {
			description: `${reservation.code} · Data frontend sementara.`
		});
		await goto(resolve('/(app)/reservasi'));
	}
</script>

<svelte:head><title>Reservasi Baru — OutdoorPOS</title></svelte:head>

<div class="space-y-5">
	<section class="flex items-start gap-3">
		<span
			class="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"
		>
			<CalendarPlus class="size-5" />
		</span>
		<div>
			<h1 class="text-2xl font-bold tracking-tight md:text-3xl">Reservasi baru</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Pilih pelanggan, jadwal, dan barang yang dipesan.
			</p>
		</div>
	</section>
	<ReservationForm cancelHref={resolve('/(app)/reservasi')} onSave={save} />
</div>
