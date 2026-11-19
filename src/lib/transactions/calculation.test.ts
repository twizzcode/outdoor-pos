import assert from 'node:assert/strict';
import { extraRentalDays, rentalDays, rentalSubtotal } from './calculation';

const item = {
	id: '1',
	productId: '1',
	productName: 'Tenda',
	variantId: '1-a',
	variantName: 'Standar',
	quantity: 2,
	packagePrice: 150_000,
	extraDailyPrice: 45_000,
	unitCodes: []
};

assert.equal(rentalDays('2026-11-19', '2026-11-21'), 3);
assert.equal(extraRentalDays('2026-11-19', '2026-11-21'), 0);
assert.equal(extraRentalDays('2026-11-19', '2026-11-23'), 2);
assert.equal(rentalSubtotal([item], '2026-11-19', '2026-11-23'), 480_000);

console.log('rental-calculation: ok');
