import assert from 'node:assert/strict';
import { reportSummary } from './calculation';

assert.deepEqual(
	reportSummary({
		revenue: [{ label: 'Sen', revenue: 300_000, transactions: 2 }],
		products: [{ name: 'Tenda', category: 'Tenda', rentals: 2, revenue: 300_000, utilization: 75 }],
		status: [],
		maintenance: [{ label: 'Perbaikan', cost: 50_000 }]
	}),
	{
		revenue: 300_000,
		transactions: 2,
		averageOrder: 150_000,
		maintenanceCost: 50_000,
		averageUtilization: 75
	}
);

console.log('report-calculation: ok');
