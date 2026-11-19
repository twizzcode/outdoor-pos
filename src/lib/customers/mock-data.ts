import type { Customer } from './types';

export const customers: Customer[] = [
	{
		id: 'c1',
		code: 'CUS-001',
		name: 'Dimas Pratama',
		phone: '0812-3456-7890',
		email: 'dimas.pratama@example.com',
		address: 'Jl. Kaliurang Km 9, Sleman, Yogyakarta',
		identityNumber: '3404121504970001',
		emergencyContact: 'Rina · 0812-9988-7766',
		status: 'Aktif',
		notes: 'Pelanggan rutin. Biasanya mengambil barang pagi hari.',
		joinedAt: '12 Jan 2026'
	},
	{
		id: 'c2',
		code: 'CUS-002',
		name: 'Nadia Putri',
		phone: '0857-1122-3344',
		email: 'nadia.putri@example.com',
		address: 'Jl. Parangtritis No. 88, Bantul, Yogyakarta',
		identityNumber: '3402135210990003',
		emergencyContact: 'Ari · 0813-4400-2299',
		status: 'Aktif',
		notes: 'Konfirmasi pengembalian melalui WhatsApp.',
		joinedAt: '4 Mar 2026'
	},
	{
		id: 'c3',
		code: 'CUS-003',
		name: 'Fajar Ramadhan',
		phone: '0813-7788-9900',
		email: 'fajar.r@example.com',
		address: 'Kotabaru, Gondokusuman, Yogyakarta',
		identityNumber: '3471141205980002',
		emergencyContact: 'Dani · 0856-1100-2233',
		status: 'Aktif',
		notes: '',
		joinedAt: '22 Apr 2026'
	},
	{
		id: 'c4',
		code: 'CUS-004',
		name: 'Salsa Maharani',
		phone: '0821-4455-6677',
		email: 'salsa.maharani@example.com',
		address: 'Wates, Kulon Progo, Yogyakarta',
		identityNumber: '3401174309000004',
		emergencyContact: 'Maya · 0822-3355-7799',
		status: 'Aktif',
		notes: 'Tidak memerlukan kontak darurat tambahan.',
		joinedAt: '17 Jun 2026'
	},
	{
		id: 'c5',
		code: 'CUS-005',
		name: 'Rio Saputra',
		phone: '0819-1010-2020',
		email: 'rio.saputra@example.com',
		address: 'Wonosari, Gunungkidul, Yogyakarta',
		identityNumber: '3403161903950001',
		emergencyContact: 'Bagus · 0817-6600-1188',
		status: 'Diblokir',
		notes: 'Diblokir karena barang belum diselesaikan pada transaksi lama.',
		joinedAt: '9 Feb 2026'
	},
	{
		id: 'c6',
		code: 'CUS-006',
		name: 'Alya Rahma',
		phone: '0851-2244-6688',
		email: 'alya.rahma@example.com',
		address: 'Depok, Sleman, Yogyakarta',
		identityNumber: '3404116101010005',
		emergencyContact: 'Nisa · 0851-9000-1122',
		status: 'Aktif',
		notes: 'Belum pernah melakukan transaksi.',
		joinedAt: '10 Nov 2026'
	},
	{
		id: 'c7',
		code: 'CUS-007',
		name: 'Bagas Wicaksono',
		phone: '0878-5511-2200',
		email: 'bagas.w@example.com',
		address: 'Mergangsan, Yogyakarta',
		identityNumber: '3471122308960002',
		emergencyContact: 'Bayu · 0877-4422-1100',
		status: 'Aktif',
		notes: '',
		joinedAt: '14 Nov 2026'
	},
	{
		id: 'c8',
		code: 'CUS-008',
		name: 'Intan Permata',
		phone: '0812-7700-4499',
		email: 'intan.permata@example.com',
		address: 'Mlati, Sleman, Yogyakarta',
		identityNumber: '3404144902990007',
		emergencyContact: 'Rini · 0812-2211-9944',
		status: 'Aktif',
		notes: 'Prefer pembayaran QRIS.',
		joinedAt: '16 Nov 2026'
	}
];

export function findCustomer(id: string) {
	return customers.find((customer) => customer.id === id);
}
