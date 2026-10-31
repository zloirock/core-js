// https://github.com/tc39/proposal-regex-escaping

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/3e9236361fa97a9e6c685f4833ac457ae2d8c50a/tsc/internal/bundled/libs/lib.es2025.regexp.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v7.1-beta/LICENSE.txt

interface RegExpConstructor {
  /**
   * Escapes any RegExp syntax characters in the input string, returning a
   * new string that can be safely interpolated into a RegExp as a literal
   * string to match.
   * @param string - The string to escape.
   * @example
   * ```ts
   * const regExp = new RegExp(RegExp.escape("foo.bar"));
   * regExp.test("foo.bar"); // true
   * regExp.test("foo!bar"); // false
   * ```
   */
  escape(string: string): string;
}

declare var RegExp: RegExpConstructor;
