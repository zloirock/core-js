export type CoreJsAsyncIteratorObject<T> = typeof globalThis extends { AsyncIteratorObject: infer O }
    ? O
    : AsyncIterator<T>;

export type CoreJsDecoratorMetadataObject = typeof globalThis extends { DecoratorMetadataObject: infer O }
  ? O
  : Record<PropertyKey, unknown> & object;

declare global {
  interface IteratorObject<T, TReturn, TNext> extends Iterator<T, TReturn, TNext> {}
}
export type CoreJsIteratorObject<T, TReturn = any, TNext = undefined> = IteratorObject<T, TReturn, TNext>;

export type CoreJsAggregateError = typeof globalThis extends { AggregateError: infer O }
  ? O
  : { new(errors: Iterable<any>, message?: string): Error & { errors: any[] } };

export type CoreJsErrorOptions = {
  cause?: unknown;
}
