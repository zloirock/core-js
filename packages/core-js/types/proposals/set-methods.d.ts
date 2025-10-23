// proposal stage: 4
// https://github.com/tc39/proposal-set-methods

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/f450c1b80ce6dc7b04e81899db00534018932234/src/lib/esnext.collection.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface ReadonlySetLike<T> {
  keys(): Iterator<T>;

  has(value: T): boolean;

  readonly size: number;
}

interface Set<T> {
  union<U>(other: ReadonlySetLike<U>): Set<T | U>;

  intersection<U>(other: ReadonlySetLike<U>): Set<T & U>;

  difference<U>(other: ReadonlySetLike<U>): Set<T>;

  symmetricDifference<U>(other: ReadonlySetLike<U>): Set<T | U>;

  isSubsetOf(other: ReadonlySetLike<unknown>): boolean;

  isSupersetOf(other: ReadonlySetLike<unknown>): boolean;

  isDisjointFrom(other: ReadonlySetLike<unknown>): boolean;
}

interface ReadonlySet<T> {
  union<U>(other: ReadonlySetLike<U>): Set<T | U>;

  intersection<U>(other: ReadonlySetLike<U>): Set<T & U>;

  difference<U>(other: ReadonlySetLike<U>): Set<T>;

  symmetricDifference<U>(other: ReadonlySetLike<U>): Set<T | U>;

  isSubsetOf(other: ReadonlySetLike<unknown>): boolean;

  isSupersetOf(other: ReadonlySetLike<unknown>): boolean;

  isDisjointFrom(other: ReadonlySetLike<unknown>): boolean;
}
