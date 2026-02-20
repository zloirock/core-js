/// <reference types="./promise-like" />

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/347254895823a36a1b1b1c80471422da54ad77de/src/lib/es2021.promise.d.ts#L16
// https://github.com/microsoft/TypeScript/blob/347254895823a36a1b1b1c80471422da54ad77de/src/lib/es2025.promise.d.ts#L4
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare namespace CoreJS {
  interface CoreJSPromiseWithResolvers<T> {
    promise: CoreJSPromise<T>;
    resolve: (value: T | CoreJS.CoreJSPromiseLike<T>) => void;
    reject: (reason?: any) => void;
  }

  export interface CoreJSPromise<T> extends Promise<T> {}

  export interface CoreJSPromiseConstructor {
    readonly prototype: CoreJSPromise<any>;

    /**
     * Creates a new Promise.
     * @param executor - A callback used to initialize the promise. This callback is passed two arguments:
     * a resolve callback used to resolve the promise with a value or the result of another promise,
     * and a reject callback used to reject the promise with a provided reason or error.
     */
    new<T>(executor: (resolve: (value: T | CoreJS.CoreJSPromiseLike<T>) => void, reject: (reason?: any) => void) => void): CoreJSPromise<T>;

    /**
     * Creates a Promise that is resolved with an array of results when all of the provided Promises
     * resolve, or rejected when any Promise is rejected.
     * @param values - An array of Promises.
     * @returns A new Promise.
     */
    all<T extends readonly unknown[] | []>(values: T): CoreJSPromise<{ -readonly [P in keyof T]: Awaited<T[P]>; }>;

    /**
     * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved
     * or rejected.
     * @param values - An array of Promises.
     * @returns A new Promise.
     */
    race<T extends readonly unknown[] | []>(values: T): CoreJSPromise<Awaited<T[number]>>;

    /**
     * Creates a new rejected promise for the provided reason.
     * @param reason - The reason the promise was rejected.
     * @returns A new rejected Promise.
     */
    reject<T = never>(reason?: any): CoreJSPromise<T>;

    /**
     * Creates a new resolved promise.
     * @returns A resolved promise.
     */
    resolve(): CoreJSPromise<void>;
    /**
     * Creates a new resolved promise for the provided value.
     * @param value - A promise.
     * @returns A promise whose internal state matches the provided promise.
     */
    resolve<T>(value: T | CoreJS.CoreJSPromiseLike<T>): CoreJSPromise<Awaited<T>>;

    // allSettled, any, try

    /**
     * The any function returns a promise that is fulfilled by the first given promise to be fulfilled, or rejected with an AggregateError containing an array of rejection reasons if all of the given promises are rejected. It resolves all elements of the passed iterable to promises as it runs this algorithm.
     * @param values An array or iterable of Promises.
     * @returns A new Promise.
     */
    any<T extends readonly unknown[] | []>(values: T): CoreJSPromise<Awaited<T[number]>>;
    /**
     * The any function returns a promise that is fulfilled by the first given promise to be fulfilled, or rejected with an AggregateError containing an array of rejection reasons if all of the given promises are rejected. It resolves all elements of the passed iterable to promises as it runs this algorithm.
     * @param values An array or iterable of Promises.
     * @returns A new Promise.
     */
    any<T>(values: Iterable<T | CoreJS.CoreJSPromiseLike<T>>): CoreJSPromise<Awaited<T>>;

    /**
     * Takes a callback of any kind (returns or throws, synchronously or asynchronously) and wraps its result
     * in a Promise.
     *
     * @param callbackFn A function that is called synchronously. It can do anything: either return
     * a value, throw an error, or return a promise.
     * @param args Additional arguments, that will be passed to the callback.
     *
     * @returns A Promise that is:
     * - Already fulfilled, if the callback synchronously returns a value.
     * - Already rejected, if the callback synchronously throws an error.
     * - Asynchronously fulfilled or rejected, if the callback returns a promise.
     */
    try<T, U extends unknown[]>(callbackFn: (...args: U) => T | CoreJS.CoreJSPromiseLike<T>, ...args: U): CoreJSPromise<Awaited<T>>;
  }

  var CoreJSPromise: CoreJSPromiseConstructor;
}
