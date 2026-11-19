export type MaintenanceStatus =
	| 'Menunggu pemeriksaan'
	| 'Menunggu perbaikan'
	| 'Sedang dikerjakan'
	| 'Selesai'
	| 'Tidak dapat diperbaiki';

export type DamageLevel = 'Ringan' | 'Sedang' | 'Berat';

export type MaintenanceRecord = {
	id: string;
	unitCode: string;
	productId: string;
	productName: string;
	variantName: string;
	status: MaintenanceStatus;
	damageLevel: DamageLevel;
	issue: string;
	source: string;
	location: string;
	assignee: string;
	estimatedCost: number;
	actualCost: number;
	reportedAt: string;
	startedAt?: string;
	completedAt?: string;
	actions: string;
	notes: string;
};
