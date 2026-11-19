<script lang="ts">
	import { ArrowLeft, Check, Info, Save } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import { Label } from '#lib/components/ui/label';
	import { Textarea } from '#lib/components/ui/textarea';
	import * as Card from '#lib/components/ui/card';
	import type { Customer, CustomerStatus } from '#lib/customers/types';

	let {
		customer,
		cancelHref,
		onSave
	}: {
		customer?: Customer;
		cancelHref: string;
		onSave: (value: Customer) => void | Promise<void>;
	} = $props();

	const initialCustomer = untrack(() => customer);
	let form = $state<Customer>(
		initialCustomer
			? structuredClone(initialCustomer)
			: {
					id: `c-${Date.now()}`,
					code: `CUS-${String(Date.now()).slice(-3)}`,
					name: '',
					phone: '',
					email: '',
					address: '',
					identityNumber: '',
					emergencyContact: '',
					status: 'Aktif',
					notes: '',
					joinedAt: '19 Nov 2026'
				}
	);
	let error = $state('');
	let submitted = $state(false);
	const statuses: CustomerStatus[] = ['Aktif', 'Diblokir'];

	async function save() {
		error = '';
		if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
			error = 'Nama, nomor telepon, dan alamat wajib diisi.';
			return;
		}
		if (form.email && !form.email.includes('@')) {
			error = 'Format email tidak valid.';
			return;
		}
		if (!/^\d[\d -]{7,}$/.test(form.phone)) {
			error = 'Nomor telepon minimal delapan digit.';
			return;
		}
		submitted = true;
		await onSave(structuredClone(form));
	}

	function beforeUnload(event: BeforeUnloadEvent) {
		if (!submitted && JSON.stringify(form) !== JSON.stringify(customer)) event.preventDefault();
	}
</script>

<svelte:window onbeforeunload={beforeUnload} />

<div class="space-y-6">
	<div
		class="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200"
	>
		<Info class="mt-0.5 size-4 shrink-0" />
		<p>
			Mode frontend: data pelanggan belum disimpan permanen dan kembali ke kondisi awal setelah
			reload.
		</p>
	</div>
	{#if error}<div
			role="alert"
			class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
		>
			{error}
		</div>{/if}

	<Card.Root>
		<Card.Header>
			<Card.Title>Identitas pelanggan</Card.Title><Card.Description>
				Data utama untuk identifikasi penyewa.
			</Card.Description>
		</Card.Header><Card.Content class="grid gap-5 sm:grid-cols-2">
			<div class="sm:col-span-2">
				<Label for="customer-name" class="mb-2">Nama lengkap</Label><Input
					id="customer-name"
					bind:value={form.name}
					placeholder="Nama sesuai identitas"
				/>
			</div>
			<div>
				<Label for="customer-code" class="mb-2">Kode pelanggan</Label><Input
					id="customer-code"
					bind:value={form.code}
				/>
			</div>
			<div>
				<Label for="customer-identity" class="mb-2">Nomor identitas</Label><Input
					id="customer-identity"
					bind:value={form.identityNumber}
					placeholder="NIK atau identitas lain"
				/>
			</div>
			<div>
				<Label for="customer-phone" class="mb-2">Nomor telepon</Label><Input
					id="customer-phone"
					bind:value={form.phone}
					placeholder="08xx-xxxx-xxxx"
				/>
			</div>
			<div>
				<Label for="customer-email" class="mb-2">Email opsional</Label><Input
					id="customer-email"
					type="email"
					bind:value={form.email}
				/>
			</div>
			<div>
				<Label for="customer-emergency" class="mb-2">Kontak darurat</Label><Input
					id="customer-emergency"
					bind:value={form.emergencyContact}
					placeholder="Nama · nomor telepon"
				/>
			</div>
			<div>
				<Label for="customer-status" class="mb-2">Status</Label><select
					id="customer-status"
					bind:value={form.status}
					class="h-9 w-full rounded-xl border bg-background px-3 text-sm"
				>
					{#each statuses as status (status)}<option>{status}</option>{/each}
				</select>
			</div>
			<div class="sm:col-span-2">
				<Label for="customer-address" class="mb-2">Alamat</Label><Textarea
					id="customer-address"
					bind:value={form.address}
					rows={3}
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Catatan internal</Card.Title><Card.Description>
				Hanya terlihat oleh admin dan staff.
			</Card.Description>
		</Card.Header><Card.Content>
			<Label for="customer-notes" class="mb-2">Catatan pelanggan</Label><Textarea
				id="customer-notes"
				bind:value={form.notes}
				rows={4}
				placeholder="Preferensi, instruksi kontak, atau catatan risiko..."
			/>
		</Card.Content>
	</Card.Root>

	<div class="flex items-center justify-between border-t pt-5">
		<Button href={cancelHref} variant="outline"><ArrowLeft />Batal</Button><Button onclick={save}>
			{#if customer}<Save />Simpan perubahan{:else}<Check />Tambah pelanggan{/if}
		</Button>
	</div>
</div>
