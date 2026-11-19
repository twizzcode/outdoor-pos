export type TrackingMode = 'quantity' | 'unit';
export type InventoryStatus = 'Tersedia' | 'Stok rendah' | 'Perawatan' | 'Habis';

export type ProductAttribute = {
	name: string;
	values: string[];
};

export type ProductVariant = {
	id: string;
	sku: string;
	name: string;
	packagePrice: number;
	extraDailyPrice: number;
	stock: number;
	available: number;
};

export type InventoryProduct = {
	id: string;
	name: string;
	sku: string;
	category: string;
	trackingMode: TrackingMode;
	status: InventoryStatus;
	variants: ProductVariant[];
	icon: string;
	brand?: string;
	description?: string;
};

export type InventoryUnit = {
	code: string;
	condition: 'Baik' | 'Perlu pemeriksaan' | 'Rusak';
	location: string;
};

export type UnitStatus = 'Tersedia' | 'Disewa' | 'Dipesan' | 'Perawatan';

export type ProductUnit = InventoryUnit & {
	id: string;
	variantId: string;
	variantName: string;
	status: UnitStatus;
};

export type InventoryActivity = {
	id: string;
	type: 'stock' | 'condition' | 'price' | 'product';
	title: string;
	detail: string;
	actor: string;
	date: string;
};
