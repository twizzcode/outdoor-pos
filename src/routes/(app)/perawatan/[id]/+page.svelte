<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import {
		ArrowLeft,
		Banknote,
		Box,
		Check,
		CircleUserRound,
		FileText,
		MapPin,
		PackageCheck,
		Printer,
		ShieldAlert,
		Wrench
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import { Label } from '#lib/components/ui/label';
	import { Textarea } from '#lib/components/ui/textarea';
	import * as Card from '#lib/components/ui/card';
	import * as Dialog from '#lib/components/ui/dialog';
	import MaintenanceStatusBadge from '#lib/components/maintenance-status-badge.svelte';
	import { rupiah } from '#lib/inventory/mock-data';
	import { findMaintenanceRecord } from '#lib/maintenance/mock-data';
	import type { DamageLevel, MaintenanceStatus } from '#lib/maintenance/types';

	const original = findMaintenanceRecord(page.params.id ?? '');
	let record = $state(original ? structuredClone(original) : undefined);
	let releaseOpen = $state(false);
	let retireOpen = $state(false);
	let submitted = $state(false);
	let destination = $state('Rak inventaris asal');
	const statuses: MaintenanceStatus[] = [
		'Menunggu pemeriksaan',
		'Menunggu perbaikan',
		'Sedang dikerjakan',
		'Selesai',
		'Tidak dapat diperbaiki'
	];
	const damageLevels: DamageLevel[] = ['Ringan', 'Sedang', 'Berat'];

	const timeline = $derived(
		record
			? [
					{ label: 'Masalah dilaporkan', detail: record.reportedAt, done: true },
					{
						label: 'Pekerjaan dimulai',
						detail: record.startedAt ?? 'Belum dimulai',
						done: Boolean(record.startedAt)
					},
					{
						label: 'Perawatan selesai',
						detail: record.completedAt ?? 'Belum selesai',
						done: Boolean(record.completedAt)
					},
					{
						label: 'Kembali ke inventaris',
						detail: record.status === 'Selesai' ? 'Menunggu konfirmasi admin' : 'Belum tersedia',
						done: false
					}
				]
			: []
	);

	function save() {
		if (!record) return;
		if (!record.issue.trim() || !record.assignee.trim())
			return toast.error('Masalah dan penanggung jawab wajib diisi');
		if (record.estimatedCost < 0 || record.actualCost < 0)
			return toast.error('Biaya tidak boleh negatif');
		if (record.status === 'Sedang dikerjakan' && !record.startedAt)
			record.startedAt = '19 Nov 2026, 09.00';
		if (record.status === 'Selesai' && !record.completedAt)
			record.completedAt = '19 Nov 2026, 16.30';
		submitted = true;
		toast.success('Data perawatan diperbarui', {
			description: 'Perubahan tersimpan selama halaman aktif.'
		});
	}

	function startWork() {
		if (!record) return;
		record.status = 'Sedang dikerjakan';
		record.startedAt ??= '19 Nov 2026, 09.00';
		toast.success('Pekerjaan perawatan dimulai');
	}

	function finishWork() {
		if (!record) return;
		if (!record.actions.trim()) return toast.error('Isi tindakan perawatan sebelum menyelesaikan');
		record.status = 'Selesai';
		record.startedAt ??= '19 Nov 2026, 09.00';
		record.completedAt = '19 Nov 2026, 16.30';
		toast.success('Perawatan ditandai selesai');
	}

	function releaseUnit() {
		if (!record) return;
		releaseOpen = false;
		submitted = true;
		toast.success('Unit dikembalikan ke inventaris', {
			description: `${record.unitCode} · ${destination}`
		});
	}

	function retireUnit() {
		if (!record) return;
		record.status = 'Tidak dapat diperbaiki';
		record.completedAt ??= '19 Nov 2026, 16.30';
		retireOpen = false;
		toast.success('Unit ditandai tidak dapat diperbaiki');
	}

	function printReport() {
		toast.success('Laporan perawatan siap dicetak');
		window.print();
	}

	function beforeUnload(event: BeforeUnloadEvent) {
		if (!submitted && record && original && JSON.stringify(record) !== JSON.stringify(original))
			event.preventDefault();
	}
</script>

<svelte:window onbeforeunload={beforeUnload} />
<svelte:head>
	<title>{record ? `Perawatan ${record.unitCode}` : 'Perawatan tidak ditemukan'} — OutdoorPOS</title
	>
</svelte:head>

{#if record}
	<div class="space-y-6 print:bg-white print:text-black">
		<section class="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
			<div class="flex items-start gap-3">
				<Button
					href={resolve('/(app)/perawatan')}
					variant="ghost"
					size="icon"
					aria-label="Kembali"
					class="print:hidden"
				>
					<ArrowLeft />
				</Button>
				<div>
					<div class="mb-2 flex flex-wrap items-center gap-2">
						<h1 class="text-2xl font-bold tracking-tight md:text-3xl">{record.unitCode}</h1>
						<MaintenanceStatusBadge status={record.status} />
					</div>
					<p class="text-sm text-muted-foreground">{record.productName} · {record.variantName}</p>
				</div>
			</div>
			<div class="flex flex-wrap gap-2 print:hidden">
				<Button variant="outline" onclick={printReport}>
					<Printer />Cetak laporan
				</Button>{#if record.status === 'Menunggu pemeriksaan' || record.status === 'Menunggu perbaikan'}<Button
						onclick={startWork}
					>
						<Wrench />Mulai pekerjaan
					</Button>{:else if record.status === 'Sedang dikerjakan'}<Button onclick={finishWork}>
						<Check />Tandai selesai
					</Button>{:else if record.status === 'Selesai'}<Button
						onclick={() => (releaseOpen = true)}
					>
						<PackageCheck />Kembali ke inventaris
					</Button>{/if}
			</div>
		</section>

		<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each [{ label: 'Tingkat kerusakan', value: record.damageLevel, detail: record.source, icon: ShieldAlert }, { label: 'Penanggung jawab', value: record.assignee, detail: record.startedAt ?? 'Belum mulai', icon: CircleUserRound }, { label: 'Lokasi unit', value: record.location, detail: 'Lokasi perawatan saat ini', icon: MapPin }, { label: 'Biaya aktual', value: rupiah(record.actualCost), detail: `Estimasi ${rupiah(record.estimatedCost)}`, icon: Banknote }] as stat (stat.label)}
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

		<div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
			<div class="space-y-4">
				<Card.Root>
					<Card.Header>
						<Card.Title>Detail kerusakan</Card.Title><Card.Description>
							Perbarui hasil diagnosis dan tingkat kerusakan unit.
						</Card.Description>
					</Card.Header><Card.Content class="grid gap-4 sm:grid-cols-2">
						<div>
							<Label for="damage-level" class="mb-2">Tingkat kerusakan</Label><select
								id="damage-level"
								bind:value={record.damageLevel}
								class="h-9 w-full rounded-xl border bg-background px-3 text-sm"
							>
								{#each damageLevels as level (level)}<option>{level}</option>{/each}
							</select>
						</div>
						<div>
							<Label for="maintenance-location" class="mb-2">Lokasi</Label><Input
								id="maintenance-location"
								bind:value={record.location}
							/>
						</div>
						<div class="sm:col-span-2">
							<Label for="issue" class="mb-2">Masalah ditemukan</Label><Textarea
								id="issue"
								bind:value={record.issue}
								rows={3}
							/>
						</div>
						<div class="sm:col-span-2">
							<Label for="diagnostic-notes" class="mb-2">Catatan pemeriksaan</Label><Textarea
								id="diagnostic-notes"
								bind:value={record.notes}
								rows={3}
								placeholder="Hasil pemeriksaan, kebutuhan komponen, atau risiko..."
							/>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title>Pekerjaan perawatan</Card.Title><Card.Description>
							Catat tindakan, petugas, status, dan biaya.
						</Card.Description>
					</Card.Header><Card.Content class="grid gap-4 sm:grid-cols-2">
						<div>
							<Label for="maintenance-status" class="mb-2">Status</Label><select
								id="maintenance-status"
								bind:value={record.status}
								class="h-9 w-full rounded-xl border bg-background px-3 text-sm"
							>
								{#each statuses as status (status)}<option>{status}</option>{/each}
							</select>
						</div>
						<div>
							<Label for="assignee" class="mb-2">Penanggung jawab</Label><Input
								id="assignee"
								bind:value={record.assignee}
							/>
						</div>
						<div>
							<Label for="estimated-cost" class="mb-2">Estimasi biaya</Label><Input
								id="estimated-cost"
								type="number"
								min="0"
								bind:value={record.estimatedCost}
							/>
						</div>
						<div>
							<Label for="actual-cost" class="mb-2">Biaya aktual</Label><Input
								id="actual-cost"
								type="number"
								min="0"
								bind:value={record.actualCost}
							/>
						</div>
						<div class="sm:col-span-2">
							<Label for="actions" class="mb-2">Tindakan perawatan</Label><Textarea
								id="actions"
								bind:value={record.actions}
								rows={4}
								placeholder="Komponen diganti, dibersihkan, diuji, atau tindakan lain..."
							/>
						</div>
					</Card.Content><Card.Footer class="justify-between border-t">
						<Button
							variant="destructive"
							onclick={() => (retireOpen = true)}
							disabled={record.status === 'Tidak dapat diperbaiki'}
						>
							Tidak dapat diperbaiki
						</Button><Button onclick={save}><Check />Simpan perubahan</Button>
					</Card.Footer>
				</Card.Root>
			</div>

			<aside class="space-y-4">
				<Card.Root>
					<Card.Header><Card.Title>Informasi unit</Card.Title></Card.Header><Card.Content
						class="space-y-4 text-sm"
					>
						<div class="flex gap-3">
							<span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
								<Box class="size-4" />
							</span>
							<div>
								<p class="font-medium">{record.productName}</p>
								<p class="text-xs text-muted-foreground">
									{record.variantName} · {record.unitCode}
								</p>
							</div>
						</div>
						<div class="grid grid-cols-2 gap-4 border-t pt-4">
							<div>
								<p class="text-xs text-muted-foreground">Dilaporkan</p>
								<p class="mt-1 font-medium">{record.reportedAt}</p>
							</div>
							<div>
								<p class="text-xs text-muted-foreground">Sumber</p>
								<p class="mt-1 font-medium">{record.source}</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header><Card.Title>Timeline perawatan</Card.Title></Card.Header><Card.Content>
						<div
							class="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-3 before:w-px before:bg-border"
						>
							{#each timeline as entry (entry.label)}<div class="relative flex gap-4">
									<span
										class="z-10 flex size-6 shrink-0 items-center justify-center rounded-full {entry.done
											? 'bg-primary text-primary-foreground'
											: 'bg-muted text-muted-foreground'} ring-4 ring-card"
									>
										{#if entry.done}<Check class="size-3" />{:else}<span
												class="size-2 rounded-full bg-current"
											></span>{/if}
									</span>
									<div>
										<p class="text-sm font-medium">{entry.label}</p>
										<p class="mt-1 text-xs text-muted-foreground">{entry.detail}</p>
									</div>
								</div>{/each}
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header><Card.Title>Ringkasan biaya</Card.Title></Card.Header><Card.Content
						class="space-y-3 text-sm"
					>
						<div class="flex justify-between text-muted-foreground">
							<span>Estimasi</span><span>{rupiah(record.estimatedCost)}</span>
						</div>
						<div class="flex justify-between text-muted-foreground">
							<span>Aktual</span><span>{rupiah(record.actualCost)}</span>
						</div>
						<div class="flex justify-between border-t pt-3 font-semibold">
							<span>Selisih</span><span
								class={record.actualCost > record.estimatedCost
									? 'text-red-600'
									: 'text-emerald-600'}
							>
								{record.actualCost > record.estimatedCost ? '+' : ''}{rupiah(
									record.actualCost - record.estimatedCost
								)}
							</span>
						</div>
					</Card.Content>
				</Card.Root>
			</aside>
		</div>

		<footer class="hidden border-t pt-6 text-center text-xs print:block">
			<p class="font-bold">OutdoorPOS · Laporan Perawatan Unit</p>
			<p>{record.unitCode} · {record.productName}</p>
		</footer>
	</div>

	<Dialog.Root bind:open={releaseOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Kembalikan unit ke inventaris?</Dialog.Title><Dialog.Description>
					Unit akan ditandai baik dan tersedia kembali dalam simulasi frontend.
				</Dialog.Description>
			</Dialog.Header>
			<div>
				<Label for="destination" class="mb-2">Lokasi tujuan</Label><Input
					id="destination"
					bind:value={destination}
				/>
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (releaseOpen = false)}>Batal</Button><Button
					onclick={releaseUnit}
				>
					<PackageCheck />Kembalikan unit
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<Dialog.Root bind:open={retireOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Tandai tidak dapat diperbaiki?</Dialog.Title><Dialog.Description>
					Unit tidak akan kembali ke stok tersedia. Riwayat perawatan tetap disimpan.
				</Dialog.Description>
			</Dialog.Header>
			<div class="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
				Pastikan diagnosis dan catatan keputusan sudah lengkap.
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (retireOpen = false)}>Batal</Button><Button
					variant="destructive"
					onclick={retireUnit}
				>
					Konfirmasi
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
		<FileText class="mb-4 size-10 text-muted-foreground" />
		<h1 class="text-xl font-semibold">Data perawatan tidak ditemukan</h1>
		<p class="mt-1 text-sm text-muted-foreground">ID pekerjaan tidak tersedia dalam data mock.</p>
		<Button href={resolve('/(app)/perawatan')} class="mt-5"><ArrowLeft />Kembali ke daftar</Button>
	</div>
{/if}
