import assert from 'node:assert/strict';
import { createCombinations } from './variant-combinations';

assert.deepEqual(
	createCombinations([
		{ name: 'Ukuran', values: ['39', '40'] },
		{ name: 'Warna', values: ['Hitam', 'Cokelat'] }
	]),
	['39 / Hitam', '39 / Cokelat', '40 / Hitam', '40 / Cokelat']
);

console.log('variant-combinations: ok');
