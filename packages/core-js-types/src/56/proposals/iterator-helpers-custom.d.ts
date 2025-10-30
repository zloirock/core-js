// proposal stage: 4
// https://github.com/tc39/proposal-iterator-helpers

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/d3be7e171bf3149fe93c3ce5a85280f1eba3ef8d/src/lib/esnext.iterator.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare namespace CoreJs {
  export type IteratorFlatMap<T, U> = (callback: (value: T, index: number) => Iterator<U, unknown, undefined> | Iterable<U, unknown, undefined>) => IteratorObject<U, undefined, unknown>;
  export type IteratorMap<T, U> = (callback: (value: T, index: number) => U) => IteratorObject<U, undefined, unknown>;
  export type IteratorReduce<T, U = T> = (callback: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue?: U) => U;
}
