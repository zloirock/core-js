// https://github.com/tc39/proposal-string-matchall

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.es2020.string.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

interface RegExpStringIterator<T> extends IteratorObject<T, BuiltinIteratorReturn, unknown> {
  [Symbol.iterator](): RegExpStringIterator<T>;
}

interface String {
  /**
   * Matches a string with a regular expression, and returns an iterable of matches
   * containing the results of that search.
   * @param regexp - A regular expression
   */
  matchAll(regexp: RegExp): RegExpStringIterator<RegExpExecArray>;
}

interface SymbolConstructor {
  readonly matchAll: unique symbol;
}
