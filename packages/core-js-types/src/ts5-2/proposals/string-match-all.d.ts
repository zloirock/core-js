// Motivation: BuiltinIteratorReturn available only from TS 5.6

// https://github.com/tc39/proposal-string-matchall

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/f450c1b80ce6dc7b04e81899db00534018932234/src/lib/es2020.string.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface RegExpStringIterator<T> extends IteratorObject<T, any, unknown> {
  [Symbol.iterator](): RegExpStringIterator<T>;
}

interface String {
  /**
   * Matches a string with a regular expression, and returns an iterable of matches
   * containing the results of that search.
   * @param regexp - A variable name or string literal containing the regular expression pattern and flags.
   */
  matchAll(regexp: RegExp): RegExpStringIterator<RegExpExecArray>;
}

interface SymbolConstructor {
  readonly matchAll: unique symbol;
}
