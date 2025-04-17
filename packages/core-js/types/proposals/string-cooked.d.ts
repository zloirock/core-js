// proposal stage: 1
// https://github.com/tc39/proposal-string-cooked
interface String {
  cooked(...values: unknown[]): string;
}