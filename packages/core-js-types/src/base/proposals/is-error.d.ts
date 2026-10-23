// https://github.com/tc39/proposal-is-error

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.es2026.error.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

interface ErrorConstructor { // @type-options: no-redefine
  /**
   * Indicates whether the argument provided is a built-in Error instance or not.
   */
  isError(error: unknown): error is Error;
}
