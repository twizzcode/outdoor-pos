import assert from 'node:assert/strict';
import { maintenanceCosts } from './calculation';
import type { MaintenanceRecord } from './types';

const base = {
	id: 'm1',
	unitCode: 'U-1',
	productId: '1',
	productName: 'Tenda',
	variantName: 'Standar',
	status: 'Selesai',
	damageLevel: 'Ringan',
	issue: '',
	source: '',
	location: '',
	assignee: '',
	reportedAt: '',
	actions: '',
	notes: ''
} satisfies Omit<MaintenanceRecord, 'estimatedCost' | 'actualCost'>;

assert.deepEqual(
	maintenanceCosts([
		{ ...base, estimatedCost: 50_000, actualCost: 45_000 },
		{ ...base, id: 'm2', estimatedCost: -10_000, actualCost: 20_000 }
	]),
	{ estimated: 50_000, actual: 65_000 }
);

console.log('maintenance-calculation: ok');
