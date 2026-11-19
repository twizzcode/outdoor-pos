import type { MaintenanceRecord } from './types';

export function maintenanceCosts(records: MaintenanceRecord[]) {
	return records.reduce(
		(total, record) => ({
			estimated: total.estimated + Math.max(0, record.estimatedCost),
			actual: total.actual + Math.max(0, record.actualCost)
		}),
		{ estimated: 0, actual: 0 }
	);
}
