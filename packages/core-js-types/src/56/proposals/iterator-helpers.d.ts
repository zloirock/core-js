// proposal stage: 4
// https://github.com/tc39/proposal-iterator-helpers

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/d3be7e171bf3149fe93c3ce5a85280f1eba3ef8d/src/lib/esnext.iterator.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

import { CoreJsIteratorObject } from '../core-js-types/core-js-types';

declare global {
  interface Iterator<T> {
    map<U>(callbackfn: (value: T, index: number) => U): CoreJsIteratorObject<U, undefined, unknown>;

    filter<S extends T>(predicate: (value: T, index: number) => value is S): CoreJsIteratorObject<S, undefined, unknown>;
    filter(predicate: (value: T, index: number) => unknown): CoreJsIteratorObject<T, undefined, unknown>;

    take(limit: number): CoreJsIteratorObject<T, undefined, unknown>;

    drop(count: number): CoreJsIteratorObject<T, undefined, unknown>;

    flatMap<U>(callback: (value: T, index: number) => Iterator<U, unknown, undefined> | Iterable<U, unknown, undefined>): CoreJsIteratorObject<U, undefined, unknown>;  // ts < 5.6 Iterable<T>

    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number) => T): T;
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number) => T, initialValue: T): T;
    reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U): U;

    toArray(): T[];

    forEach(callbackfn: (value: T, index: number) => void): void;

    some(predicate: (value: T, index: number) => unknown): boolean;

    every(predicate: (value: T, index: number) => unknown): boolean;

    find<S extends T>(predicate: (value: T, index: number) => value is S): S | undefined;
    find(predicate: (value: T, index: number) => unknown): T | undefined;
  }

  interface IteratorConstructor {
    from<T>(value: Iterator<T, unknown, undefined> | Iterable<T, unknown, undefined>): IteratorObject<T, undefined, unknown>;
  }

  var Iterator: IteratorConstructor;
}

export {};
