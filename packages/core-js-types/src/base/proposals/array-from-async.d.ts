// https://github.com/tc39/proposal-array-from-async

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/069de743dbd17b47cc2fc58e1d16da5410911284/src/lib/esnext.array.d.ts#L6
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface ArrayConstructor {
  /**
   * Creates an array from an async iterator or iterable object.
   * @param iterableOrArrayLike An async iterator or array-like object to convert to an array.
   */
  fromAsync<T>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>): Promise<T[]>;

  /**
   * Creates an array from an async iterator or iterable object.
   *
   * @param iterableOrArrayLike An async iterator or array-like object to convert to an array.
   * @param mapFn A mapping function to call on every element of iterableOrArrayLike.
   *      Each return value is awaited before being added to result array.
   * @param thisArg Value of 'this' used when executing mapFn.
   */
  fromAsync<T, U>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T> | ArrayLike<T>, mapFn: (value: Awaited<T>, index: number) => U, thisArg?: any): Promise<Awaited<U>[]>;
}
