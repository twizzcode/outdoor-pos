import { strict as assert } from 'node:assert';
import { availableQuantity, dateRange, rangesOverlap, reservedQuantity } from './calculation';
import { reservations } from './mock-data';

assert.equal(rangesOverlap('2026-11-20', '2026-11-22', '2026-11-22', '2026-11-24'), true);
assert.equal(rangesOverlap('2026-11-20', '2026-11-21', '2026-11-22', '2026-11-24'), false);
assert.deepEqual(dateRange('2026-11-20', '2026-11-22'), ['2026-11-20', '2026-11-21', '2026-11-22']);
assert.equal(reservedQuantity('1-a', '2026-11-25', '2026-11-27', reservations), 3);
assert.equal(availableQuantity('1-a', '2026-11-25', '2026-11-27', reservations), 9);
assert.equal(availableQuantity('missing', '2026-11-20', '2026-11-22', reservations), 0);

console.log('reservation-calculation: ok');
