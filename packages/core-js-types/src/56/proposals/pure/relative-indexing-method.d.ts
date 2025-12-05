/// <reference types="../../core-js-types/string-base.d.ts" />

// Motivation: We should use String without the matchAll method to avoid signature conflicts

// proposal stage: 4
// https://github.com/tc39/proposal-relative-indexing-method

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/f450c1b80ce6dc7b04e81899db00534018932234/src/lib/es2022.array.d.ts
// https://github.com/microsoft/TypeScript/blob/f450c1b80ce6dc7b04e81899db00534018932234/src/lib/es2022.string.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare namespace CoreJS {
  interface CoreJSString extends StringBase {
    /**
     * Returns a new String consisting of the single UTF-16 code unit located at the specified index.
     * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
     */
    at(index: number): string | undefined;
  }

  interface CoreJSArray<T> extends Array<T> {
    /**
     * Returns the item located at the specified index.
     * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
     */
    at(index: number): T | undefined;
  }
}
