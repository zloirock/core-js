/// <reference types="../../core-js-types/promise-settled-result" />
/// <reference types="../core-js-types/promise" />

// Motivation: Using our own Promise type in return

// https://github.com/tc39/proposal-await-dictionary

declare namespace CoreJS {
  export interface CoreJSPromiseConstructor extends PromiseConstructor {
    /**
     * Takes an object of promises and returns a single Promise that resolves to an object
     * with the same keys and fulfilled values, or rejects as soon as any of the input promises rejects.
     * @param promises - An object of promises
     * @returns A new `Promise` that resolves to an object of fulfilled values or rejects if any promise rejects.
     */
    allKeyed<D extends Record<PropertyKey, Promise<any>>>(promises: D): CoreJS.CoreJSPromise<{ [k in keyof D]: Awaited<D[k]> }>;

    /**
     * Takes an object whose values are promises and returns a single `Promise` that resolves
     * to an object with the same keys, after all of the input promises have settled.
     * @param promises - An object of promises
     * @returns A new Promise that resolves to an object with the same keys as the input object,
     * where each key maps to the settlement result (`{ status, value }` or `{ status, reason }`) of the corresponding promise.
     */
    allSettledKeyed<D extends Record<PropertyKey, Promise<any>>>(promises: D): CoreJS.CoreJSPromise<{ [k in keyof D]: CoreJS.CoreJSPromiseSettledResult<Awaited<D[k]>> }>;
  }

  var CoreJSPromise: CoreJSPromiseConstructor;
}
