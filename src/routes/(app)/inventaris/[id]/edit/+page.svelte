<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { ArrowLeft, Archive, Check, Info, Plus, Save, Trash2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import { Textarea } from '#lib/components/ui/textarea';
	import { Label } from '#lib/components/ui/label';
	import { Badge } from '#lib/components/ui/badge';
	import * as Card from '#lib/components/ui/card';
	import { findProduct, rupiah } from '#lib/inventory/mock-data';

	const productId = page.params.id ?? '';
	const original = findProduct(productId);
	let name = $state(original?.name ?? '');
	let sku = $state(original?.sku ?? '');
	let category = $state(original?.category ?? '');
	let brand = $state(original?.brand ?? '');
	let description = $state(original?.description ?? '');
	let variants = $state(original ? structuredClone(original.variants) : []);
	let submitted = $state(false);
	let error = $state('');

	const categories = [
		'Tenda',
		'Sepatu',
		'Tas & Carrier',
		'Peralatan Masak',
		'Perlengkapan Tidur',
		'Penerangan',
		'Lainnya'
	];

	function detailRoute() {
		return resolve('/(app)/inventaris/[id]', { id: productId });
	}

	function addVariant() {
		variants.push({
			id: `new-${Date.now()}`,
			name: 'Varian baru',
			sku: `${sku}-${String(variants.length + 1).padStart(2, '0')}`,
			packagePrice: 0,
			extraDailyPrice: 0,
			stock: 0,
			available: 0
		});
	}

	async function save() {
		error = '';
		if (!name.trim() || !sku.trim() || !category) {
			error = 'Nama produk, SKU, dan kategori wajib diisi.';
			return;
		}
		if (
			!variants.length ||
			variants.some((variant) => variant.packagePrice <= 0 || variant.extraDailyPrice <= 0)
		) {
			error = 'Minimal satu varian dengan harga paket dan biaya tambahan lebih dari nol.';
			return;
		}
		submitted = true;
		toast.success('Perubahan produk disimpan', {
			description: 'Data edit masih bersifat mock frontend.'
		});
		await goto(detailRoute());
	}

	function beforeUnload(event: BeforeUnloadEvent) {
		if (
			!submitted &&
			original &&
			(name !== original.name || sku !== original.sku || description !== original.description)
		)
			event.preventDefault();
	}
</script>

<svelte:window onbeforeunload={beforeUnload} />
<svelte:head><title>Edit {original?.name ?? 'Produk'} — OutdoorPOS</title></svelte:head>

{#if original}
	<div class="mx-auto max-w-5xl space-y-6">
		<section class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
			<div class="flex items-start gap-3">
				<Button href={detailRoute()} variant="ghost" size="icon" aria-label="Kembali ke detail">
					<ArrowLeft />
				</Button>
				<div>
					<p class="mb-1 text-sm text-muted-foreground">{original.sku}</p>
					<h1 class="text-2xl font-bold tracking-tight md:text-3xl">Edit barang</h1>
					<p class="mt-1 text-sm text-muted-foreground">
						Perbarui informasi, varian, dan harga sewa.
					</p>
				</div>
			</div>
			<div class="flex gap-2">
				<Button href={detailRoute()} variant="outline">Batal</Button><Button onclick={save}>
					<Save />Simpan perubahan
				</Button>
			</div>
		</section>

		<div
			class="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200"
		>
			<Info class="mt-0.5 size-4 shrink-0" />
			<p>
				Mode frontend: perubahan tampil sebagai simulasi dan belum bertahan setelah halaman dimuat
				ulang.
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
				<Card.Title>Informasi produk</Card.Title><Card.Description>
					Identitas utama produk dalam inventaris.
				</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-5 sm:grid-cols-2">
				<div class="sm:col-span-2">
					<Label for="edit-name" class="mb-2">Nama produk</Label><Input
						id="edit-name"
						bind:value={name}
					/>
				</div>
				<div>
					<Label for="edit-sku" class="mb-2">SKU dasar</Label><Input
						id="edit-sku"
						bind:value={sku}
					/>
				</div>
				<div>
					<Label for="edit-category" class="mb-2">Kategori</Label><select
						id="edit-category"
						bind:value={category}
						class="h-9 w-full rounded-xl border bg-background px-3 text-sm"
					>
						{#each categories as item (item)}<option>{item}</option>{/each}
					</select>
				</div>
				<div>
					<Label for="edit-brand" class="mb-2">Merek</Label><Input
						id="edit-brand"
						bind:value={brand}
					/>
				</div>
				<div>
					<Label class="mb-2">Model stok</Label>
					<div class="flex h-9 items-center">
						<Badge variant="outline">
							{original.trackingMode === 'unit' ? 'Kode per unit' : 'Jumlah stok'}
						</Badge>
					</div>
				</div>
				<div class="sm:col-span-2">
					<Label for="edit-description" class="mb-2">Deskripsi</Label><Textarea
						id="edit-description"
						bind:value={description}
						rows={4}
					/>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex-row items-start justify-between">
				<div>
					<Card.Title>Varian dan harga</Card.Title><Card.Description>
						Perbarui nama, SKU, serta tarif setiap varian.
					</Card.Description>
				</div>
				<Button variant="outline" size="sm" onclick={addVariant}><Plus />Varian</Button>
			</Card.Header>
			<Card.Content class="space-y-3">
				{#each variants as variant, index (variant.id)}
					<div
						class="grid gap-3 rounded-xl border p-4 md:grid-cols-[1fr_1fr_150px_150px_auto] md:items-end"
					>
						<div>
							<Label for={`edit-variant-${index}`} class="mb-2">Nama varian</Label><Input
								id={`edit-variant-${index}`}
								bind:value={variant.name}
							/>
						</div>
						<div>
							<Label for={`edit-variant-sku-${index}`} class="mb-2">SKU</Label><Input
								id={`edit-variant-sku-${index}`}
								bind:value={variant.sku}
							/>
						</div>
						<div>
							<Label for={`edit-package-${index}`} class="mb-2">Paket 3H2M</Label><Input
								id={`edit-package-${index}`}
								type="number"
								min="0"
								bind:value={variant.packagePrice}
							/>
						</div>
						<div>
							<Label for={`edit-extra-${index}`} class="mb-2">Tambahan/hari</Label><Input
								id={`edit-extra-${index}`}
								type="number"
								min="0"
								bind:value={variant.extraDailyPrice}
							/>
						</div>
						<Button
							variant="ghost"
							size="icon"
							aria-label={`Hapus ${variant.name}`}
							onclick={() => variants.splice(index, 1)}
							disabled={variants.length === 1}
						>
							<Trash2 />
						</Button>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header><Card.Title>Ringkasan perubahan</Card.Title></Card.Header><Card.Content
				class="grid gap-4 sm:grid-cols-3"
			>
				<div>
					<p class="text-xs text-muted-foreground">Jumlah varian</p>
					<p class="mt-1 text-lg font-semibold">{variants.length}</p>
				</div>
				<div>
					<p class="text-xs text-muted-foreground">Harga paket mulai</p>
					<p class="mt-1 text-lg font-semibold">
						{rupiah(Math.min(...variants.map((item) => item.packagePrice)))}
					</p>
				</div>
				<div>
					<p class="text-xs text-muted-foreground">Tambahan mulai</p>
					<p class="mt-1 text-lg font-semibold">
						{rupiah(Math.min(...variants.map((item) => item.extraDailyPrice)))}
					</p>
				</div>
			</Card.Content>
		</Card.Root>

		<div class="flex items-center justify-between border-t pt-5">
			<Button href={detailRoute()} variant="outline"><ArrowLeft />Batal</Button><Button
				onclick={save}
			>
				<Check />Simpan perubahan
			</Button>
		</div>
	</div>
{:else}
	<div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
		<Archive class="mb-4 size-10 text-muted-foreground" />
		<h1 class="text-xl font-semibold">Produk tidak ditemukan</h1>
		<Button href={resolve('/(app)/inventaris')} class="mt-5"><ArrowLeft />Kembali</Button>
	</div>
{/if}
