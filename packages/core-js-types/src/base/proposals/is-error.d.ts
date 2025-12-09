// proposal stage: 3
// https://github.com/tc39/proposal-is-error

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/4a957b74ea4d716356181644d23f6ad5f10824d6/src/lib/esnext.error.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface ErrorConstructor { // @type-options no-redefine
  /**
   * Indicates whether the argument provided is a built-in Error instance or not.
   */
  isError(value: any): value is Error;
}
