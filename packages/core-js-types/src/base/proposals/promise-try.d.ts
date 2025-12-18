// https://github.com/tc39/proposal-promise-try

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/af3a3779de6bc27619c85077e1b4d1de8feddd35/src/lib/esnext.promise.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface PromiseConstructor {
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
  try<T, U extends unknown[]>(callbackFn: (...args: U) => T | PromiseLike<T>, ...args: U): Promise<Awaited<T>>;
}

