<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import {
		ArrowLeft,
		Banknote,
		Box,
		Check,
		CheckCircle2,
		CircleUserRound,
		FileText,
		Printer,
		RotateCcw,
		TriangleAlert,
		Wrench
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import { Label } from '#lib/components/ui/label';
	import { Textarea } from '#lib/components/ui/textarea';
	import { Badge } from '#lib/components/ui/badge';
	import * as Card from '#lib/components/ui/card';
	import * as Dialog from '#lib/components/ui/dialog';
	import ReturnStatusBadge from '#lib/components/return-status-badge.svelte';
	import { rupiah } from '#lib/inventory/mock-data';
	import { lateDays, lateFee, returnFinancials } from '#lib/returns/calculation';
	import { findReturnSummary } from '#lib/returns/mock-data';
	import type { ReturnCondition, ReturnInspection } from '#lib/returns/types';
	import { findTransaction } from '#lib/transactions/mock-data';

	const transactionId = page.params.transactionId ?? '';
	const transaction = findTransaction(transactionId);
	const summary = findReturnSummary(transactionId);
	const conditions: ReturnCondition[] = [
		'Baik',
		'Perlu dibersihkan',
		'Rusak ringan',
		'Rusak berat',
		'Hilang'
	];
	let actualReturnDate = $state(summary?.actualReturnDate ?? '2026-11-21');
	let manualFee = $state(0);
	let manualFeeReason = $state('');
	let paymentMethod = $state('Tunai');
	let finalNotes = $state('');
	let confirmationOpen = $state(false);
	let completed = $state(summary?.status === 'Selesai');
	let submitted = $state(false);

	let inspections = $state<ReturnInspection[]>(
		transaction?.items.flatMap((item) => {
			if (item.unitCodes.length) {
				return item.unitCodes.map((unitCode, index) => ({
					id: `${item.id}-${index}`,
					rentalItemId: item.id,
					productName: item.productName,
					variantName: item.variantName,
					unitCode,
					expectedQuantity: 1,
					returnedQuantity: 1,
					lostQuantity: 0,
					condition: 'Baik' as const,
					damageFee: 0,
					lostFee: 0,
					notes: '',
					inspected: completed
				}));
			}
			return [
				{
					id: item.id,
					rentalItemId: item.id,
					productName: item.productName,
					variantName: item.variantName,
					expectedQuantity: item.quantity,
					returnedQuantity: item.quantity,
					lostQuantity: 0,
					condition: 'Baik' as const,
					damageFee: 0,
					lostFee: 0,
					notes: '',
					inspected: completed
				}
			];
		}) ?? []
	);

	const daysLate = $derived(transaction ? lateDays(transaction.returnDate, actualReturnDate) : 0);
	const lateCharge = $derived(transaction ? lateFee(transaction.items, daysLate) : 0);
	const damageCharge = $derived(
		inspections.reduce((sum, item) => sum + Math.max(0, Number(item.damageFee) || 0), 0)
	);
	const lostCharge = $derived(
		inspections.reduce((sum, item) => sum + Math.max(0, Number(item.lostFee) || 0), 0)
	);
	const financials = $derived(
		returnFinancials(
			transaction?.deposit ?? 0,
			lateCharge,
			damageCharge,
			lostCharge,
			Number(manualFee) || 0
		)
	);
	const inspectedCount = $derived(inspections.filter((item) => item.inspected).length);
	const maintenanceCount = $derived(
		inspections.filter((item) =>
			['Perlu dibersihkan', 'Rusak ringan', 'Rusak berat'].includes(item.condition)
		).length
	);
	const lostCount = $derived(inspections.reduce((sum, item) => sum + item.lostQuantity, 0));

	function changeCondition(inspection: ReturnInspection) {
		if (inspection.condition === 'Hilang') {
			inspection.returnedQuantity = 0;
			inspection.lostQuantity = inspection.expectedQuantity;
		} else {
			inspection.returnedQuantity = inspection.expectedQuantity;
			inspection.lostQuantity = 0;
			inspection.lostFee = 0;
		}
		if (inspection.condition === 'Baik' || inspection.condition === 'Perlu dibersihkan')
			inspection.damageFee = 0;
	}

	function markInspected(inspection: ReturnInspection) {
		if (inspection.returnedQuantity + inspection.lostQuantity !== inspection.expectedQuantity) {
			toast.error('Jumlah kembali dan hilang harus sesuai jumlah disewa');
			return;
		}
		if (inspection.condition !== 'Baik' && !inspection.notes.trim()) {
			toast.error('Tambahkan catatan untuk kondisi bermasalah');
			return;
		}
		inspection.inspected = true;
		toast.success('Pemeriksaan barang disimpan', {
			description: inspection.unitCode ?? inspection.productName
		});
	}

	function reviewReturn() {
		if (inspectedCount !== inspections.length)
			return toast.error('Periksa seluruh barang sebelum menyelesaikan');
		if (Number(manualFee) > 0 && !manualFeeReason.trim())
			return toast.error('Alasan biaya manual wajib diisi');
		confirmationOpen = true;
	}

	function finishReturn() {
		confirmationOpen = false;
		completed = true;
		submitted = true;
		toast.success('Pengembalian berhasil diselesaikan', {
			description: `RTN-${transaction?.code.replace('RNT-', '')}`
		});
	}

	function printReceipt() {
		toast.success('Bukti pengembalian siap dicetak');
		window.print();
	}

	function beforeUnload(event: BeforeUnloadEvent) {
		if (!submitted && !completed && inspections.some((item) => item.inspected))
			event.preventDefault();
	}
</script>

<svelte:window onbeforeunload={beforeUnload} />
<svelte:head>
	<title
		>{transaction ? `Pengembalian ${transaction.code}` : 'Pengembalian tidak ditemukan'} — OutdoorPOS</title
	>
</svelte:head>

{#if transaction && summary}
	<div class="space-y-6 print:bg-white print:text-black">
		<section class="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
			<div class="flex items-start gap-3">
				<Button
					href={resolve('/(app)/pengembalian')}
					variant="ghost"
					size="icon"
					aria-label="Kembali"
					class="print:hidden"
				>
					<ArrowLeft />
				</Button>
				<div>
					<div class="mb-2 flex flex-wrap items-center gap-2">
						<h1 class="text-2xl font-bold tracking-tight md:text-3xl">
							{completed ? 'Bukti pengembalian' : 'Proses pengembalian'}
						</h1>
						<ReturnStatusBadge status={completed ? 'Selesai' : summary.status} />
					</div>
					<p class="text-sm text-muted-foreground">
						{transaction.code} · {transaction.customerName}
					</p>
				</div>
			</div>
			{#if completed}<Button onclick={printReceipt} class="print:hidden">
					<Printer />Cetak bukti
				</Button>{/if}
		</section>

		{#if completed}<div
				class="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
			>
				<CheckCircle2 class="size-5 shrink-0" />
				<div>
					<p class="font-semibold">Pengembalian selesai</p>
					<p>
						RTN-{transaction.code.replace('RNT-', '')} · {summary.completedAt ??
							'21 Nov 2026, 16.20'}
					</p>
				</div>
			</div>{/if}

		<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each [{ label: 'Pelanggan', value: transaction.customerName, detail: transaction.customerPhone, icon: CircleUserRound }, { label: 'Jadwal kembali', value: transaction.returnDate, detail: `${transaction.items.reduce((sum, item) => sum + item.quantity, 0)} unit disewa`, icon: RotateCcw }, { label: 'Keterlambatan', value: `${daysLate} hari`, detail: daysLate ? rupiah(lateCharge) : 'Tepat waktu', icon: TriangleAlert }, { label: 'Deposit', value: rupiah(transaction.deposit), detail: completed ? 'Sudah diselesaikan' : 'Ditahan sementara', icon: Banknote }] as stat (stat.label)}
				<Card.Root class="py-5">
					<Card.Content class="flex items-start justify-between px-5">
						<div class="min-w-0">
							<p class="text-sm text-muted-foreground">{stat.label}</p>
							<p class="mt-2 truncate text-xl font-bold">{stat.value}</p>
							<p class="mt-1 truncate text-xs text-muted-foreground">{stat.detail}</p>
						</div>
						<span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
							<stat.icon class="size-5" />
						</span>
					</Card.Content>
				</Card.Root>
			{/each}
		</section>

		<div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
			<div class="space-y-4">
				<Card.Root>
					<Card.Header>
						<Card.Title>Pemeriksaan barang</Card.Title><Card.Description>
							{completed
								? 'Hasil akhir kondisi barang yang dikembalikan.'
								: `${inspectedCount} dari ${inspections.length} baris sudah diperiksa.`}
						</Card.Description>
					</Card.Header><Card.Content class="space-y-4">
						{#each inspections as inspection, index (inspection.id)}
							<article class="rounded-2xl border p-4 {inspection.inspected ? 'bg-muted/30' : ''}">
								<div class="mb-4 flex items-start justify-between gap-3">
									<div class="flex items-start gap-3">
										<span
											class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted"
										>
											{#if inspection.condition === 'Baik'}<Box class="size-4" />{:else}<Wrench
													class="size-4"
												/>{/if}
										</span>
										<div>
											<p class="font-medium">{inspection.productName}</p>
											<p class="text-xs text-muted-foreground">
												{inspection.variantName}{inspection.unitCode
													? ` · ${inspection.unitCode}`
													: ''}
											</p>
										</div>
									</div>
									{#if inspection.inspected}<Badge><Check />Diperiksa</Badge>{:else}<Badge
											variant="outline"
										>
											Belum diperiksa
										</Badge>{/if}
								</div>
								<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
									<div>
										<Label for={`condition-${index}`} class="mb-2">Kondisi kembali</Label><select
											id={`condition-${index}`}
											bind:value={inspection.condition}
											onchange={() => changeCondition(inspection)}
											disabled={completed}
											class="h-9 w-full rounded-xl border bg-background px-3 text-sm disabled:opacity-60"
										>
											{#each conditions as condition (condition)}<option>{condition}</option>{/each}
										</select>
									</div>
									<div>
										<Label for={`returned-${index}`} class="mb-2">Jumlah kembali</Label><Input
											id={`returned-${index}`}
											type="number"
											min="0"
											max={inspection.expectedQuantity}
											bind:value={inspection.returnedQuantity}
											disabled={completed || Boolean(inspection.unitCode)}
										/>
									</div>
									<div>
										<Label for={`lost-${index}`} class="mb-2">Jumlah hilang</Label><Input
											id={`lost-${index}`}
											type="number"
											min="0"
											max={inspection.expectedQuantity}
											bind:value={inspection.lostQuantity}
											disabled={completed || Boolean(inspection.unitCode)}
										/>
									</div>
									<div>
										<Label class="mb-2">Jumlah disewa</Label>
										<div class="flex h-9 items-center text-sm font-semibold">
											{inspection.expectedQuantity} unit
										</div>
									</div>
								</div>
								<div class="mt-4 grid gap-4 sm:grid-cols-2">
									<div>
										<Label for={`damage-${index}`} class="mb-2">Biaya kerusakan</Label><Input
											id={`damage-${index}`}
											type="number"
											min="0"
											bind:value={inspection.damageFee}
											disabled={completed ||
												!['Rusak ringan', 'Rusak berat'].includes(inspection.condition)}
										/>
									</div>
									<div>
										<Label for={`loss-${index}`} class="mb-2">Biaya kehilangan</Label><Input
											id={`loss-${index}`}
											type="number"
											min="0"
											bind:value={inspection.lostFee}
											disabled={completed || inspection.condition !== 'Hilang'}
										/>
									</div>
									<div class="sm:col-span-2">
										<Label for={`notes-${index}`} class="mb-2">Catatan pemeriksaan</Label><Textarea
											id={`notes-${index}`}
											bind:value={inspection.notes}
											rows={2}
											disabled={completed}
											placeholder="Wajib untuk barang bermasalah atau hilang..."
										/>
									</div>
								</div>
								{#if !completed}<div class="mt-4 flex justify-end">
										<Button
											size="sm"
											variant={inspection.inspected ? 'outline' : 'default'}
											onclick={() => markInspected(inspection)}
										>
											<Check />{inspection.inspected
												? 'Perbarui pemeriksaan'
												: 'Simpan pemeriksaan'}
										</Button>
									</div>{/if}
							</article>
						{/each}
					</Card.Content>
				</Card.Root>
			</div>

			<aside class="space-y-4 xl:sticky xl:top-20 xl:h-fit">
				{#if !completed}<Card.Root>
						<Card.Header>
							<Card.Title>Tanggal aktual</Card.Title><Card.Description>
								Menentukan jumlah hari keterlambatan.
							</Card.Description>
						</Card.Header><Card.Content>
							<Label for="actual-date" class="mb-2">Tanggal barang kembali</Label><Input
								id="actual-date"
								type="date"
								min={transaction.startDate}
								bind:value={actualReturnDate}
							/>
						</Card.Content>
					</Card.Root>{/if}

				<Card.Root>
					<Card.Header><Card.Title>Ringkasan penyelesaian</Card.Title></Card.Header><Card.Content
						class="space-y-3 text-sm"
					>
						<div class="flex justify-between text-muted-foreground">
							<span>Biaya keterlambatan</span><span>{rupiah(lateCharge)}</span>
						</div>
						<div class="flex justify-between text-muted-foreground">
							<span>Biaya kerusakan</span><span>{rupiah(damageCharge)}</span>
						</div>
						<div class="flex justify-between text-muted-foreground">
							<span>Biaya kehilangan</span><span>{rupiah(lostCharge)}</span>
						</div>
						{#if !completed}<div class="space-y-2 border-y py-3">
								<Label for="manual-fee">Biaya manual</Label><Input
									id="manual-fee"
									type="number"
									min="0"
									bind:value={manualFee}
								/><Input
									aria-label="Alasan biaya manual"
									bind:value={manualFeeReason}
									placeholder="Alasan biaya manual..."
								/>
							</div>{:else}<div class="flex justify-between text-muted-foreground">
								<span>Biaya manual</span><span>{rupiah(Number(manualFee) || 0)}</span>
							</div>{/if}
						<div class="flex justify-between border-t pt-3 font-semibold">
							<span>Total biaya</span><span>{rupiah(financials.charges)}</span>
						</div>
						<div class="flex justify-between text-muted-foreground">
							<span>Deposit tersedia</span><span>{rupiah(transaction.deposit)}</span>
						</div>
						<div
							class="flex justify-between rounded-xl bg-emerald-50 p-3 font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
						>
							<span>Deposit kembali</span><span>{rupiah(financials.depositRefund)}</span>
						</div>
						<div
							class="flex justify-between rounded-xl bg-red-50 p-3 font-semibold text-red-700 dark:bg-red-950 dark:text-red-300"
						>
							<span>Tagihan tambahan</span><span>{rupiah(financials.additionalPayment)}</span>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header><Card.Title>Hasil inventaris</Card.Title></Card.Header><Card.Content
						class="space-y-3 text-sm"
					>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Siap tersedia</span><strong>
								{Math.max(0, inspections.length - maintenanceCount - lostCount)}
							</strong>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Masuk perawatan</span><strong>
								{maintenanceCount}
							</strong>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Hilang</span><strong>{lostCount}</strong>
						</div>
					</Card.Content>
				</Card.Root>

				{#if !completed}<Button
						class="w-full"
						size="lg"
						onclick={reviewReturn}
						disabled={!inspections.length}
					>
						Tinjau dan selesaikan
					</Button>{/if}
			</aside>
		</div>

		<footer class="hidden border-t pt-6 text-center text-xs print:block">
			<p class="font-bold">OutdoorPOS · Bukti Pengembalian</p>
			<p>RTN-{transaction.code.replace('RNT-', '')} · {transaction.customerName}</p>
		</footer>
	</div>

	<Dialog.Root bind:open={confirmationOpen}>
		<Dialog.Content class="sm:max-w-lg">
			<Dialog.Header>
				<Dialog.Title>Selesaikan pengembalian?</Dialog.Title><Dialog.Description>
					Perubahan mock akan menandai transaksi selesai sampai halaman dimuat ulang.
				</Dialog.Description>
			</Dialog.Header>
			<div class="space-y-4">
				<div class="grid grid-cols-3 gap-3 rounded-xl bg-muted p-4 text-center">
					<div>
						<p class="text-xl font-bold">{inspections.length - maintenanceCount - lostCount}</p>
						<p class="text-xs text-muted-foreground">Tersedia</p>
					</div>
					<div>
						<p class="text-xl font-bold">{maintenanceCount}</p>
						<p class="text-xs text-muted-foreground">Perawatan</p>
					</div>
					<div>
						<p class="text-xl font-bold">{lostCount}</p>
						<p class="text-xs text-muted-foreground">Hilang</p>
					</div>
				</div>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span>Total biaya</span><strong>{rupiah(financials.charges)}</strong>
					</div>
					<div class="flex justify-between">
						<span>Deposit kembali</span><strong>{rupiah(financials.depositRefund)}</strong>
					</div>
					<div class="flex justify-between">
						<span>Tagihan tambahan</span><strong>{rupiah(financials.additionalPayment)}</strong>
					</div>
				</div>
				{#if financials.additionalPayment > 0}<div>
						<Label for="settlement-method" class="mb-2">Metode pembayaran tambahan</Label><select
							id="settlement-method"
							bind:value={paymentMethod}
							class="h-9 w-full rounded-xl border bg-background px-3 text-sm"
						>
							<option>Tunai</option><option>Transfer</option><option>QRIS</option>
						</select>
					</div>{/if}
				<div>
					<Label for="final-notes" class="mb-2">Catatan akhir</Label><Textarea
						id="final-notes"
						bind:value={finalNotes}
						rows={2}
						placeholder="Opsional..."
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (confirmationOpen = false)}>Kembali</Button><Button
					onclick={finishReturn}
				>
					<Check />Selesaikan pengembalian
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
		<FileText class="mb-4 size-10 text-muted-foreground" />
		<h1 class="text-xl font-semibold">Pengembalian tidak ditemukan</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Transaksi ini tidak punya data pengembalian mock.
		</p>
		<Button href={resolve('/(app)/pengembalian')} class="mt-5">
			<ArrowLeft />Kembali ke daftar
		</Button>
	</div>
{/if}
