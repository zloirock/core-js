/// <reference types="../core-js-types/promise-settled-result" />

// https://github.com/tc39/proposal-await-dictionary

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.esnext.promise.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

interface PromiseConstructor {
  /**
   * Creates a Promise that is resolved with an object of results when all of the provided Promises resolve,
   * or rejected when any Promise is rejected.
   * @param promises - An object of Promises.
   * @returns A new Promise.
   */
  allKeyed<T extends object>(promises: T): Promise<{ -readonly [P in keyof T]: Awaited<T[P]>; }>;

  /**
   * Creates a Promise that is resolved with an object of results when all of the provided Promises resolve or reject.
   * @param promises - An object of Promises.
   * @returns A new Promise.
   */
  allSettledKeyed<T extends object>(promises: T): Promise<{ -readonly [P in keyof T]: CoreJS.CoreJSPromiseSettledResult<Awaited<T[P]>>; }>;
}

declare var Promise: PromiseConstructor;
