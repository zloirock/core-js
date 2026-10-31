/// <reference types="../core-js-types/string-base" />

// Motivation: We should use String without the matchAll method to avoid signature conflicts

// https://github.com/tc39/proposal-string-pad-start-end

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.es2017.string.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

declare namespace CoreJS {
  export interface CoreJSString extends StringBase {

    /**
     * Pads the current string with a given string (repeated and/or truncated, if needed) so that the resulting string has a given length.
     * The padding is applied from the start of the current string.
     *
     * [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart)
     *
     * @param targetLength - The length of the resulting string once the current `str` has been padded.
     *        If the value is less than or equal to `str.length`, then `str` is returned as-is.
     *
     * @param padString - The string to pad the current `str` with.
     *        If `padString` is too long to stay within `targetLength`, it will be truncated from the end.
     *        The default value is the space character (U+0020).
     */
    padStart(targetLength: number, padString?: string): string;

    /**
     * Pads the current string with a given string (repeated and/or truncated, if needed) so that the resulting string has a given length.
     * The padding is applied from the end of the current string.
     *
     * [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd)
     *
     * @param targetLength - The length of the resulting string once the current `str` has been padded.
     *        If the value is less than or equal to `str.length`, then `str` is returned as-is.
     *
     * @param padString - The string to pad the current `str` with.
     *        If `padString` is too long to stay within `targetLength`, it will be truncated from the end.
     *        The default value is the space character (U+0020).
     */
    padEnd(targetLength: number, padString?: string): string;
  }
}
