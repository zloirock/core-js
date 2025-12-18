// https://github.com/tc39/proposal-string-dedent

interface StringConstructor {
  /**
   * Template tag that removes common leading whitespace from every line in the resulting string,
   * preserving relative indentation and blank lines.
   * @param strings The template strings array.
   * @param values Values to be interpolated into the template string.
   * @returns The dedented string.
   */
  dedent(strings: TemplateStringsArray, ...values: any[]): string;
}
