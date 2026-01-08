/// <reference types="./explicit-resource-management.d.ts" />
/// <reference types="../../core-js-types/promise.d.ts" />
/// <reference types="../../core-js-types/iterator-object.d.ts" />

// Motivation: Has dependencies on internal types

// proposal stage: 2.7
// https://github.com/tc39/proposal-iterator-chunking

// proposal stage: 4
// https://github.com/tc39/proposal-iterator-helpers

// proposal stage: 0
// https://github.com/bakkot/proposal-iterator-join

// proposal stage: 2.7
// https://github.com/tc39/proposal-joint-iteration

// proposal stage: 2
// https://github.com/tc39/proposal-iterator.range

// proposal stage: 2.7
// https://github.com/tc39/proposal-iterator-sequencing

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/d3be7e171bf3149fe93c3ce5a85280f1eba3ef8d/src/lib/esnext.iterator.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare namespace CoreJS {
  type ZipOptions = {
    mode?: 'shortest' | 'longest' | 'strict';

    padding?: object;
  };

  type IteratorRangeOptions<T> = {
    step?: T;

    inclusive?: boolean;
  };

  interface CoreJSPromiseLike<T> {
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | CoreJSPromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | CoreJSPromiseLike<TResult2>) | undefined | null): CoreJSPromiseLike<TResult1 | TResult2>;
  }

  interface CoreJSAsyncIterator<T, TReturn = any, TNext = any> {
    next(...[value]: [] | [TNext]): CoreJS.CoreJSPromise<IteratorResult<T, TReturn>>;
    return?(value?: TReturn | CoreJSPromiseLike<TReturn>): CoreJS.CoreJSPromise<IteratorResult<T, TReturn>>;
    throw?(e?: any): CoreJS.CoreJSPromise<IteratorResult<T, TReturn>>;
  }

  export interface CoreJSAsyncIteratorObject<T, TReturn = unknown, TNext = unknown> extends CoreJSAsyncIterator<T, TReturn, TNext> {}
  export interface CoreJSAsyncIteratorObject<T, TReturn = unknown, TNext = unknown> extends CoreJSAsyncDisposable {}
  export interface CoreJSAsyncIterable<T, TReturn = any, TNext = any> {
    [CoreJSSymbol.asyncIterator](): CoreJSAsyncIterator<T, TReturn, TNext>;
  }

  export interface CoreJSIteratorObject<T, TReturn = any, TNext = any> extends CoreJSDisposable {}

  export interface CoreJSIterator<T, TReturn = any, TNext = any> extends Iterator<T, TReturn, TNext> {
    /**
     * Yields arrays containing up to the specified number of elements
     * chunked from the source iterator.
     * @param chunkSize The maximum number of elements per chunk. Must be a positive integer.
     * @returns An iterator yielding arrays of at most `chunkSize` elements from the source iterator.
     */
    chunks(chunkSize: number): CoreJSIteratorObject<T[]>;

    /**
     * Yields overlapping arrays (windows) of the given size from the iterator.
     * @param windowSize The size of each window. Must be a positive integer.
     * @param undersized 'only-full' (default) to yield only full windows | 'allow-partial' to yield all windows.
     * @returns An iterator yielding arrays of the specified window size.
     */
    windows(windowSize: number, undersized?: 'only-full' | 'allow-partial' | undefined): CoreJSIteratorObject<T[]>;

    /**
     * Creates an iterator whose values are the result of applying the callback to the values from this iterator.
     * @param callbackfn A function that accepts up to two arguments to be used to transform values from the underlying iterator.
     */
    map<U>(callbackfn: (value: T, index: number) => U): CoreJSIteratorObject<U, undefined, unknown>;

    /**
     * Creates an iterator whose values are those from this iterator for which the provided predicate returns true.
     * @param predicate A function that accepts up to two arguments to be used to test values from the underlying iterator.
     */
    filter<S extends T>(predicate: (value: T, index: number) => value is S): CoreJSIteratorObject<S, undefined, unknown>;
    /**
     * Creates an iterator whose values are those from this iterator for which the provided predicate returns true.
     * @param predicate A function that accepts up to two arguments to be used to test values from the underlying iterator.
     */
    filter(predicate: (value: T, index: number) => unknown): CoreJSIteratorObject<T, undefined, unknown>;

    /**
     * Creates an iterator whose values are the values from this iterator, stopping once the provided limit is reached.
     * @param limit The maximum number of values to yield.
     */
    take(limit: number): CoreJSIteratorObject<T, undefined, unknown>;

    /**
     * Creates an iterator whose values are the values from this iterator after skipping the provided count.
     * @param count The number of values to drop.
     */
    drop(count: number): CoreJSIteratorObject<T, undefined, unknown>;

    /**
     * Creates an iterator whose values are the result of applying the callback to the values from this iterator and then flattening the resulting iterators or iterables.
     * @param callback A function that accepts up to two arguments to be used to transform values from the underlying iterator into new iterators or iterables to be flattened into the result.
     */
    flatMap<U>(callback: (value: T, index: number) => Iterator<U, unknown, undefined> | Iterable<U, unknown, undefined>): CoreJSIteratorObject<U, undefined, unknown>;  // ts < 5.6 Iterable<T>

    /**
     * Calls the specified callback function for all the elements in this iterator. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to three arguments. The reduce method calls the callbackfn function one time for each element in the iterator.
     */
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number) => T): T;
    /**
     * Calls the specified callback function for all the elements in this iterator. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to three arguments. The reduce method calls the callbackfn function one time for each element in the iterator.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of a value from the iterator.
     */
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number) => T, initialValue: T): T;
    /**
     * Calls the specified callback function for all the elements in this iterator. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to three arguments. The reduce method calls the callbackfn function one time for each element in the iterator.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of a value from the iterator.
     */
    reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U): U;

    /**
     * Creates a new array from the values yielded by this iterator.
     */
    toArray(): T[];

    /**
     * Performs the specified action for each element in the iterator.
     * @param callbackfn A function that accepts up to two arguments. forEach calls the callbackfn function one time for each element in the iterator.
     */
    forEach(callbackfn: (value: T, index: number) => void): void;

    /**
     * Determines whether the specified callback function returns true for any element of this iterator.
     * @param predicate A function that accepts up to two arguments. The `some` method calls
     * the predicate function for each element in this iterator until the predicate returns a value
     * true, or until the end of the iterator.
     */
    some(predicate: (value: T, index: number) => unknown): boolean;

    /**
     * Determines whether all the members of this iterator satisfy the specified test.
     * @param predicate A function that accepts up to two arguments. The every method calls
     * the predicate function for each element in this iterator until the predicate returns
     * false, or until the end of this iterator.
     */
    every(predicate: (value: T, index: number) => unknown): boolean;

    /**
     * Returns the value of the first element in this iterator where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of this iterator, in
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     */
    find<S extends T>(predicate: (value: T, index: number) => value is S): S | undefined;
    find(predicate: (value: T, index: number) => unknown): T | undefined;

    join(separator?: unknown): string;
  }

  export interface CoreJSIteratorConstructor {
    /**
     * Creates a native iterator from an iterator or iterable object.
     * Returns its input if the input already inherits from the built-in Iterator class.
     * @param value An iterator or iterable object to convert a native iterator.
     */
    from<T>(value: Iterator<T, unknown, undefined> | Iterable<T>): CoreJSIteratorObject<T>;

    /**
     * Takes an iterable of iterables and produces an iterable of arrays where position corresponds
     * to position in the passed iterable.
     * @param iterables An Iterable of iterables.
     * @param options Optional object:
     *  - mode: 'shortest' (default) to stop at the shortest iterable | 'longest' to stop at the longest iterable | 'strict' to throw if iterables are not the same length;
     *  - padding: an object specifying padding values for each key when mode is 'longest'.
     * @returns An iterator yielding objects with keys from the input iterables and values from the corresponding iterables.
     */
    zip<T>(iterables: Iterable<Iterable<T>>, options?: ZipOptions): CoreJSIteratorObject<T[]>;

    /**
     * takes an object whose values are iterables and produces an iterable of objects where keys.
     * correspond to keys in the passed object.
     * @param record An object of iterables.
     * @param options Optional object:
     *  - mode: 'shortest' (default) to stop at the shortest iterable | 'longest' to stop at the longest iterable | 'strict' to throw if iterables are not the same length;
     *  - padding: an object specifying padding values for each key when mode is 'longest'.
     * @returns An iterator yielding objects with keys from the input record and values from the corresponding iterables.
     */
    zipKeyed<T extends { [K in PropertyKey]: Iterable<any> }>(record: T, options?: ZipOptions): CoreJSIteratorObject<{ [K in keyof T]: T[K] extends Iterable<infer V> ? V : never; }>;

    /**
     * Returns an iterator that generates a sequence of numbers or bigints within a range.
     * @param start The starting value of the sequence.
     * @param end The end value of the sequence (exclusive by default).
     * @param options Optional object:
     *   - step: The difference between consecutive values (default is 1).
     *   - inclusive: If true, the end value is included in the range (default is false).
     * @returns An iterator of numbers or bigints.
     */
    range<T>(start: T, end: T | typeof Infinity | typeof Number.NEGATIVE_INFINITY, options?: T | IteratorRangeOptions<T>): CoreJSIteratorObject<T>

    /**
     * Creates an iterator that sequentially yields values from the provided iterables.
     * @param iterators The iterables to concatenate.
     * @returns An iterator yielding values from each input iterable in sequence.
     */
    concat<T, U>(...iterators: Iterable<U>[]): CoreJSIteratorObject<T | U>;
  }

  var CoreJSIterator: CoreJSIteratorConstructor;
}
