/// <reference types="../core-js-types/set" />

// Motivation: Custom type needed to keep generics strict & return our CoreJSSet type

// https://github.com/tc39/proposal-set-methods

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.es2025.collection.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

declare namespace CoreJS {
  interface ReadonlySetLike<T> {
    keys(): Iterator<T>;

    has(value: T): boolean;

    readonly size: number;
  }

  export type SetUnion<T, U> = (other: ReadonlySetLike<U>) => CoreJS.CoreJSSet<T | U>;

  export type SetSymmetricDifference<T, U> = (other: ReadonlySetLike<U>) => CoreJS.CoreJSSet<T | U>;
}
