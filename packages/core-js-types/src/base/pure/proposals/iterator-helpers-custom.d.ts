/// <reference types="../core-js-types/iterator-object" />

// Motivation: Using our own type for IteratorObject

// https://github.com/tc39/proposal-iterator-helpers

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.es2025.iterator.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

declare namespace CoreJS {
  export type IteratorFlatMap<T, U> = (callback: (value: T, index: number) => Iterator<U, unknown, undefined> | Iterable<U, unknown, undefined>) => CoreJS.CoreJSIteratorObject<U, undefined, unknown>;

  export type IteratorMap<T, U> = (callbackfn: (value: T, index: number) => U) => CoreJS.CoreJSIteratorObject<U, undefined, unknown>;

  export type IteratorReduce<T, U = T> = (callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue?: U) => U;
}
