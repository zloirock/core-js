// proposal stage: 1
// https://github.com/tc39/proposal-string-cooked
interface StringConstructor {
  cooked(template: readonly string[], ...substitutions: unknown[]): string;

  cooked(template: string, ...substitutions: unknown[]): string;
}
