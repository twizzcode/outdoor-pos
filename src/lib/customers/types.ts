export type CustomerStatus = 'Aktif' | 'Diblokir';

export type Customer = {
	id: string;
	code: string;
	name: string;
	phone: string;
	email: string;
	address: string;
	identityNumber: string;
	emergencyContact: string;
	status: CustomerStatus;
	notes: string;
	joinedAt: string;
};

export type CustomerMetrics = {
	totalTransactions: number;
	activeRentals: number;
	totalSpent: number;
	lateRentals: number;
};
