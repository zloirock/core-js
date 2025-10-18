// proposal stage: 4
// https://github.com/tc39/proposal-error-cause

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/d3be7e171bf3149fe93c3ce5a85280f1eba3ef8d/src/lib/es2022.error.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

import { CoreJsAggregateError, CoreJsErrorOptions } from './core-js-types/core-js-types.js';

declare global {
  interface Error {
    cause?: unknown; // ts <= 4.7 Error | undefined
  }

  interface ErrorConstructor {
    new(message?: string, options?: CoreJsErrorOptions): Error;

    (message?: string, options?: CoreJsErrorOptions): Error;
  }

  interface EvalErrorConstructor {
    new(message?: string, options?: CoreJsErrorOptions): EvalError;

    (message?: string, options?: CoreJsErrorOptions): EvalError;
  }

  interface RangeErrorConstructor {
    new(message?: string, options?: CoreJsErrorOptions): RangeError;

    (message?: string, options?: CoreJsErrorOptions): RangeError;
  }

  interface ReferenceErrorConstructor {
    new(message?: string, options?: CoreJsErrorOptions): ReferenceError;

    (message?: string, options?: CoreJsErrorOptions): ReferenceError;
  }

  interface SyntaxErrorConstructor {
    new(message?: string, options?: CoreJsErrorOptions): SyntaxError;

    (message?: string, options?: CoreJsErrorOptions): SyntaxError;
  }

  interface TypeErrorConstructor {
    new(message?: string, options?: CoreJsErrorOptions): TypeError;

    (message?: string, options?: CoreJsErrorOptions): TypeError;
  }

  interface URIErrorConstructor {
    new(message?: string, options?: CoreJsErrorOptions): URIError;

    (message?: string, options?: CoreJsErrorOptions): URIError;
  }

  interface AggregateErrorConstructor {
    new(errors: Iterable<any>, message?: string, options?: CoreJsErrorOptions): CoreJsAggregateError;

    (errors: Iterable<any>, message?: string, options?: CoreJsErrorOptions): CoreJsAggregateError;
  }
}

export {};
