import type { RentalCustomer, RentalTransaction } from './types';

export const rentalCustomers: RentalCustomer[] = [
	{
		id: 'c1',
		name: 'Dimas Pratama',
		phone: '0812-3456-7890',
		address: 'Sleman, Yogyakarta',
		status: 'Aktif'
	},
	{
		id: 'c2',
		name: 'Nadia Putri',
		phone: '0857-1122-3344',
		address: 'Bantul, Yogyakarta',
		status: 'Aktif'
	},
	{
		id: 'c3',
		name: 'Fajar Ramadhan',
		phone: '0813-7788-9900',
		address: 'Kota Yogyakarta',
		status: 'Aktif'
	},
	{
		id: 'c4',
		name: 'Salsa Maharani',
		phone: '0821-4455-6677',
		address: 'Kulon Progo',
		status: 'Aktif'
	},
	{
		id: 'c5',
		name: 'Rio Saputra',
		phone: '0819-1010-2020',
		address: 'Gunungkidul',
		status: 'Diblokir'
	}
];

export const rentalTransactions: RentalTransaction[] = [
	{
		id: 'tr1',
		code: 'RNT-261118-001',
		customerId: 'c1',
		customerName: 'Dimas Pratama',
		customerPhone: '0812-3456-7890',
		startDate: '2026-11-18',
		returnDate: '2026-11-20',
		status: 'Sedang disewa',
		paymentStatus: 'Lunas',
		paymentMethod: 'QRIS',
		discount: 20_000,
		deposit: 200_000,
		paid: 465_000,
		createdAt: '18 Nov 2026, 08.35',
		notes: 'Barang diambil langsung di toko.',
		items: [
			{
				id: 'ri1',
				productId: '1',
				productName: 'Tenda Dome 4 Orang',
				variantId: '1-a',
				variantName: 'Standar',
				quantity: 1,
				packagePrice: 150_000,
				extraDailyPrice: 45_000,
				unitCodes: []
			},
			{
				id: 'ri2',
				productId: '2',
				productName: 'Sepatu Hiking Arei',
				variantId: '2-b',
				variantName: '40 / Hitam',
				quantity: 1,
				packagePrice: 85_000,
				extraDailyPrice: 25_000,
				unitCodes: ['SPT-AR-40-H-003']
			},
			{
				id: 'ri3',
				productId: '4',
				productName: 'Kompor Portable',
				variantId: '4-a',
				variantName: 'Standar',
				quantity: 1,
				packagePrice: 50_000,
				extraDailyPrice: 15_000,
				unitCodes: []
			}
		]
	},
	{
		id: 'tr2',
		code: 'RNT-261117-002',
		customerId: 'c2',
		customerName: 'Nadia Putri',
		customerPhone: '0857-1122-3344',
		startDate: '2026-11-17',
		returnDate: '2026-11-19',
		status: 'Terlambat',
		paymentStatus: 'DP',
		paymentMethod: 'Transfer',
		discount: 0,
		deposit: 150_000,
		paid: 200_000,
		createdAt: '17 Nov 2026, 14.12',
		items: [
			{
				id: 'ri4',
				productId: '3',
				productName: 'Carrier Consina 60L',
				variantId: '3-b',
				variantName: 'Hitam',
				quantity: 1,
				packagePrice: 120_000,
				extraDailyPrice: 35_000,
				unitCodes: ['CAR-CS60-H-001']
			}
		]
	},
	{
		id: 'tr3',
		code: 'RNT-261121-003',
		customerId: 'c3',
		customerName: 'Fajar Ramadhan',
		customerPhone: '0813-7788-9900',
		startDate: '2026-11-21',
		returnDate: '2026-11-23',
		status: 'Reservasi',
		paymentStatus: 'DP',
		paymentMethod: 'Tunai',
		discount: 10_000,
		deposit: 250_000,
		paid: 150_000,
		createdAt: '18 Nov 2026, 16.40',
		items: [
			{
				id: 'ri5',
				productId: '1',
				productName: 'Tenda Dome 4 Orang',
				variantId: '1-a',
				variantName: 'Standar',
				quantity: 2,
				packagePrice: 150_000,
				extraDailyPrice: 45_000,
				unitCodes: []
			}
		]
	},
	{
		id: 'tr4',
		code: 'RNT-261116-004',
		customerId: 'c4',
		customerName: 'Salsa Maharani',
		customerPhone: '0821-4455-6677',
		startDate: '2026-11-14',
		returnDate: '2026-11-16',
		status: 'Selesai',
		paymentStatus: 'Lunas',
		paymentMethod: 'QRIS',
		discount: 0,
		deposit: 100_000,
		paid: 200_000,
		createdAt: '14 Nov 2026, 07.30',
		items: [
			{
				id: 'ri6',
				productId: '4',
				productName: 'Kompor Portable',
				variantId: '4-a',
				variantName: 'Standar',
				quantity: 2,
				packagePrice: 50_000,
				extraDailyPrice: 15_000,
				unitCodes: []
			}
		]
	},
	{
		id: 'tr5',
		code: 'RNT-261120-005',
		customerId: 'c2',
		customerName: 'Nadia Putri',
		customerPhone: '0857-1122-3344',
		startDate: '2026-11-20',
		returnDate: '2026-11-24',
		status: 'Siap diambil',
		paymentStatus: 'Belum dibayar',
		paymentMethod: '-',
		discount: 0,
		deposit: 100_000,
		paid: 0,
		createdAt: '18 Nov 2026, 18.10',
		items: [
			{
				id: 'ri7',
				productId: '5',
				productName: 'Sleeping Bag Polar',
				variantId: '5-a',
				variantName: 'Regular',
				quantity: 1,
				packagePrice: 65_000,
				extraDailyPrice: 20_000,
				unitCodes: []
			}
		]
	}
];

export function findTransaction(id: string) {
	return rentalTransactions.find((transaction) => transaction.id === id);
}
