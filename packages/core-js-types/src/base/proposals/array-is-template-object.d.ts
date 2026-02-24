// https://github.com/tc39/proposal-array-is-template-object

interface ArrayConstructor { // @type-options: no-export
  /**
   * Determines whether a `value` is a `TemplateStringsArray`
   * @param value - The value to be checked
   * @returns `true` if `value` is a `TemplateStringsArray`, otherwise `false`
   */
  isTemplateObject(value: any): value is TemplateStringsArray;
}
