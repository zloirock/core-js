/// <reference types="../../core-js-types/string-base.d.ts" />

// Motivation: We should use String without the matchAll method to avoid signature conflicts

// https://github.com/tc39/proposal-string-dedent

declare namespace CoreJS {
  export interface CoreJSStringConstructor extends StringConstructor {

    /**
     * Template tag that removes common leading whitespace from every line in the resulting string,
     * preserving relative indentation and blank lines.
     * @param template The template strings array, strings array, or a single string.
     * @param values Values to be interpolated into the template string.
     * @returns The dedented string.
     */
    dedent(template: TemplateStringsArray | ArrayLike<string>, ...values: any[]): string;
    dedent(template: { raw: readonly string[] }, ...values: any[]): string;
    dedent(template: string): string;
  }

  var CoreJSString: CoreJSStringConstructor;

  export interface CoreJSString extends StringBase {
    /**
     * Template tag that removes common leading whitespace from every line in the resulting string,
     * preserving relative indentation and blank lines.
     * @returns The dedented string.
     */
    dedent(): string;
  }
}
