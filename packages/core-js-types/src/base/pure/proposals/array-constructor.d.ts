/// <reference types="./iterator" />
/// <reference types="../core-js-types/promise" />

// Motivation: We must omit method `fromAsync` because it causes a signature mismatch error.

// https://github.com/tc39/proposal-array-from-async

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.es2026.array.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

declare namespace CoreJS {
  type ArrayConstructorBase = Omit<ArrayConstructor, 'fromAsync'>;

  export interface CoreJSArrayConstructor extends ArrayConstructorBase {
    /**
     * Creates an array from an async iterator or iterable object.
     * @param iterableOrArrayLike - An async iterator or array-like object to convert to an array.
     */
    fromAsync<T>(iterableOrArrayLike: CoreJSAsyncIterable<T> | Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>): CoreJSPromise<T[]>;

    /**
     * Creates an array from an async iterator or iterable object.
     *
     * @param iterableOrArrayLike - An async iterator or array-like object to convert to an array.
     * @param mapFn - A mapping function to call on every element of iterableOrArrayLike.
     *      Each return value is awaited before being added to result array.
     * @param thisArg - Value of 'this' used when executing mapFn.
     */
    fromAsync<T, U>(iterableOrArrayLike: CoreJSAsyncIterable<T> | Iterable<T> | ArrayLike<T>, mapFn: (value: Awaited<T>, index: number) => U, thisArg?: any): CoreJSPromise<Awaited<U>[]>;
  }

  var CoreJSArray: CoreJSArrayConstructor;
}
