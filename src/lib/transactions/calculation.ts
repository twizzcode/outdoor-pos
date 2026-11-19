import type { RentalItem } from './types';

const DAY_MS = 86_400_000;

export function rentalDays(startDate: string, returnDate: string): number {
	const start = new Date(`${startDate}T00:00:00Z`).getTime();
	const end = new Date(`${returnDate}T00:00:00Z`).getTime();
	if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0;
	return Math.floor((end - start) / DAY_MS) + 1;
}

export function extraRentalDays(startDate: string, returnDate: string): number {
	return Math.max(0, rentalDays(startDate, returnDate) - 3);
}

export function rentalSubtotal(items: RentalItem[], startDate: string, returnDate: string): number {
	const extraDays = extraRentalDays(startDate, returnDate);
	return items.reduce(
		(total, item) => total + (item.packagePrice + item.extraDailyPrice * extraDays) * item.quantity,
		0
	);
}

export function rentalTotal(
	items: RentalItem[],
	startDate: string,
	returnDate: string,
	discount: number,
	deposit: number
): number {
	return Math.max(0, rentalSubtotal(items, startDate, returnDate) - discount) + deposit;
}
