// Motivation: Custom type needed to keep generics strict

// https://github.com/tc39/proposal-set-methods

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/f450c1b80ce6dc7b04e81899db00534018932234/src/lib/esnext.collection.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare namespace CoreJS {
  interface ReadonlySetLike<T> {
    keys(): Iterator<T>;

    has(value: T): boolean;

    readonly size: number;
  }

  export type SetUnion<T, U> = (other: ReadonlySetLike<U>) => Set<T | U>;

  export type SetSymmetricDifference<T, U> = (other: ReadonlySetLike<U>) => Set<T | U>;
}
