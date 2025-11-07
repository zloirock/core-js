// proposal stage: 2
// https://github.com/tc39/proposal-array-is-template-object
interface ArrayConstructor {
  isTemplateObject(value: any): value is TemplateStringsArray;
}
