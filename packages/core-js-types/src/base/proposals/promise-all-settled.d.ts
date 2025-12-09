/// <reference types="../core-js-types/promise-settled-result" />

// proposal stage: 4
// https://github.com/tc39/proposal-promise-allSettled

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/2a90a739c1c1e87e3c3d0c93e16f7e5baadf8035/src/lib/es2020.promise.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface PromiseConstructor {
  /**
   * Creates a Promise that is resolved with an array of results when all
   * of the provided Promises resolve or reject.
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  allSettled<T extends readonly unknown[] | []>(values: T): Promise<{ -readonly [P in keyof T]: CoreJS.CoreJSPromiseSettledResult<Awaited<T[P]>>; }>;

  /**
   * Creates a Promise that is resolved with an array of results when all
   * of the provided Promises resolve or reject.
   * @param values An array of Promises.
   * @returns A new Promise.
   */
  allSettled<T>(values: Iterable<T | PromiseLike<T>>): Promise<CoreJS.CoreJSPromiseSettledResult<Awaited<T>>[]>;
}
