export type ReturnStatus = 'Menunggu' | 'Jatuh tempo' | 'Terlambat' | 'Selesai';
export type ReturnCondition =
	'Baik' | 'Perlu dibersihkan' | 'Rusak ringan' | 'Rusak berat' | 'Hilang';

export type ReturnInspection = {
	id: string;
	rentalItemId: string;
	productName: string;
	variantName: string;
	unitCode?: string;
	expectedQuantity: number;
	returnedQuantity: number;
	lostQuantity: number;
	condition: ReturnCondition;
	damageFee: number;
	lostFee: number;
	notes: string;
	inspected: boolean;
};

export type ReturnSummary = {
	transactionId: string;
	status: ReturnStatus;
	actualReturnDate?: string;
	completedAt?: string;
};

export type ReturnFinancials = {
	charges: number;
	depositRefund: number;
	additionalPayment: number;
};
