import type { Reservation } from './types';

export const reservations: Reservation[] = [
	{
		id: 'res1',
		code: 'RSV-261121-001',
		customerId: 'c6',
		customerName: 'Alya Rahma',
		customerPhone: '0851-2244-6688',
		startDate: '2026-11-21',
		returnDate: '2026-11-23',
		pickupTime: '07:30',
		status: 'Dikonfirmasi',
		deposit: 100_000,
		createdAt: '18 Nov 2026, 10.15',
		notes: 'Konfirmasi ulang melalui WhatsApp satu hari sebelum pengambilan.',
		items: [
			{
				id: 'rsi1',
				productId: '2',
				productName: 'Sepatu Hiking Arei',
				variantId: '2-a',
				variantName: '39 / Hitam',
				quantity: 1,
				packagePrice: 85_000,
				extraDailyPrice: 25_000,
				unitCodes: []
			},
			{
				id: 'rsi2',
				productId: '6',
				productName: 'Headlamp 300 Lumen',
				variantId: '6-a',
				variantName: 'Standar',
				quantity: 2,
				packagePrice: 35_000,
				extraDailyPrice: 10_000,
				unitCodes: []
			}
		]
	},
	{
		id: 'res2',
		code: 'RSV-261120-002',
		customerId: 'c7',
		customerName: 'Bagas Wicaksono',
		customerPhone: '0878-5511-2200',
		startDate: '2026-11-20',
		returnDate: '2026-11-22',
		pickupTime: '16:00',
		status: 'Siap diambil',
		deposit: 200_000,
		createdAt: '17 Nov 2026, 13.40',
		notes: 'Barang disiapkan dalam satu paket.',
		items: [
			{
				id: 'rsi3',
				productId: '3',
				productName: 'Carrier Consina 60L',
				variantId: '3-a',
				variantName: 'Biru',
				quantity: 1,
				packagePrice: 120_000,
				extraDailyPrice: 35_000,
				unitCodes: []
			}
		]
	},
	{
		id: 'res3',
		code: 'RSV-261125-003',
		customerId: 'c8',
		customerName: 'Intan Permata',
		customerPhone: '0812-7700-4499',
		startDate: '2026-11-25',
		returnDate: '2026-11-29',
		pickupTime: '08:00',
		status: 'Draft',
		deposit: 150_000,
		createdAt: '19 Nov 2026, 08.20',
		notes: 'Menunggu konfirmasi jumlah peserta.',
		items: [
			{
				id: 'rsi4',
				productId: '1',
				productName: 'Tenda Dome 4 Orang',
				variantId: '1-a',
				variantName: 'Standar',
				quantity: 3,
				packagePrice: 150_000,
				extraDailyPrice: 45_000,
				unitCodes: []
			}
		]
	},
	{
		id: 'res4',
		code: 'RSV-261128-004',
		customerId: 'c3',
		customerName: 'Fajar Ramadhan',
		customerPhone: '0813-7788-9900',
		startDate: '2026-11-28',
		returnDate: '2026-11-30',
		pickupTime: '06:30',
		status: 'Dikonfirmasi',
		deposit: 100_000,
		createdAt: '16 Nov 2026, 11.05',
		notes: '',
		items: [
			{
				id: 'rsi5',
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
		id: 'res5',
		code: 'RSV-261115-005',
		customerId: 'c4',
		customerName: 'Salsa Maharani',
		customerPhone: '0821-4455-6677',
		startDate: '2026-11-15',
		returnDate: '2026-11-17',
		pickupTime: '09:00',
		status: 'Dikonversi',
		deposit: 100_000,
		createdAt: '12 Nov 2026, 15.20',
		notes: 'Sudah menjadi transaksi RNT-261116-004.',
		items: [
			{
				id: 'rsi6',
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
		id: 'res6',
		code: 'RSV-261124-006',
		customerId: 'c2',
		customerName: 'Nadia Putri',
		customerPhone: '0857-1122-3344',
		startDate: '2026-11-24',
		returnDate: '2026-11-26',
		pickupTime: '10:00',
		status: 'Dibatalkan',
		deposit: 0,
		createdAt: '18 Nov 2026, 09.10',
		notes: 'Pelanggan mengubah jadwal perjalanan.',
		items: [
			{
				id: 'rsi7',
				productId: '5',
				productName: 'Sleeping Bag Polar',
				variantId: '5-a',
				variantName: 'Regular',
				quantity: 2,
				packagePrice: 65_000,
				extraDailyPrice: 20_000,
				unitCodes: []
			}
		]
	}
];

export function findReservation(id: string) {
	return reservations.find((reservation) => reservation.id === id);
}
