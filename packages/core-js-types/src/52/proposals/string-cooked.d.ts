// proposal stage: 1
// https://github.com/tc39/proposal-string-cooked

interface StringConstructor {
  cooked(template: readonly string[], ...substitutions: any[]): string;

  cooked(template: string, ...substitutions: any[]): string;
}
