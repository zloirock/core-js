// https://github.com/tc39/proposal-promise-any

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/af3a3779de6bc27619c85077e1b4d1de8feddd35/src/lib/es2021.promise.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface PromiseConstructor {
  /**
   * The any function returns a promise that is fulfilled by the first given promise to be fulfilled, or rejected with an AggregateError containing an array of rejection reasons if all of the given promises are rejected. It resolves all elements of the passed iterable to promises as it runs this algorithm.
   * @param values - An array or iterable of Promises.
   * @returns A new Promise.
   */
  any<T extends readonly unknown[] | []>(values: T): Promise<Awaited<T[number]>>; // @type-options: prefix-return-type

  /**
   * The any function returns a promise that is fulfilled by the first given promise to be fulfilled, or rejected with an AggregateError containing an array of rejection reasons if all of the given promises are rejected. It resolves all elements of the passed iterable to promises as it runs this algorithm.
   * @param values - An array or iterable of Promises.
   * @returns A new Promise.
   */
  any<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>>; // @type-options: prefix-return-type
}

interface AggregateError extends Error { // @type-options: no-redefine
  errors: any[];
}

interface AggregateErrorConstructor { // @type-options: no-extends, no-redefine
  new (errors: Iterable<any>, message?: string): AggregateError;
  (errors: Iterable<any>, message?: string): AggregateError;
  readonly prototype: AggregateError;
}

declare var AggregateError: AggregateErrorConstructor;
