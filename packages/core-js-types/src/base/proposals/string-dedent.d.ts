// https://github.com/tc39/proposal-string-dedent

interface StringConstructor {
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

interface String {
  /**
   * Template tag that removes common leading whitespace from every line in the resulting string,
   * preserving relative indentation and blank lines.
   * @returns The dedented string.
   */
  dedent(): string;
}
