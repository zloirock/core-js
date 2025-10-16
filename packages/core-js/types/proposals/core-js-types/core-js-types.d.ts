export type CoreJsAsyncIteratorObject<T> = typeof globalThis extends { AsyncIteratorObject: infer O }
    ? O
    : AsyncIterator<T>;

export type CoreJsDecoratorMetadataObject = typeof globalThis extends { DecoratorMetadataObject: infer T }
  ? T
  : Record<PropertyKey, unknown> & object;

export type CoreJsIteratorObject<T> = typeof globalThis extends { IteratorObject: infer O }
  ? O
  : Iterator<T>;
