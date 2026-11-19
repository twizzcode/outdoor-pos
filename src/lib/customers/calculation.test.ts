import assert from 'node:assert/strict';
import { customerMetrics } from './calculation';
import type { RentalTransaction } from '#lib/transactions/types';

const transaction = {
	id: 'tr1',
	code: 'RNT-1',
	customerId: 'c1',
	customerName: 'Dimas',
	customerPhone: '08',
	startDate: '2026-11-01',
	returnDate: '2026-11-03',
	status: 'Terlambat',
	paymentStatus: 'Lunas',
	paymentMethod: 'Tunai',
	discount: 10_000,
	deposit: 100_000,
	paid: 140_000,
	createdAt: '',
	items: [
		{
			id: 'i1',
			productId: 'p1',
			productName: 'Tenda',
			variantId: 'v1',
			variantName: 'Standar',
			quantity: 1,
			packagePrice: 150_000,
			extraDailyPrice: 45_000,
			unitCodes: []
		}
	]
} satisfies RentalTransaction;

assert.deepEqual(customerMetrics('c1', [transaction]), {
	totalTransactions: 1,
	activeRentals: 1,
	totalSpent: 140_000,
	lateRentals: 1
});
assert.deepEqual(customerMetrics('unknown', [transaction]), {
	totalTransactions: 0,
	activeRentals: 0,
	totalSpent: 0,
	lateRentals: 0
});

console.log('customer-calculation: ok');
