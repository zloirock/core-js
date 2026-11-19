// Motivation: Custom type needed to keep generics strict

// https://github.com/tc39/proposal-iterator-helpers

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.es2025.iterator.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

declare namespace CoreJS {
  interface IteratorObject<T, TReturn, TNext> extends Iterator<T, TReturn, TNext> {}

  export type IteratorFlatMap<T, U> = (callback: (value: T, index: number) => Iterator<U, unknown, undefined> | Iterable<U, unknown, undefined>) => IteratorObject<U, undefined, unknown>;

  export type IteratorMap<T, U> = (callbackfn: (value: T, index: number) => U) => IteratorObject<U, undefined, unknown>;

  export type IteratorReduce<T, U = T> = (callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue?: U) => U;
}
