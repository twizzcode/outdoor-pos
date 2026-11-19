import type { InventoryActivity, InventoryProduct, ProductUnit } from './types';

export const inventoryProducts: InventoryProduct[] = [
	{
		id: '1',
		name: 'Tenda Dome 4 Orang',
		sku: 'TND-DM4',
		category: 'Tenda',
		trackingMode: 'quantity',
		status: 'Tersedia',
		icon: 'tent',
		brand: 'Naturehike',
		description:
			'Tenda dome kapasitas empat orang, lengkap dengan flysheet, pasak, dan tas penyimpanan.',
		variants: [
			{
				id: '1-a',
				sku: 'TND-DM4',
				name: 'Standar',
				packagePrice: 150000,
				extraDailyPrice: 45000,
				stock: 12,
				available: 8
			}
		]
	},
	{
		id: '2',
		name: 'Sepatu Hiking Arei',
		sku: 'SPT-AR',
		category: 'Sepatu',
		trackingMode: 'unit',
		status: 'Tersedia',
		icon: 'footprints',
		brand: 'Arei',
		description: 'Sepatu hiking unisex dengan sol antiselip. Tersedia beberapa ukuran dan warna.',
		variants: [
			{
				id: '2-a',
				sku: 'SPT-AR-39-H',
				name: '39 / Hitam',
				packagePrice: 85000,
				extraDailyPrice: 25000,
				stock: 3,
				available: 2
			},
			{
				id: '2-b',
				sku: 'SPT-AR-40-H',
				name: '40 / Hitam',
				packagePrice: 85000,
				extraDailyPrice: 25000,
				stock: 4,
				available: 3
			},
			{
				id: '2-c',
				sku: 'SPT-AR-41-C',
				name: '41 / Cokelat',
				packagePrice: 90000,
				extraDailyPrice: 28000,
				stock: 2,
				available: 1
			}
		]
	},
	{
		id: '3',
		name: 'Carrier Consina 60L',
		sku: 'CAR-CS60',
		category: 'Tas & Carrier',
		trackingMode: 'unit',
		status: 'Perawatan',
		icon: 'backpack',
		brand: 'Consina',
		description: 'Carrier 60 liter untuk pendakian panjang dengan rain cover dan rangka aluminium.',
		variants: [
			{
				id: '3-a',
				sku: 'CAR-CS60-B',
				name: 'Biru',
				packagePrice: 120000,
				extraDailyPrice: 35000,
				stock: 3,
				available: 1
			},
			{
				id: '3-b',
				sku: 'CAR-CS60-H',
				name: 'Hitam',
				packagePrice: 120000,
				extraDailyPrice: 35000,
				stock: 3,
				available: 2
			}
		]
	},
	{
		id: '4',
		name: 'Kompor Portable',
		sku: 'KMP-PRT',
		category: 'Peralatan Masak',
		trackingMode: 'quantity',
		status: 'Tersedia',
		icon: 'flame',
		brand: 'Kovar',
		description: 'Kompor gas portable ringkas untuk kebutuhan memasak di area perkemahan.',
		variants: [
			{
				id: '4-a',
				sku: 'KMP-PRT',
				name: 'Standar',
				packagePrice: 50000,
				extraDailyPrice: 15000,
				stock: 8,
				available: 6
			}
		]
	},
	{
		id: '5',
		name: 'Sleeping Bag Polar',
		sku: 'SLP-PLR',
		category: 'Perlengkapan Tidur',
		trackingMode: 'quantity',
		status: 'Stok rendah',
		icon: 'bed',
		brand: 'Polar',
		description: 'Sleeping bag hangat untuk suhu rendah dengan bahan luar tahan air ringan.',
		variants: [
			{
				id: '5-a',
				sku: 'SLP-PLR-R',
				name: 'Regular',
				packagePrice: 65000,
				extraDailyPrice: 20000,
				stock: 5,
				available: 1
			},
			{
				id: '5-b',
				sku: 'SLP-PLR-L',
				name: 'Large',
				packagePrice: 75000,
				extraDailyPrice: 22000,
				stock: 3,
				available: 0
			}
		]
	},
	{
		id: '6',
		name: 'Headlamp 300 Lumen',
		sku: 'HLP-300',
		category: 'Penerangan',
		trackingMode: 'quantity',
		status: 'Stok rendah',
		icon: 'flashlight',
		brand: 'Black Diamond',
		description: 'Headlamp 300 lumen dengan tiga mode pencahayaan dan tali kepala elastis.',
		variants: [
			{
				id: '6-a',
				sku: 'HLP-300',
				name: 'Standar',
				packagePrice: 35000,
				extraDailyPrice: 10000,
				stock: 10,
				available: 2
			}
		]
	}
];

export const productUnits: ProductUnit[] = [
	{
		id: 'u1',
		variantId: '2-a',
		variantName: '39 / Hitam',
		code: 'SPT-AR-39-H-001',
		condition: 'Baik',
		location: 'Rak S1',
		status: 'Tersedia'
	},
	{
		id: 'u2',
		variantId: '2-a',
		variantName: '39 / Hitam',
		code: 'SPT-AR-39-H-002',
		condition: 'Baik',
		location: 'Rak S1',
		status: 'Disewa'
	},
	{
		id: 'u3',
		variantId: '2-a',
		variantName: '39 / Hitam',
		code: 'SPT-AR-39-H-003',
		condition: 'Perlu pemeriksaan',
		location: 'Area QC',
		status: 'Perawatan'
	},
	{
		id: 'u4',
		variantId: '2-b',
		variantName: '40 / Hitam',
		code: 'SPT-AR-40-H-001',
		condition: 'Baik',
		location: 'Rak S2',
		status: 'Tersedia'
	},
	{
		id: 'u5',
		variantId: '2-b',
		variantName: '40 / Hitam',
		code: 'SPT-AR-40-H-002',
		condition: 'Baik',
		location: 'Rak S2',
		status: 'Tersedia'
	},
	{
		id: 'u6',
		variantId: '2-b',
		variantName: '40 / Hitam',
		code: 'SPT-AR-40-H-003',
		condition: 'Baik',
		location: 'Rak S2',
		status: 'Disewa'
	},
	{
		id: 'u7',
		variantId: '2-c',
		variantName: '41 / Cokelat',
		code: 'SPT-AR-41-C-001',
		condition: 'Baik',
		location: 'Rak S3',
		status: 'Tersedia'
	},
	{
		id: 'u8',
		variantId: '3-a',
		variantName: 'Biru',
		code: 'CAR-CS60-B-001',
		condition: 'Perlu pemeriksaan',
		location: 'Area QC',
		status: 'Perawatan'
	},
	{
		id: 'u9',
		variantId: '3-b',
		variantName: 'Hitam',
		code: 'CAR-CS60-H-001',
		condition: 'Baik',
		location: 'Rak C1',
		status: 'Tersedia'
	}
];

export const inventoryActivities: InventoryActivity[] = [
	{
		id: 'a1',
		type: 'stock',
		title: 'Stok ditambah 2 unit',
		detail: 'Penyesuaian stok · Pembelian baru',
		actor: 'Admin OutdoorPOS',
		date: 'Hari ini, 09.42'
	},
	{
		id: 'a2',
		type: 'condition',
		title: 'Kondisi unit diperbarui',
		detail: 'SPT-AR-39-H-003 · Baik menjadi Perlu pemeriksaan',
		actor: 'Raka',
		date: 'Kemarin, 16.20'
	},
	{
		id: 'a3',
		type: 'price',
		title: 'Harga varian diperbarui',
		detail: 'Harga paket Rp80.000 menjadi Rp85.000',
		actor: 'Admin OutdoorPOS',
		date: '12 Nov 2026'
	},
	{
		id: 'a4',
		type: 'product',
		title: 'Produk dibuat',
		detail: 'Produk dan tiga varian ditambahkan',
		actor: 'Admin OutdoorPOS',
		date: '2 Nov 2026'
	}
];

export function findProduct(id: string) {
	return inventoryProducts.find((product) => product.id === id);
}

export function unitsForProduct(id: string) {
	const variantIds = new Set(findProduct(id)?.variants.map((variant) => variant.id) ?? []);
	return productUnits.filter((unit) => variantIds.has(unit.variantId));
}

export const rupiah = (value: number) =>
	new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		maximumFractionDigits: 0
	}).format(value);
