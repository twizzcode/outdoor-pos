import { rentalTotal } from '#lib/transactions/calculation';
import type { RentalTransaction } from '#lib/transactions/types';
import type { CustomerMetrics } from './types';

export function customerMetrics(
	customerId: string,
	transactions: RentalTransaction[]
): CustomerMetrics {
	const customerTransactions = transactions.filter((item) => item.customerId === customerId);
	return {
		totalTransactions: customerTransactions.length,
		activeRentals: customerTransactions.filter((item) =>
			['Reservasi', 'Siap diambil', 'Sedang disewa', 'Terlambat'].includes(item.status)
		).length,
		totalSpent: customerTransactions
			.filter((item) => item.status !== 'Dibatalkan')
			.reduce(
				(total, item) =>
					total + rentalTotal(item.items, item.startDate, item.returnDate, item.discount, 0),
				0
			),
		lateRentals: customerTransactions.filter((item) => item.status === 'Terlambat').length
	};
}
