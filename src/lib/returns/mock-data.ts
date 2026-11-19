import type { ReturnSummary } from './types';

export const returnSummaries: ReturnSummary[] = [
	{ transactionId: 'tr1', status: 'Menunggu' },
	{ transactionId: 'tr2', status: 'Terlambat' },
	{
		transactionId: 'tr4',
		status: 'Selesai',
		actualReturnDate: '2026-11-16',
		completedAt: '16 Nov 2026, 17.42'
	}
];

export function findReturnSummary(transactionId: string) {
	return returnSummaries.find((item) => item.transactionId === transactionId);
}
