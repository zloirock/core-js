// proposal stage: 4
// https://github.com/tc39/proposal-error-cause

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/d3be7e171bf3149fe93c3ce5a85280f1eba3ef8d/src/lib/es2022.error.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface ErrorOptions { // @type-options no-extends no-prefix no-redefine
  cause?: unknown;
}

interface Error {
  cause?: unknown; // ts <= 4.7 Error | undefined
}

interface ErrorConstructor { // @type-options no-redefine
  new(message?: string, options?: ErrorOptions): Error;

  (message?: string, options?: ErrorOptions): Error;
}

interface EvalErrorConstructor { // @type-options no-export
  new(message?: string, options?: ErrorOptions): EvalError;

  (message?: string, options?: ErrorOptions): EvalError;
}

interface RangeErrorConstructor { // @type-options no-export
  new(message?: string, options?: ErrorOptions): RangeError;

  (message?: string, options?: ErrorOptions): RangeError;
}

interface ReferenceErrorConstructor { // @type-options no-export
  new(message?: string, options?: ErrorOptions): ReferenceError;

  (message?: string, options?: ErrorOptions): ReferenceError;
}

interface SyntaxErrorConstructor { // @type-options no-export
  new(message?: string, options?: ErrorOptions): SyntaxError;

  (message?: string, options?: ErrorOptions): SyntaxError;
}

interface TypeErrorConstructor { // @type-options no-export
  new(message?: string, options?: ErrorOptions): TypeError;

  (message?: string, options?: ErrorOptions): TypeError;
}

interface URIErrorConstructor { // @type-options no-export
  new(message?: string, options?: ErrorOptions): URIError;

  (message?: string, options?: ErrorOptions): URIError;
}

interface AggregateError extends Error { // @type-options no-redefine
  errors: any[];

  cause?: unknown;
}

interface AggregateErrorConstructor extends ErrorConstructor {
  new (errors: Iterable<any>, message?: string): AggregateError;
  (errors: Iterable<any>, message?: string): AggregateError;
  readonly prototype: AggregateError;
}

declare var AggregateError: AggregateErrorConstructor;
