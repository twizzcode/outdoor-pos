<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		ArrowLeft,
		ArrowRight,
		Check,
		ChevronLeft,
		ImagePlus,
		Info,
		PackagePlus,
		Plus,
		RefreshCw,
		Trash2
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button';
	import { Input } from '#lib/components/ui/input';
	import { Textarea } from '#lib/components/ui/textarea';
	import { Label } from '#lib/components/ui/label';
	import { Switch } from '#lib/components/ui/switch';
	import { Checkbox } from '#lib/components/ui/checkbox';
	import * as Card from '#lib/components/ui/card';
	import { Badge } from '#lib/components/ui/badge';
	import { Progress } from '#lib/components/ui/progress';
	import { createCombinations } from '#lib/inventory/variant-combinations';
	import { rupiah } from '#lib/inventory/mock-data';
	import type { InventoryUnit, TrackingMode } from '#lib/inventory/types';

	type AttributeDraft = { name: string; valuesText: string };
	type VariantDraft = {
		name: string;
		sku: string;
		packagePrice: number;
		extraDailyPrice: number;
		stock: number;
		minimumStock: number;
		active: boolean;
	};

	const steps = ['Informasi produk', 'Varian & harga', 'Stok atau unit', 'Tinjau'];
	const categories = [
		'Tenda',
		'Sepatu',
		'Tas & Carrier',
		'Peralatan Masak',
		'Perlengkapan Tidur',
		'Penerangan',
		'Lainnya'
	];

	let step = $state(1);
	let submitted = $state(false);
	let name = $state('');
	let sku = $state('');
	let category = $state('');
	let brand = $state('');
	let description = $state('');
	let trackingMode = $state<TrackingMode>('quantity');
	let hasVariants = $state(false);
	let imagePreview = $state('');
	let attributes = $state<AttributeDraft[]>([{ name: 'Ukuran', valuesText: '39, 40, 41' }]);
	let variants = $state<VariantDraft[]>([
		{
			name: 'Standar',
			sku: '',
			packagePrice: 0,
			extraDailyPrice: 0,
			stock: 0,
			minimumStock: 1,
			active: true
		}
	]);
	let units = $state<InventoryUnit[]>([]);
	let unitPrefix = $state('UNIT-');
	let unitCount = $state(1);
	let location = $state('');
	let error = $state('');

	const activeVariants = $derived(variants.filter((variant) => variant.active));
	const totalStock = $derived(
		trackingMode === 'unit'
			? units.length
			: activeVariants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0)
	);

	function handleImage(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		if (imagePreview) URL.revokeObjectURL(imagePreview);
		imagePreview = URL.createObjectURL(file);
	}

	function addAttribute() {
		if (attributes.length >= 3) return;
		attributes.push({ name: '', valuesText: '' });
	}

	function buildVariants() {
		error = '';
		const normalized = attributes
			.map((attribute) => ({
				name: attribute.name.trim(),
				values: attribute.valuesText
					.split(',')
					.map((value) => value.trim())
					.filter(Boolean)
			}))
			.filter((attribute) => attribute.name && attribute.values.length);

		if (!normalized.length) {
			error = 'Tambahkan minimal satu atribut beserta pilihannya.';
			return;
		}

		variants = createCombinations(normalized).map((combination, index) => {
			const existing = variants.find((variant) => variant.name === combination);
			return (
				existing ?? {
					name: combination,
					sku: `${sku || 'SKU'}-${String(index + 1).padStart(2, '0')}`,
					packagePrice: 0,
					extraDailyPrice: 0,
					stock: 0,
					minimumStock: 1,
					active: true
				}
			);
		});
		toast.success(`${variants.length} kombinasi varian dibuat`);
	}

	function applyPriceToAll(field: 'packagePrice' | 'extraDailyPrice', value: number) {
		variants.forEach((variant) => (variant[field] = value));
	}

	function generateUnits() {
		const existing = new Set(units.map((unit) => unit.code));
		const additions: InventoryUnit[] = [];
		let sequence = 1;
		while (additions.length < unitCount) {
			const code = `${unitPrefix}${String(sequence).padStart(3, '0')}`;
			if (!existing.has(code)) additions.push({ code, condition: 'Baik', location });
			sequence++;
		}
		units.push(...additions);
	}

	function validateCurrentStep() {
		error = '';
		if (step === 1 && (!name.trim() || !sku.trim() || !category)) {
			error = 'Nama produk, SKU, dan kategori wajib diisi.';
			return false;
		}
		if (step === 2) {
			if (!activeVariants.length) {
				error = 'Aktifkan minimal satu varian.';
				return false;
			}
			if (
				activeVariants.some((variant) => variant.packagePrice <= 0 || variant.extraDailyPrice <= 0)
			) {
				error = 'Harga paket dan biaya tambahan semua varian wajib lebih dari nol.';
				return false;
			}
		}
		if (step === 3 && totalStock <= 0) {
			error =
				trackingMode === 'unit'
					? 'Tambahkan minimal satu kode unit.'
					: 'Jumlah stok awal wajib lebih dari nol.';
			return false;
		}
		return true;
	}

	function next() {
		if (!validateCurrentStep()) return;
		step = Math.min(4, step + 1);
	}

	async function save() {
		submitted = true;
		toast.success('Barang berhasil disimpan', {
			description: `${name} ditambahkan ke inventaris mock.`
		});
		await goto(resolve('/(app)/inventaris'));
	}

	function beforeUnload(event: BeforeUnloadEvent) {
		if (!submitted && (name || sku)) event.preventDefault();
	}
</script>

<svelte:window onbeforeunload={beforeUnload} />
<svelte:head><title>Tambah Barang — OutdoorPOS</title></svelte:head>

<div class="mx-auto max-w-5xl space-y-6">
	<section class="flex items-start gap-3">
		<Button
			href={resolve('/(app)/inventaris')}
			variant="ghost"
			size="icon"
			aria-label="Kembali ke inventaris"
		>
			<ChevronLeft />
		</Button>
		<div>
			<h1 class="text-2xl font-bold tracking-tight md:text-3xl">Tambah barang</h1>
			<p class="mt-1 text-sm text-muted-foreground">Lengkapi produk, harga sewa, dan stok awal.</p>
		</div>
	</section>

	<Card.Root class="py-5">
		<Card.Content class="px-5">
			<div class="mb-3 flex items-center justify-between text-sm">
				<span class="font-medium">Langkah {step} dari 4</span><span class="text-muted-foreground">
					{steps[step - 1]}
				</span>
			</div>
			<Progress value={step * 25} class="h-1.5" />
			<ol class="mt-5 grid grid-cols-4 gap-2">
				{#each steps as label, index (label)}
					<li class="flex min-w-0 items-center gap-2">
						<span
							class="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold {index +
								1 <=
							step
								? 'bg-primary text-primary-foreground'
								: 'bg-muted text-muted-foreground'}"
						>
							{index + 1 < step ? '✓' : index + 1}
						</span>
						<span class="hidden truncate text-xs font-medium sm:block">{label}</span>
					</li>
				{/each}
			</ol>
		</Card.Content>
	</Card.Root>

	{#if error}
		<div
			role="alert"
			class="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
		>
			<Info class="mt-0.5 size-4 shrink-0" />{error}
		</div>
	{/if}

	{#if step === 1}
		<Card.Root>
			<Card.Header>
				<Card.Title>Informasi produk</Card.Title><Card.Description>
					Informasi utama yang tampil di katalog inventaris.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-6">
				<div class="grid gap-6 md:grid-cols-[180px_1fr]">
					<div>
						<Label for="photo" class="mb-2">Foto produk</Label>
						<label
							for="photo"
							class="flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-muted/30 text-center hover:bg-muted/60"
						>
							{#if imagePreview}<img
									src={imagePreview}
									alt="Pratinjau produk"
									class="size-full object-cover"
								/>{:else}<ImagePlus class="mb-2 size-7 text-muted-foreground" /><span
									class="text-xs font-medium"
								>
									Pilih foto
								</span><span class="mt-1 px-3 text-[11px] text-muted-foreground">
									PNG atau JPG
								</span>{/if}
						</label>
						<input
							id="photo"
							type="file"
							accept="image/png,image/jpeg"
							class="sr-only"
							onchange={handleImage}
						/>
					</div>
					<div class="grid content-start gap-5 sm:grid-cols-2">
						<div class="sm:col-span-2">
							<Label for="name" class="mb-2">
								Nama produk <span class="text-red-500">*</span>
							</Label><Input id="name" bind:value={name} placeholder="Contoh: Sepatu Hiking Arei" />
						</div>
						<div>
							<Label for="sku" class="mb-2">
								SKU dasar <span class="text-red-500">*</span>
							</Label><Input id="sku" bind:value={sku} placeholder="SPT-AR" />
						</div>
						<div>
							<Label for="category" class="mb-2">
								Kategori <span class="text-red-500">*</span>
							</Label><select
								id="category"
								bind:value={category}
								class="h-9 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
							>
								<option value="" disabled>
									Pilih kategori
								</option>{#each categories as item (item)}<option>
										{item}
									</option>{/each}
							</select>
						</div>
						<div class="sm:col-span-2">
							<Label for="brand" class="mb-2">
								Merek <span class="font-normal text-muted-foreground">(opsional)</span>
							</Label><Input id="brand" bind:value={brand} placeholder="Arei, Consina, Eiger..." />
						</div>
						<div class="sm:col-span-2">
							<Label for="description" class="mb-2">Deskripsi</Label><Textarea
								id="description"
								bind:value={description}
								placeholder="Catatan singkat produk dan kelengkapannya..."
								rows={3}
							/>
						</div>
					</div>
				</div>
				<div class="grid gap-4 border-t pt-6 md:grid-cols-2">
					<fieldset>
						<legend class="mb-3 text-sm font-medium">Model pelacakan stok</legend>
						<div class="grid grid-cols-2 gap-3">
							<label
								class="cursor-pointer rounded-xl border p-4 has-[:checked]:border-foreground has-[:checked]:bg-muted/50"
							>
								<input type="radio" bind:group={trackingMode} value="quantity" class="mr-2" /><span
									class="text-sm font-medium"
								>
									Jumlah stok
								</span>
								<p class="mt-1 text-xs text-muted-foreground">Cukup catat total barang.</p>
							</label><label
								class="cursor-pointer rounded-xl border p-4 has-[:checked]:border-foreground has-[:checked]:bg-muted/50"
							>
								<input type="radio" bind:group={trackingMode} value="unit" class="mr-2" /><span
									class="text-sm font-medium"
								>
									Kode per unit
								</span>
								<p class="mt-1 text-xs text-muted-foreground">Setiap barang punya kode.</p>
							</label>
						</div>
					</fieldset>
					<div>
						<p class="mb-3 text-sm font-medium">Struktur produk</p>
						<label class="flex cursor-pointer items-center justify-between rounded-xl border p-4">
							<div>
								<p class="text-sm font-medium">Produk memiliki varian</p>
								<p class="mt-1 text-xs text-muted-foreground">
									Contoh: ukuran, warna, atau kapasitas.
								</p>
							</div>
							<Switch bind:checked={hasVariants} aria-label="Produk memiliki varian" />
						</label>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{:else if step === 2}
		<div class="space-y-4">
			{#if hasVariants}
				<Card.Root>
					<Card.Header class="flex-row items-start justify-between">
						<div>
							<Card.Title>Atribut dinamis</Card.Title><Card.Description>
								Pisahkan pilihan dengan koma. Maksimal tiga atribut.
							</Card.Description>
						</div>
						<Button
							variant="outline"
							size="sm"
							onclick={addAttribute}
							disabled={attributes.length >= 3}
						>
							<Plus />Atribut
						</Button>
					</Card.Header>
					<Card.Content class="space-y-3">
						{#each attributes as attribute, index (index)}
							<div class="grid gap-3 rounded-xl border p-4 sm:grid-cols-[180px_1fr_auto]">
								<div>
									<Label for={`attribute-${index}`} class="mb-2">Nama atribut</Label><Input
										id={`attribute-${index}`}
										bind:value={attribute.name}
										placeholder="Ukuran"
									/>
								</div>
								<div>
									<Label for={`values-${index}`} class="mb-2">Pilihan</Label><Input
										id={`values-${index}`}
										bind:value={attribute.valuesText}
										placeholder="39, 40, 41"
									/>
								</div>
								<Button
									variant="ghost"
									size="icon"
									class="self-end"
									aria-label="Hapus atribut"
									onclick={() => attributes.splice(index, 1)}
									disabled={attributes.length === 1}
								>
									<Trash2 />
								</Button>
							</div>
						{/each}
						<Button variant="secondary" onclick={buildVariants}>
							<RefreshCw />Buat kombinasi varian
						</Button>
					</Card.Content>
				</Card.Root>
			{/if}

			<Card.Root>
				<Card.Header>
					<Card.Title>
						{hasVariants ? 'Varian dan harga' : 'Harga sewa'}
					</Card.Title><Card.Description>
						Harga paket berlaku untuk 3 hari 2 malam. Kelebihan durasi dihitung per hari.
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#if variants.length > 1}<div class="flex flex-wrap gap-2 rounded-xl bg-muted/50 p-3">
							<span class="self-center text-xs font-medium">Terapkan ke semua:</span><Button
								variant="outline"
								size="xs"
								onclick={() => applyPriceToAll('packagePrice', variants[0].packagePrice)}
							>
								Harga paket pertama
							</Button><Button
								variant="outline"
								size="xs"
								onclick={() => applyPriceToAll('extraDailyPrice', variants[0].extraDailyPrice)}
							>
								Tambahan pertama
							</Button>
						</div>{/if}
					<div class="space-y-3">
						{#each variants as variant, index (variant.name)}
							<div
								class="grid gap-3 rounded-xl border p-4 lg:grid-cols-[auto_1.2fr_1fr_1fr_1fr] lg:items-end"
							>
								<div class="pb-2">
									<Checkbox bind:checked={variant.active} aria-label={`Aktifkan ${variant.name}`} />
								</div>
								<div>
									<Label class="mb-2">Varian</Label>
									<p class="flex h-9 items-center text-sm font-medium">{variant.name}</p>
								</div>
								<div>
									<Label for={`variant-sku-${index}`} class="mb-2">SKU</Label><Input
										id={`variant-sku-${index}`}
										bind:value={variant.sku}
										disabled={!variant.active}
									/>
								</div>
								<div>
									<Label for={`package-${index}`} class="mb-2">Paket 3H2M</Label><Input
										id={`package-${index}`}
										type="number"
										min="0"
										bind:value={variant.packagePrice}
										disabled={!variant.active}
									/>
								</div>
								<div>
									<Label for={`extra-${index}`} class="mb-2">Tambahan/hari</Label><Input
										id={`extra-${index}`}
										type="number"
										min="0"
										bind:value={variant.extraDailyPrice}
										disabled={!variant.active}
									/>
								</div>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{:else if step === 3}
		<Card.Root>
			<Card.Header>
				<Card.Title>
					{trackingMode === 'unit' ? 'Kode unit awal' : 'Stok awal'}
				</Card.Title><Card.Description>
					{trackingMode === 'unit'
						? 'Buat kode unik agar kondisi setiap barang dapat dilacak.'
						: 'Masukkan jumlah tersedia untuk setiap varian aktif.'}
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-5">
				{#if trackingMode === 'quantity'}
					{#each activeVariants as variant, index (variant.name)}
						<div class="grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_160px_160px]">
							<div>
								<p class="font-medium">{variant.name}</p>
								<p class="text-xs text-muted-foreground">{variant.sku}</p>
							</div>
							<div>
								<Label for={`stock-${index}`} class="mb-2">Stok awal</Label><Input
									id={`stock-${index}`}
									type="number"
									min="0"
									bind:value={variant.stock}
								/>
							</div>
							<div>
								<Label for={`minimum-${index}`} class="mb-2">Batas minimum</Label><Input
									id={`minimum-${index}`}
									type="number"
									min="0"
									bind:value={variant.minimumStock}
								/>
							</div>
						</div>
					{/each}
				{:else}
					<div
						class="grid gap-3 rounded-xl border bg-muted/30 p-4 sm:grid-cols-[1fr_120px_1fr_auto] sm:items-end"
					>
						<div>
							<Label for="prefix" class="mb-2">Prefix kode</Label><Input
								id="prefix"
								bind:value={unitPrefix}
							/>
						</div>
						<div>
							<Label for="unit-count" class="mb-2">Jumlah</Label><Input
								id="unit-count"
								type="number"
								min="1"
								max="100"
								bind:value={unitCount}
							/>
						</div>
						<div>
							<Label for="location" class="mb-2">Lokasi awal</Label><Input
								id="location"
								bind:value={location}
								placeholder="Rak B2"
							/>
						</div>
						<Button onclick={generateUnits}><PackagePlus />Generate</Button>
					</div>
					{#if units.length}
						<div class="space-y-2">
							{#each units as unit, index (index)}
								<div
									class="grid gap-3 rounded-xl border p-3 sm:grid-cols-[1fr_180px_1fr_auto] sm:items-center"
								>
									<Input bind:value={unit.code} aria-label={`Kode unit ${index + 1}`} /><select
										bind:value={unit.condition}
										aria-label={`Kondisi unit ${index + 1}`}
										class="h-9 rounded-xl border bg-background px-3 text-sm"
									>
										<option>Baik</option><option>Perlu pemeriksaan</option><option>Rusak</option>
									</select><Input
										bind:value={unit.location}
										placeholder="Lokasi"
										aria-label={`Lokasi unit ${index + 1}`}
									/><Button
										variant="ghost"
										size="icon-sm"
										aria-label={`Hapus unit ${unit.code}`}
										onclick={() => units.splice(index, 1)}
									>
										<Trash2 />
									</Button>
								</div>
							{/each}
						</div>
					{:else}<div class="rounded-xl border border-dashed py-12 text-center">
							<PackagePlus class="mx-auto mb-3 size-7 text-muted-foreground" />
							<p class="text-sm font-medium">Belum ada unit</p>
							<p class="mt-1 text-xs text-muted-foreground">
								Isi prefix dan jumlah, lalu tekan Generate.
							</p>
						</div>{/if}
				{/if}
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid gap-4 lg:grid-cols-[1fr_320px]">
			<Card.Root>
				<Card.Header>
					<Card.Title>Tinjau barang</Card.Title><Card.Description>
						Pastikan data sudah benar sebelum disimpan.
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="flex gap-4">
						<span
							class="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted"
						>
							{#if imagePreview}<img
									src={imagePreview}
									alt=""
									class="size-full object-cover"
								/>{:else}<PackagePlus />{/if}
						</span>
						<div>
							<h2 class="text-lg font-semibold">{name}</h2>
							<p class="text-sm text-muted-foreground">
								{sku} · {category}{brand ? ` · ${brand}` : ''}
							</p>
							<div class="mt-2 flex gap-2">
								<Badge variant="outline">
									{trackingMode === 'unit' ? 'Kode per unit' : 'Jumlah stok'}
								</Badge>{#if hasVariants}<Badge variant="secondary">
										{activeVariants.length} varian
									</Badge>{/if}
							</div>
						</div>
					</div>
					<div class="grid gap-4 border-y py-5 sm:grid-cols-3">
						<div>
							<p class="text-xs text-muted-foreground">Total stok awal</p>
							<p class="mt-1 text-xl font-semibold">{totalStock} unit</p>
						</div>
						<div>
							<p class="text-xs text-muted-foreground">Harga paket mulai</p>
							<p class="mt-1 text-xl font-semibold">
								{rupiah(Math.min(...activeVariants.map((item) => item.packagePrice)))}
							</p>
						</div>
						<div>
							<p class="text-xs text-muted-foreground">Tambahan mulai</p>
							<p class="mt-1 text-xl font-semibold">
								{rupiah(Math.min(...activeVariants.map((item) => item.extraDailyPrice)))}
							</p>
						</div>
					</div>
					<div>
						<h3 class="mb-3 text-sm font-semibold">Rincian varian</h3>
						<div class="space-y-2">
							{#each activeVariants as variant (variant.name)}<div
									class="flex flex-col justify-between gap-2 rounded-xl bg-muted/50 p-3 sm:flex-row sm:items-center"
								>
									<div>
										<p class="text-sm font-medium">{variant.name}</p>
										<p class="text-xs text-muted-foreground">{variant.sku}</p>
									</div>
									<div class="text-left sm:text-right">
										<p class="text-sm font-medium">{rupiah(variant.packagePrice)} / paket</p>
										<p class="text-xs text-muted-foreground">
											+{rupiah(variant.extraDailyPrice)} / hari
										</p>
									</div>
								</div>{/each}
						</div>
					</div>
				</Card.Content>
			</Card.Root>
			<Card.Root class="h-fit">
				<Card.Header>
					<Card.Title>Siap disimpan?</Card.Title><Card.Description>
						Data ini masih memakai penyimpanan mock frontend.
					</Card.Description>
				</Card.Header><Card.Content class="space-y-3">
					<div class="flex gap-2 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
						<Info class="size-4 shrink-0" />Data belum masuk database dan akan hilang setelah
						halaman dimuat ulang.
					</div>
					<Button class="w-full" size="lg" onclick={save}><Check />Simpan barang</Button><Button
						variant="outline"
						class="w-full"
						onclick={() => (step = 1)}
					>
						Edit dari awal
					</Button>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	{#if step < 4}
		<div class="flex items-center justify-between border-t pt-5">
			<Button
				variant="outline"
				onclick={() => (step = Math.max(1, step - 1))}
				disabled={step === 1}
			>
				<ArrowLeft />Kembali
			</Button><Button onclick={next}>Lanjutkan <ArrowRight /></Button>
		</div>
	{:else}
		<div class="flex justify-start border-t pt-5">
			<Button variant="outline" onclick={() => (step = 3)}><ArrowLeft />Kembali ke stok</Button>
		</div>
	{/if}
</div>
