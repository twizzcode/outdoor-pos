import type { ReportData, ReportPeriod } from './types';

const products = [
	{
		name: 'Tenda Dome 4 Orang',
		category: 'Tenda',
		rentals: 18,
		revenue: 2_700_000,
		utilization: 82
	},
	{
		name: 'Sepatu Hiking Arei',
		category: 'Sepatu',
		rentals: 15,
		revenue: 1_275_000,
		utilization: 74
	},
	{
		name: 'Carrier Consina 60L',
		category: 'Tas & Carrier',
		rentals: 12,
		revenue: 1_440_000,
		utilization: 69
	},
	{
		name: 'Kompor Portable',
		category: 'Peralatan Masak',
		rentals: 11,
		revenue: 550_000,
		utilization: 63
	},
	{
		name: 'Sleeping Bag Polar',
		category: 'Perlengkapan Tidur',
		rentals: 9,
		revenue: 585_000,
		utilization: 58
	}
];

const common = {
	products,
	status: [
		{ status: 'Selesai', count: 34 },
		{ status: 'Sedang disewa', count: 12 },
		{ status: 'Reservasi', count: 8 },
		{ status: 'Terlambat', count: 3 }
	],
	maintenance: [
		{ label: 'Sepatu', cost: 85_000 },
		{ label: 'Carrier', cost: 230_000 },
		{ label: 'Tenda', cost: 310_000 },
		{ label: 'Kompor', cost: 95_000 },
		{ label: 'Penerangan', cost: 40_000 }
	]
};

export const reportData: Record<ReportPeriod, ReportData> = {
	'7 hari': {
		...common,
		revenue: [
			{ label: 'Sen', revenue: 650_000, transactions: 4 },
			{ label: 'Sel', revenue: 820_000, transactions: 5 },
			{ label: 'Rab', revenue: 540_000, transactions: 3 },
			{ label: 'Kam', revenue: 1_050_000, transactions: 6 },
			{ label: 'Jum', revenue: 1_280_000, transactions: 7 },
			{ label: 'Sab', revenue: 1_610_000, transactions: 9 },
			{ label: 'Min', revenue: 1_340_000, transactions: 8 }
		]
	},
	'30 hari': {
		...common,
		revenue: [
			{ label: 'Minggu 1', revenue: 4_250_000, transactions: 24 },
			{ label: 'Minggu 2', revenue: 5_180_000, transactions: 29 },
			{ label: 'Minggu 3', revenue: 4_760_000, transactions: 27 },
			{ label: 'Minggu 4', revenue: 6_320_000, transactions: 35 }
		]
	},
	'6 bulan': {
		...common,
		revenue: [
			{ label: 'Jun', revenue: 12_800_000, transactions: 68 },
			{ label: 'Jul', revenue: 14_200_000, transactions: 74 },
			{ label: 'Agu', revenue: 13_600_000, transactions: 71 },
			{ label: 'Sep', revenue: 16_450_000, transactions: 86 },
			{ label: 'Okt', revenue: 18_100_000, transactions: 94 },
			{ label: 'Nov', revenue: 20_510_000, transactions: 115 }
		]
	}
};
