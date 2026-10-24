/// <reference types="../core-js-types/string-base" />
/// <reference types="../core-js-types/iterator-object" />

// Motivation: We should use String without the matchAll method to avoid signature conflicts

// https://github.com/tc39/proposal-string-matchall

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.es2020.string.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

declare namespace CoreJS {
  interface CoreJSRegExpStringIterator<T> extends CoreJSIteratorObject<T> {
    [Symbol.iterator](): CoreJSRegExpStringIterator<T>;
  }

  export interface CoreJSString extends StringBase {

    /**
     * Matches a string with a regular expression, and returns an iterable of matches
     * containing the results of that search.
     * @param regexp - A regular expression
     */
    matchAll(regexp: RegExp): CoreJSRegExpStringIterator<RegExpExecArray>;
  }

  export interface CoreJSStringConstructor extends StringConstructor {
    new(value?: any): CoreJSString;
  }

  var CoreJSString: CoreJSStringConstructor;
}
