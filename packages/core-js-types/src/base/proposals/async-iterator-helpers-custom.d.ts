/// <reference types="../core-js-types/async-iterator" />

// Motivation: Custom type needed to keep generics strict

// https://github.com/tc39/proposal-async-iterator-helpers

declare namespace CoreJS {
  export type AsyncIteratorFlatMap<T, U> = (callback: (value: T, index: number) => Iterator<U, unknown, undefined> | Iterable<U, unknown, undefined> | AsyncIterator<U> | AsyncIterable<U>) => AsyncIteratorObject<U, undefined, unknown>;

  export type AsyncIteratorMap<T, U> = (callbackfn: (value: T, index: number) => U) => AsyncIteratorObject<Awaited<U>, undefined, unknown>;

  export type AsyncIteratorReduce<T, U = T> = (callbackfn: (accumulator: U, value: T, index: number) => U, initialValue?: U) => Promise<U>;
}
