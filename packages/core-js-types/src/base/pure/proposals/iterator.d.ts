/// <reference types="./explicit-resource-management" />
/// <reference types="../core-js-types/async-iterator" />
/// <reference types="../core-js-types/iterator-object" />
/// <reference types="../core-js-types/iterator-zip" />
/// <reference types="../core-js-types/promise" />

// Motivation: Has dependencies on internal types

// https://github.com/tc39/proposal-iterator-chunking

// https://github.com/tc39/proposal-iterator-helpers

// https://github.com/tc39/proposal-iterator-includes

// https://github.com/tc39/proposal-iterator-join

// https://github.com/tc39/proposal-joint-iteration

// https://github.com/tc39/proposal-iterator.range

// https://github.com/tc39/proposal-iterator-sequencing

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.es2025.iterator.d.ts
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.es2026.iterator.d.ts
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.esnext.iterator.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

declare namespace CoreJS {
  interface IteratorRangeOptions<T> {
    step?: T;

    inclusive?: boolean;
  }

  export interface CoreJSAsyncIteratorObject<T, TReturn = undefined, TNext = undefined> extends CoreJS.CoreJSAsyncIterator<T, TReturn, TNext> {}
  export interface CoreJSAsyncIteratorObject<T, TReturn = undefined, TNext = undefined> extends CoreJSAsyncDisposable {}
  export interface CoreJSAsyncIterable<T, TReturn = any, TNext = any> {
    [CoreJSSymbol.asyncIterator](): CoreJS.CoreJSAsyncIterator<T, TReturn, TNext>;
  }

  export interface CoreJSIteratorObject<T, TReturn = undefined, TNext = undefined> extends CoreJSDisposable {}

  export interface CoreJSIterator<T, TReturn = any, TNext = any> extends Iterator<T, TReturn, TNext> {
    /**
     * Creates an iterator whose values are arrays containing successive values from this iterator.
     * @param chunkSize - The maximum number of values in each array.
     */
    chunks(chunkSize: number): CoreJSIteratorObject<T[], undefined, unknown>;

    /**
     * Yields overlapping arrays (windows) of the given size from the iterator.
     * @param windowSize - The size of each window. Must be a positive integer.
     * @param undersized - 'only-full' (default) to yield only full windows | 'allow-partial' to yield all windows.
     * @returns An iterator yielding arrays of the specified window size.
     */
    windows(windowSize: number, undersized?: 'only-full' | 'allow-partial' | undefined): CoreJSIteratorObject<T[], undefined, unknown>;

    /**
     * Creates an iterator whose values are the result of applying the callback to the values from this iterator.
     * @param callbackfn - A function that accepts up to two arguments to be used to transform values from the underlying iterator.
     */
    map<U>(callbackfn: (value: T, index: number) => U): CoreJSIteratorObject<U, undefined, unknown>;

    /**
     * Creates an iterator whose values are those from this iterator for which the provided predicate returns true.
     * @param predicate - A function that accepts up to two arguments to be used to test values from the underlying iterator.
     */
    filter<S extends T>(predicate: (value: T, index: number) => value is S): CoreJSIteratorObject<S, undefined, unknown>;
    /**
     * Creates an iterator whose values are those from this iterator for which the provided predicate returns true.
     * @param predicate - A function that accepts up to two arguments to be used to test values from the underlying iterator.
     */
    filter(predicate: (value: T, index: number) => unknown): CoreJSIteratorObject<T, undefined, unknown>;

    /**
     * Creates an iterator whose values are the values from this iterator, stopping once the provided limit is reached.
     * @param limit - The maximum number of values to yield.
     */
    take(limit: number): CoreJSIteratorObject<T, undefined, unknown>;

    /**
     * Creates an iterator whose values are the values from this iterator after skipping the provided count.
     * @param count - The number of values to drop.
     */
    drop(count: number): CoreJSIteratorObject<T, undefined, unknown>;

    /**
     * Creates an iterator whose values are the result of applying the callback to the values from this iterator and then flattening the resulting iterators or iterables.
     * @param callback - A function that accepts up to two arguments to be used to transform values from the underlying iterator into new iterators or iterables to be flattened into the result.
     */
    flatMap<U>(callback: (value: T, index: number) => Iterator<U, unknown, undefined> | Iterable<U, unknown, undefined>): CoreJSIteratorObject<U, undefined, unknown>;

    /**
     * Calls the specified callback function for all the elements in this iterator. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn - A function that accepts up to three arguments. The reduce method calls the callbackfn function one time for each element in the iterator.
     */
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number) => T): T;
    /**
     * Calls the specified callback function for all the elements in this iterator. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn - A function that accepts up to three arguments. The reduce method calls the callbackfn function one time for each element in the iterator.
     * @param initialValue - If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of a value from the iterator.
     */
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number) => T, initialValue: T): T;
    /**
     * Calls the specified callback function for all the elements in this iterator. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn - A function that accepts up to three arguments. The reduce method calls the callbackfn function one time for each element in the iterator.
     * @param initialValue - If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of a value from the iterator.
     */
    reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U): U;

    /**
     * Creates a new array from the values yielded by this iterator.
     */
    toArray(): T[];

    /**
     * Performs the specified action for each element in the iterator.
     * @param callbackfn - A function that accepts up to two arguments. forEach calls the callbackfn function one time for each element in the iterator.
     */
    forEach(callbackfn: (value: T, index: number) => void): void;

    /**
     * Determines whether the specified callback function returns true for any element of this iterator.
     * @param predicate - A function that accepts up to two arguments. The `some` method calls
     * the predicate function for each element in this iterator until the predicate returns a value
     * true, or until the end of the iterator.
     */
    some(predicate: (value: T, index: number) => unknown): boolean;

    /**
     * Determines whether all the members of this iterator satisfy the specified test.
     * @param predicate - A function that accepts up to two arguments. The every method calls
     * the predicate function for each element in this iterator until the predicate returns
     * false, or until the end of this iterator.
     */
    every(predicate: (value: T, index: number) => unknown): boolean;

    /**
     * Returns the value of the first element in this iterator where predicate is true, and undefined
     * otherwise.
     * @param predicate - find calls predicate once for each element of this iterator, in
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     */
    find<S extends T>(predicate: (value: T, index: number) => value is S): S | undefined;
    find(predicate: (value: T, index: number) => unknown): T | undefined;

    /**
     * Determines whether this iterator yields the specified value using SameValueZero comparison.
     * @param searchElement - The value to locate.
     * @param skippedElements - The number of values to skip before searching.
     */
    includes(searchElement: T, skippedElements?: number): boolean;

    /**
     * Creates a string by concatenating the values of this iterator, separated by the specified separator.
     * `null` and `undefined` values contribute an empty string.
     * @param separator - A string used to separate values. If omitted, a comma is used.
     */
    join(separator?: string): string;
  }

  export interface CoreJSIteratorConstructor {
    /**
     * Creates a native iterator from an iterator or iterable object.
     * Returns its input if the input already inherits from the built-in Iterator class.
     * @param value - An iterator or iterable object to convert to a native iterator.
     */
    from<T>(value: Iterator<T, unknown, undefined> | Iterable<T, unknown, undefined>): CoreJSIteratorObject<T, undefined, unknown>;

    /**
     * Creates an iterator whose values are arrays containing values yielded at the same position by each input iterator or iterable.
     * @param iterables - An iterable of iterators or iterables to zip.
     * @param options - Controls how differing input lengths are handled.
     */
    zip(iterables: readonly [], options?: CoreJSIteratorZipOptions<Iterable<unknown> & object>): CoreJSIteratorObject<never, undefined, unknown>;

    /**
     * Creates an iterator whose values are arrays containing values yielded at the same position by each input iterator or iterable.
     * @param iterables - An iterable of iterators or iterables to zip.
     * @param options - Controls how differing input lengths are handled.
     */
    zip<T extends readonly CoreJSIteratorInput<unknown>[] | []>(iterables: T, options?: CoreJSIteratorZipShortestOptions | CoreJSIteratorZipStrictOptions): CoreJSIteratorObject<CoreJSIteratorZipResult<T>, undefined, unknown>;
    zip<T extends readonly CoreJSIteratorInput<unknown>[] | [], TPadding extends readonly unknown[] | []>(iterables: T, options: CoreJSIteratorZipLongestOptions<TPadding> & { padding: TPadding; }): CoreJSIteratorObject<CoreJSIteratorZipResult<T, undefined, TPadding>, undefined, unknown>;
    zip<T extends readonly CoreJSIteratorInput<unknown>[] | [], TPadding extends readonly unknown[] | [] = CoreJSIteratorZipDefaultPadding<T>>(iterables: T, options?: CoreJSIteratorZipOptions<TPadding>): CoreJSIteratorObject<CoreJSIteratorZipResult<T, undefined, Partial<TPadding>>, undefined, unknown>;

    /**
     * Creates an iterator whose values are arrays containing values yielded at the same position by each input iterator or iterable.
     * @param iterables - An iterable of iterators or iterables to zip.
     * @param options - Controls how differing input lengths are handled.
     */
    zip<T extends CoreJSIteratorInput<unknown>>(iterables: Iterable<T> & object, options?: CoreJSIteratorZipShortestOptions | CoreJSIteratorZipStrictOptions): CoreJSIteratorObject<CoreJSIteratorYield<T>[], undefined, unknown>;
    zip<T extends CoreJSIteratorInput<unknown>, TPadding = CoreJSIteratorYield<T>>(iterables: Iterable<T> & object, options?: CoreJSIteratorZipOptions<Iterable<TPadding> & object>): CoreJSIteratorObject<(CoreJSIteratorYield<T> | TPadding | undefined)[], undefined, unknown>;

    /**
     * Creates an iterator whose values are objects containing values yielded at the same position by each iterator or iterable in the input object.
     * @param iterables - An object whose enumerable own properties contain iterators or iterables to zip. Undefined values are ignored.
     * @param options - Controls how differing input lengths are handled.
     */
    zipKeyed<T extends object>(iterables: T & CoreJSIteratorZipKeyedInput<T>, options?: CoreJSIteratorZipShortestOptions | CoreJSIteratorZipStrictOptions): CoreJSIteratorObject<CoreJSIteratorZipKeyedResult<T>, undefined, unknown>;
    zipKeyed<T extends object, TPadding>(iterables: T & CoreJSIteratorZipKeyedInput<T>, options: CoreJSIteratorZipLongestOptions<TPadding> & { padding: TPadding; }): CoreJSIteratorObject<CoreJSIteratorZipKeyedResult<T, undefined, TPadding>, undefined, unknown>;
    zipKeyed<T extends object, TPadding = CoreJSIteratorZipDefaultPadding<T>>(iterables: T & CoreJSIteratorZipKeyedInput<T>, options?: CoreJSIteratorZipOptions<TPadding>): CoreJSIteratorObject<CoreJSIteratorZipKeyedResult<T, undefined, Partial<TPadding>>, undefined, unknown>;

    /**
     * Accepts objects whose types include inherited or non-enumerable properties.
     * Property ownership and enumerability are not represented in object types, so the result values are unknown.
     * Iterator records use the preceding overloads to preserve their inferred result types.
     */
    zipKeyed<T extends object>(iterables: T & ([T] extends [CoreJSIteratorZipKeyedInput<T>] ? never : unknown), options?: CoreJSIteratorZipOptions<object>): CoreJSIteratorObject<Record<PropertyKey, unknown>, undefined, unknown>;

    /**
     * Returns an iterator that generates a sequence of numbers within a range.
     * @param start - The starting value of the sequence.
     * @param end - The end value of the sequence (exclusive by default).
     * @param options - Optional object:
     *   - step: The difference between consecutive values (default is 1).
     *   - inclusive: If true, the end value is included in the range (default is false).
     * @returns An iterator of numbers.
     */
    range(start: number, end: number | typeof Infinity | typeof Number.NEGATIVE_INFINITY, options?: number | IteratorRangeOptions<number>): CoreJSIteratorObject<number, undefined, unknown>;

    /**
     * Returns an iterator that generates a sequence of bigints within a range.
     * @param start - The starting value of the sequence.
     * @param end - The end value of the sequence (exclusive by default).
     * @param options - Optional object:
     *   - step: The difference between consecutive values (default is 1n).
     *   - inclusive: If true, the end value is included in the range (default is false).
     * @returns An iterator of bigints.
     */
    range(start: bigint, end: bigint | typeof Infinity | typeof Number.NEGATIVE_INFINITY, options?: bigint | IteratorRangeOptions<bigint>): CoreJSIteratorObject<bigint, undefined, unknown>;

    /**
     * Creates an iterator that yields the values of each iterable in sequence.
     * @param iterables - Iterable objects to concatenate.
     */
    concat<T extends readonly unknown[] | []>(...iterables: { -readonly [K in keyof T]: Iterable<T[K]> & object }): CoreJSIteratorObject<T[number], undefined, unknown>;
  }

  var CoreJSIterator: CoreJSIteratorConstructor;
}
