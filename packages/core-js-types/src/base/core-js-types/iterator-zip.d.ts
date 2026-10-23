// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.esnext.iterator.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

declare namespace CoreJS {
  export interface CoreJSIteratorZipShortestOptions {
    /**
     * Stops when any input is exhausted.
     */
    mode?: 'shortest' | undefined;
  }

  export interface CoreJSIteratorZipLongestOptions<T> {
    /**
     * Continues until every input is exhausted.
     */
    mode: 'longest';

    /**
     * Values used when an input is exhausted before the others.
     */
    padding?: (T & object) | undefined;
  }

  export interface CoreJSIteratorZipStrictOptions {
    /**
     * Requires every input to yield the same number of values.
     * If not, a `TypeError` will be thrown when an input is exhausted before others.
     */
    mode: 'strict';
  }

  export type CoreJSIteratorZipOptions<T> =
    | CoreJSIteratorZipShortestOptions
    | CoreJSIteratorZipLongestOptions<T>
    | CoreJSIteratorZipStrictOptions;

  export type CoreJSIteratorInput<T> = (Iterable<T> | Iterator<T>) & object;

  export type CoreJSIteratorYield<T> = T extends CoreJSIteratorInput<infer U> ? U : never;

  export type CoreJSIteratorZipKey<K extends PropertyKey> = K extends number ? K | `${ K }` | (number extends K ? 'NaN' | 'Infinity' | '-Infinity' : never)
    : K extends `${ infer N extends number }` ? `${ N }` extends K ? K | N : K : K;

  export type CoreJSIteratorZipDefaultPadding<T> = {
    readonly [K in keyof T]?: CoreJSIteratorYield<T[K]> | undefined;
  };

  export type CoreJSIteratorZipPaddingKeys<T> = keyof {
    [K in keyof T as {} extends Pick<T, K> ? never : CoreJSIteratorZipKey<K>]: unknown;
  };

  export type CoreJSIteratorZipValue<T, K extends PropertyKey, TExtra, TPadding> =
    | CoreJSIteratorYield<T>
    | (TPadding extends unknown ? TPadding[CoreJSIteratorZipKey<K> & keyof TPadding] | (K extends 'NaN' | 'Infinity' | '-Infinity' ? TPadding[number & keyof TPadding] : never) : never)
    | (CoreJSIteratorZipKey<K> extends CoreJSIteratorZipPaddingKeys<TPadding> ? never : TExtra);

  export type CoreJSIteratorZipResult<T, TExtra = never, TPadding = {}> = {
    -readonly [K in keyof T]: CoreJSIteratorZipValue<T[K], K, TExtra, TPadding>;
  };

  export type CoreJSIteratorZipKeyedInput<T> = {
    [K in T extends unknown ? keyof T : never]?: CoreJSIteratorInput<unknown> | undefined;
  };

  export type CoreJSIteratorZipKeyedResult<T, TExtra = never, TPadding = {}> = T extends Partial<Record<keyof T, undefined>> ? keyof T extends never ? Record<PropertyKey, unknown> : never
    : { -readonly [K in keyof T as undefined extends T[K] ? never : K]: CoreJSIteratorZipValue<T[K], K, TExtra, TPadding>; } &
    { -readonly [K in keyof T as undefined extends T[K] ? T[K] extends undefined ? never : K : never]?: CoreJSIteratorZipValue<T[K], K, TExtra, TPadding>; };
}
