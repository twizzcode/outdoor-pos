export type TransactionStatus =
	'Draft' | 'Reservasi' | 'Siap diambil' | 'Sedang disewa' | 'Terlambat' | 'Selesai' | 'Dibatalkan';
export type PaymentStatus = 'Belum dibayar' | 'DP' | 'Lunas';

export type RentalCustomer = {
	id: string;
	name: string;
	phone: string;
	address: string;
	status: 'Aktif' | 'Diblokir';
};

export type RentalItem = {
	id: string;
	productId: string;
	productName: string;
	variantId: string;
	variantName: string;
	quantity: number;
	packagePrice: number;
	extraDailyPrice: number;
	unitCodes: string[];
};

export type RentalTransaction = {
	id: string;
	code: string;
	customerId: string;
	customerName: string;
	customerPhone: string;
	startDate: string;
	returnDate: string;
	status: TransactionStatus;
	paymentStatus: PaymentStatus;
	paymentMethod: string;
	items: RentalItem[];
	discount: number;
	deposit: number;
	paid: number;
	notes?: string;
	createdAt: string;
};
