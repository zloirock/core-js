// proposal stage: 4
// https://github.com/tc39/proposal-array-grouping

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/069de743dbd17b47cc2fc58e1d16da5410911284/src/lib/es2024.object.d.ts#L7
// https://github.com/microsoft/TypeScript/blob/069de743dbd17b47cc2fc58e1d16da5410911284/src/lib/es2024.collection.d.ts#L7
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt
interface ObjectConstructor {
  groupBy<K extends PropertyKey, T>(items: Iterable<T>, keySelector: (item: T, index: number) => K): Partial<Record<K, T[]>>;
}

interface MapConstructor {
  groupBy<K, T>(items: Iterable<T>, keySelector: (item: T, index: number) => K): Map<K, T[]>;
}
