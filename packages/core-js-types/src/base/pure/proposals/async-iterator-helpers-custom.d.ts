/// <reference types="../core-js-types/async-iterator-object" />
/// <reference types="../core-js-types/iterator-object" />

// Motivation: Using our own type for AsyncIteratorObject

// https://github.com/tc39/proposal-async-iterator-helpers

declare namespace CoreJS {
  export type AsyncIteratorFlatMap<T, U> = (callback: (value: T, index: number) => Iterator<U, unknown, undefined> | Iterable<U, unknown, undefined> | CoreJS.CoreJSAsyncIterator<U> | CoreJS.CoreJSAsyncIterable<U>) => CoreJS.CoreJSAsyncIteratorObject<U, undefined, unknown>;

  export type AsyncIteratorMap<T, U> = (callback: (value: T, index: number) => U) => CoreJS.CoreJSAsyncIteratorObject<Awaited<U>, undefined, unknown>;

  export type AsyncIteratorReduce<T, U = T> = (callback: (accumulator: U, value: T, index: number) => U, initialValue?: U) => CoreJS.CoreJSPromise<U>;
}
