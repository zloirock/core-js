/// <reference types="../core-js-types/iterator-zip" />

// https://github.com/tc39/proposal-joint-iteration

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.esnext.iterator.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

interface IteratorConstructor {
  /**
   * Creates an iterator whose values are arrays containing values yielded at the same position by each input iterator or iterable.
   * @param iterables - An iterable of iterators or iterables to zip.
   * @param options - Controls how differing input lengths are handled.
   */
  zip(iterables: readonly [], options?: CoreJS.CoreJSIteratorZipOptions<Iterable<unknown> & object>): IteratorObject<never, undefined, unknown>;

  /**
   * Creates an iterator whose values are arrays containing values yielded at the same position by each input iterator or iterable.
   * @param iterables - An iterable of iterators or iterables to zip.
   * @param options - Controls how differing input lengths are handled.
   */
  zip<T extends readonly CoreJS.CoreJSIteratorInput<unknown>[] | []>(iterables: T, options?: CoreJS.CoreJSIteratorZipShortestOptions | CoreJS.CoreJSIteratorZipStrictOptions): IteratorObject<CoreJS.CoreJSIteratorZipResult<T>, undefined, unknown>;
  zip<T extends readonly CoreJS.CoreJSIteratorInput<unknown>[] | [], TPadding extends readonly unknown[] | []>(iterables: T, options: CoreJS.CoreJSIteratorZipLongestOptions<TPadding> & { padding: TPadding; }): IteratorObject<CoreJS.CoreJSIteratorZipResult<T, undefined, TPadding>, undefined, unknown>;
  zip<T extends readonly CoreJS.CoreJSIteratorInput<unknown>[] | [], TPadding extends readonly unknown[] | [] = CoreJS.CoreJSIteratorZipDefaultPadding<T>>(iterables: T, options?: CoreJS.CoreJSIteratorZipOptions<TPadding>): IteratorObject<CoreJS.CoreJSIteratorZipResult<T, undefined, Partial<TPadding>>, undefined, unknown>;

  /**
   * Creates an iterator whose values are arrays containing values yielded at the same position by each input iterator or iterable.
   * @param iterables - An iterable of iterators or iterables to zip.
   * @param options - Controls how differing input lengths are handled.
   */
  zip<T extends CoreJS.CoreJSIteratorInput<unknown>>(iterables: Iterable<T> & object, options?: CoreJS.CoreJSIteratorZipShortestOptions | CoreJS.CoreJSIteratorZipStrictOptions): IteratorObject<CoreJS.CoreJSIteratorYield<T>[], undefined, unknown>;
  zip<T extends CoreJS.CoreJSIteratorInput<unknown>, TPadding = CoreJS.CoreJSIteratorYield<T>>(iterables: Iterable<T> & object, options?: CoreJS.CoreJSIteratorZipOptions<Iterable<TPadding> & object>): IteratorObject<(CoreJS.CoreJSIteratorYield<T> | TPadding | undefined)[], undefined, unknown>;

  /**
   * Creates an iterator whose values are objects containing values yielded at the same position by each iterator or iterable in the input object.
   * @param iterables - An object whose enumerable own properties contain iterators or iterables to zip. Undefined values are ignored.
   * @param options - Controls how differing input lengths are handled.
   */
  zipKeyed<T extends object>(iterables: T & CoreJS.CoreJSIteratorZipKeyedInput<T>, options?: CoreJS.CoreJSIteratorZipShortestOptions | CoreJS.CoreJSIteratorZipStrictOptions): IteratorObject<CoreJS.CoreJSIteratorZipKeyedResult<T>, undefined, unknown>;
  zipKeyed<T extends object, TPadding>(iterables: T & CoreJS.CoreJSIteratorZipKeyedInput<T>, options: CoreJS.CoreJSIteratorZipLongestOptions<TPadding> & { padding: TPadding; }): IteratorObject<CoreJS.CoreJSIteratorZipKeyedResult<T, undefined, TPadding>, undefined, unknown>;
  zipKeyed<T extends object, TPadding = CoreJS.CoreJSIteratorZipDefaultPadding<T>>(iterables: T & CoreJS.CoreJSIteratorZipKeyedInput<T>, options?: CoreJS.CoreJSIteratorZipOptions<TPadding>): IteratorObject<CoreJS.CoreJSIteratorZipKeyedResult<T, undefined, Partial<TPadding>>, undefined, unknown>;

  /**
   * Accepts objects whose types include inherited or non-enumerable properties.
   * Property ownership and enumerability are not represented in object types, so the result values are unknown.
   * Iterator records use the preceding overloads to preserve their inferred result types.
   */
  zipKeyed<T extends object>(iterables: T & ([T] extends [CoreJS.CoreJSIteratorZipKeyedInput<T>] ? never : unknown), options?: CoreJS.CoreJSIteratorZipOptions<object>): IteratorObject<Record<PropertyKey, unknown>, undefined, unknown>;
}

declare var Iterator: IteratorConstructor;
