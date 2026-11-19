import type { ReportData } from './types';

export function reportSummary(data: ReportData) {
	return {
		revenue: data.revenue.reduce((sum, item) => sum + item.revenue, 0),
		transactions: data.revenue.reduce((sum, item) => sum + item.transactions, 0),
		averageOrder: data.revenue.reduce((sum, item) => sum + item.transactions, 0)
			? Math.round(
					data.revenue.reduce((sum, item) => sum + item.revenue, 0) /
						data.revenue.reduce((sum, item) => sum + item.transactions, 0)
				)
			: 0,
		maintenanceCost: data.maintenance.reduce((sum, item) => sum + item.cost, 0),
		averageUtilization: data.products.length
			? Math.round(
					data.products.reduce((sum, item) => sum + item.utilization, 0) / data.products.length
				)
			: 0
	};
}
