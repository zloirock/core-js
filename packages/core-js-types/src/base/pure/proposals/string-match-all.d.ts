/// <reference types="../../core-js-types/string-base.d.ts" />
/// <reference types="../../core-js-types/iterator-object.ts" />

// Motivation: We should use String without the matchAll method to avoid signature conflicts

// proposal stage: 4
// https://github.com/tc39/proposal-string-matchall

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/f450c1b80ce6dc7b04e81899db00534018932234/src/lib/es2020.string.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare namespace CoreJS {
  interface CoreJSRegExpStringIterator<T> extends CoreJSIteratorObject<T> {
    [Symbol.iterator](): CoreJSRegExpStringIterator<T>;
  }

  export interface CoreJSString extends StringBase {

    /**
     * Matches a string with a regular expression, and returns an iterable of matches
     * containing the results of that search.
     * @param regexp A variable name or string literal containing the regular expression pattern and flags.
     */
    matchAll(regexp: RegExp): CoreJSRegExpStringIterator<RegExpExecArray>;
  }

  export interface CoreJSStringConstructor extends StringConstructor {
    new(value?: any): CoreJSString;
  }

  var CoreJSString: CoreJSStringConstructor;
}
