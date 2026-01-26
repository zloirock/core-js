// https://github.com/tc39/proposal-promise-with-resolvers

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/af3a3779de6bc27619c85077e1b4d1de8feddd35/src/lib/es2024.promise.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface PromiseWithResolvers<T> { // @type-options no-extends, no-prefix
  promise: Promise<T>; // @type-options prefix-return-type

  resolve: (value: T | PromiseLike<T>) => void;

  reject: (reason?: any) => void;
}

interface PromiseConstructor {
  /**
   * Creates a new Promise and returns it in an object, along with its resolve and reject functions.
   * @returns An object with the properties `promise`, `resolve`, and `reject`.
   *
   * ```ts
   * const { promise, resolve, reject } = Promise.withResolvers<T>();
   * ```
   */
  withResolvers<T>(): PromiseWithResolvers<T>;
}
