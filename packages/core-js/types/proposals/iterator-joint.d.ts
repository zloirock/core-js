// proposal stage: 2.7
// https://github.com/tc39/proposal-joint-iteration
type CoreJsIteratorObject<T> = typeof globalThis extends { IteratorObject: infer O }
  ? O
  : Iterator<T>;

type ZipOptions = {
  mode?: "shortest" | "longest" | "strict";
  padding?: object;
};

interface Iterator<T> {
  zip<U>(iterables: Iterable<U>, options?: ZipOptions): CoreJsIteratorObject<[T, U]>;

  zipKeyed<U>(iterables: Iterable<U>, options?: ZipOptions): CoreJsIteratorObject<[number, T, U]>;
  zipKeyed<U>(record: Record<PropertyKey, Iterable<U>>, options?: ZipOptions): CoreJsIteratorObject<[PropertyKey, T, U]>;
}
