/// <reference types="../core-js-types/iterator-object" />

// https://github.com/tc39/proposal-iterator-sequencing

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.es2026.iterator.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

interface IteratorConstructor {
  /**
   * Creates an iterator that yields the values of each iterable in sequence.
   * @param iterables - Iterable objects to concatenate.
   */
  concat<T extends readonly unknown[] | []>(...iterables: { -readonly [K in keyof T]: Iterable<T[K]> & object }): IteratorObject<T[number], undefined, unknown>;
}

declare var Iterator: IteratorConstructor;
