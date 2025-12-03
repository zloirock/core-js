// proposal stage: 4
// https://github.com/tc39/proposal-error-cause

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/d3be7e171bf3149fe93c3ce5a85280f1eba3ef8d/src/lib/es2022.error.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

// proposal stage: 3
// https://github.com/tc39/proposal-is-error

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/4a957b74ea4d716356181644d23f6ad5f10824d6/src/lib/esnext.error.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare namespace CoreJS {
  export interface ErrorOptions {
    cause?: unknown;
  }

  export interface CoreJSError extends Error {
    cause?: unknown; // ts <= 4.7 Error | undefined
  }

  export interface CoreJSErrorConstructor extends ErrorConstructor {
    new(message?: string, options?: ErrorOptions): CoreJSError;

    (message?: string, options?: ErrorOptions): CoreJSError;

    /**
     * Indicates whether the argument provided is a built-in Error instance or not.
     */
    isError(value: any): value is Error;
  }

  export interface CoreJSAggregateError extends Error {
    errors: any[];
  }

  export interface CoreJSAggregateErrorConstructor extends ErrorConstructor {
    readonly prototype: CoreJSAggregateError;

    new(errors: Iterable<any>, message?: string): CoreJSAggregateError;

    (errors: Iterable<any>, message?: string): CoreJSAggregateError;
  }

  export var CoreJSError: CoreJSErrorConstructor;
  export var CoreJSAggregateError: CoreJSAggregateErrorConstructor;
}
