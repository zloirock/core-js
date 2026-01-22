// https://github.com/tc39/proposal-string-dedent

type CoreJSTemplateTag = (template: { raw: readonly string[] }, ...values: any[]) => any;

interface StringConstructor {
  /**
   * Template tag that removes common leading whitespace from every line in the resulting string,
   * preserving relative indentation and blank lines.
   * @param template - The template strings array or function.
   * @param values - Values to be interpolated into the template string.
   * @returns The dedented string.
   */
  dedent(template: { raw: readonly string[] }, ...values: any[]): string;
  dedent<T extends CoreJSTemplateTag>(tag: T): T;
}
