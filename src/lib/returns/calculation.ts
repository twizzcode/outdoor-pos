import type { ReturnFinancials } from './types';
import type { RentalItem } from '#lib/transactions/types';

const DAY_MS = 86_400_000;

export function lateDays(dueDate: string, actualReturnDate: string): number {
	const due = new Date(`${dueDate}T00:00:00Z`).getTime();
	const actual = new Date(`${actualReturnDate}T00:00:00Z`).getTime();
	if (!Number.isFinite(due) || !Number.isFinite(actual)) return 0;
	return Math.max(0, Math.floor((actual - due) / DAY_MS));
}

export function lateFee(items: RentalItem[], daysLate: number): number {
	return items.reduce(
		(total, item) => total + item.extraDailyPrice * item.quantity * Math.max(0, daysLate),
		0
	);
}

export function returnFinancials(
	deposit: number,
	lateCharge: number,
	damageFee: number,
	lostFee: number,
	manualFee: number
): ReturnFinancials {
	const charges = [lateCharge, damageFee, lostFee, manualFee].reduce(
		(total, value) => total + Math.max(0, Number(value) || 0),
		0
	);
	const safeDeposit = Math.max(0, Number(deposit) || 0);
	return {
		charges,
		depositRefund: Math.max(0, safeDeposit - charges),
		additionalPayment: Math.max(0, charges - safeDeposit)
	};
}
