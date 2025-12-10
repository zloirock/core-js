/// <reference types="../../core-js-types/string-base.d.ts" />

// Motivation: We should use String without the matchAll method to avoid signature conflicts

// proposal stage: 4
// https://github.com/tc39/proposal-string-left-right-trim

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/f450c1b80ce6dc7b04e81899db00534018932234/src/lib/es2019.string.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare namespace CoreJS {
  export interface CoreJSString extends StringBase {
    /** Removes the trailing white space and line terminator characters from a string. */
    trimEnd(): string;

    /** Removes the leading white space and line terminator characters from a string. */
    trimStart(): string;

    /**
     * Removes the leading white space and line terminator characters from a string.
     */
    trimLeft(): string;

    /**
     * Removes the trailing white space and line terminator characters from a string.
     */
    trimRight(): string;
  }
}
