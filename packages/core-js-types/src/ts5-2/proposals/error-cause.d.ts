// proposal stage: 4
// https://github.com/tc39/proposal-error-cause

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/d3be7e171bf3149fe93c3ce5a85280f1eba3ef8d/src/lib/es2022.error.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare global {
  interface ErrorOptions {
    cause?: unknown;
  }

  interface Error {
    cause?: unknown; // ts <= 4.7 Error | undefined
  }

  interface ErrorConstructor {
    new(message?: string, options?: ErrorOptions): Error;

    (message?: string, options?: ErrorOptions): Error;
  }

  interface EvalErrorConstructor {
    new(message?: string, options?: ErrorOptions): EvalError;

    (message?: string, options?: ErrorOptions): EvalError;
  }

  interface RangeErrorConstructor {
    new(message?: string, options?: ErrorOptions): RangeError;

    (message?: string, options?: ErrorOptions): RangeError;
  }

  interface ReferenceErrorConstructor {
    new(message?: string, options?: ErrorOptions): ReferenceError;

    (message?: string, options?: ErrorOptions): ReferenceError;
  }

  interface SyntaxErrorConstructor {
    new(message?: string, options?: ErrorOptions): SyntaxError;

    (message?: string, options?: ErrorOptions): SyntaxError;
  }

  interface TypeErrorConstructor {
    new(message?: string, options?: ErrorOptions): TypeError;

    (message?: string, options?: ErrorOptions): TypeError;
  }

  interface URIErrorConstructor {
    new(message?: string, options?: ErrorOptions): URIError;

    (message?: string, options?: ErrorOptions): URIError;
  }
}

export {};
