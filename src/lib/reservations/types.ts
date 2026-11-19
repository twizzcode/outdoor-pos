import type { RentalItem } from '#lib/transactions/types';

export type ReservationStatus =
	'Draft' | 'Dikonfirmasi' | 'Siap diambil' | 'Dikonversi' | 'Dibatalkan';

export type Reservation = {
	id: string;
	code: string;
	customerId: string;
	customerName: string;
	customerPhone: string;
	startDate: string;
	returnDate: string;
	pickupTime: string;
	status: ReservationStatus;
	items: RentalItem[];
	deposit: number;
	notes: string;
	createdAt: string;
};
