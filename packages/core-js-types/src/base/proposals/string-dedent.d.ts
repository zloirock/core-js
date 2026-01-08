// https://github.com/tc39/proposal-string-dedent

interface StringConstructor {
  /**
   * Template tag that removes common leading whitespace from every line in the resulting string,
   * preserving relative indentation and blank lines.
   * @param template The template strings array, a single string, and function.
   * @param values Values to be interpolated into the template string.
   * @returns The dedented string.
   */
  dedent(template: { raw: readonly string[] }, ...values: any[]): string;
  dedent(template: string): string;
  dedent<R extends string | { raw: readonly string[] }>(
    fn: (template: { raw: readonly string[] }, ...values: any[]) => R
  ): (template: { raw: readonly string[] }, ...values: any[]) => string;
}
