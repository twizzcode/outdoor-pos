import type { ProductAttribute } from './types';

export function createCombinations(attributes: ProductAttribute[]): string[] {
	return attributes.reduce<string[]>(
		(combinations, attribute) =>
			combinations.flatMap((combination) =>
				attribute.values.map((value) => (combination ? `${combination} / ${value}` : value))
			),
		['']
	);
}
