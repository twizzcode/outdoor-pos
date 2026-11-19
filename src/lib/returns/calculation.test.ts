import assert from 'node:assert/strict';
import { lateDays, lateFee, returnFinancials } from './calculation';

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

assert.equal(lateDays('2026-11-19', '2026-11-19'), 0);
assert.equal(lateDays('2026-11-19', '2026-11-21'), 2);
assert.equal(lateFee([item], 2), 180_000);
assert.deepEqual(returnFinancials(200_000, 50_000, 25_000, 0, 0), {
	charges: 75_000,
	depositRefund: 125_000,
	additionalPayment: 0
});
assert.deepEqual(returnFinancials(100_000, 80_000, 50_000, 20_000, -10_000), {
	charges: 150_000,
	depositRefund: 0,
	additionalPayment: 50_000
});

console.log('return-calculation: ok');
