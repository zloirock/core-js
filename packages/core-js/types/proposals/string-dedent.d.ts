// proposal stage: 2
// https://github.com/tc39/proposal-string-dedent
interface StringConstructor {
  dedent(strings: TemplateStringsArray, ...values: unknown[]): string;
}