export type ReportPeriod = '7 hari' | '30 hari' | '6 bulan';

export type RevenuePoint = {
	label: string;
	revenue: number;
	transactions: number;
};

export type ProductPerformance = {
	name: string;
	category: string;
	rentals: number;
	revenue: number;
	utilization: number;
};

export type ReportData = {
	revenue: RevenuePoint[];
	products: ProductPerformance[];
	status: { status: string; count: number }[];
	maintenance: { label: string; cost: number }[];
};
