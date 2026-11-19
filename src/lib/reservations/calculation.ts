import { inventoryProducts } from '#lib/inventory/mock-data';
import { rentalTransactions } from '#lib/transactions/mock-data';
import type { Reservation } from './types';

const activeReservationStatuses = new Set(['Draft', 'Dikonfirmasi', 'Siap diambil']);
const activeTransactionStatuses = new Set([
	'Reservasi',
	'Siap diambil',
	'Sedang disewa',
	'Terlambat'
]);

export function rangesOverlap(startA: string, endA: string, startB: string, endB: string) {
	return startA <= endB && startB <= endA;
}

export function reservedQuantity(
	variantId: string,
	startDate: string,
	returnDate: string,
	reservations: Reservation[],
	excludeReservationId?: string
) {
	const fromReservations = reservations
		.filter(
			(item) =>
				item.id !== excludeReservationId &&
				activeReservationStatuses.has(item.status) &&
				rangesOverlap(startDate, returnDate, item.startDate, item.returnDate)
		)
		.flatMap((item) => item.items)
		.filter((item) => item.variantId === variantId)
		.reduce((total, item) => total + item.quantity, 0);

	const fromTransactions = rentalTransactions
		.filter(
			(item) =>
				activeTransactionStatuses.has(item.status) &&
				rangesOverlap(startDate, returnDate, item.startDate, item.returnDate)
		)
		.flatMap((item) => item.items)
		.filter((item) => item.variantId === variantId)
		.reduce((total, item) => total + item.quantity, 0);

	return fromReservations + fromTransactions;
}

export function availableQuantity(
	variantId: string,
	startDate: string,
	returnDate: string,
	reservations: Reservation[],
	excludeReservationId?: string
) {
	const stock = inventoryProducts
		.flatMap((product) => product.variants)
		.find((variant) => variant.id === variantId)?.stock;
	if (stock === undefined || !startDate || !returnDate || startDate > returnDate) return 0;
	return Math.max(
		0,
		stock - reservedQuantity(variantId, startDate, returnDate, reservations, excludeReservationId)
	);
}

export function dateRange(startDate: string, returnDate: string) {
	const start = new Date(`${startDate}T00:00:00Z`);
	const end = new Date(`${returnDate}T00:00:00Z`);
	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];
	const result: string[] = [];
	for (const date = start; date <= end; date.setUTCDate(date.getUTCDate() + 1)) {
		result.push(date.toISOString().slice(0, 10));
	}
	return result;
}
