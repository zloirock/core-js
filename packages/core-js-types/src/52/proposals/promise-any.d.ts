// proposal stage: 4
// https://github.com/tc39/proposal-promise-any

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/af3a3779de6bc27619c85077e1b4d1de8feddd35/src/lib/es2021.promise.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface PromiseConstructor {
  any<T extends readonly unknown[] | []>(values: T): Promise<Awaited<T[number]>>;

  any<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>>;
}

interface AggregateError extends Error {
  errors: any[];
}

interface AggregateErrorConstructor {
  new (errors: Iterable<any>, message?: string): AggregateError;
  (errors: Iterable<any>, message?: string): AggregateError;
  readonly prototype: AggregateError;
}

declare var AggregateError: AggregateErrorConstructor;
