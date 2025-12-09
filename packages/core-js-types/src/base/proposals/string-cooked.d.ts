// proposal stage: 1
// https://github.com/tc39/proposal-string-cooked

interface StringConstructor {
  /**
   * Processes a template literal, interpreting escape sequences.
   * @param template Array of string literals.
   * @param substitutions The substitutions for the template literal.
   * @returns The processed string with escape sequences interpreted.
   */
  cooked(template: readonly string[], ...substitutions: any[]): string;
  /**
   * Processes a template literal, interpreting escape sequences.
   * @param template The template literal to process.
   * @param substitutions The substitutions for the template literal.
   * @returns The processed string with escape sequences interpreted.
   */
  cooked(template: string, ...substitutions: any[]): string;
}
