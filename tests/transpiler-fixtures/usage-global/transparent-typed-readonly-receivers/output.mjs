import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.starts-with";
// Transparent TypeScript wrappers keep immutable receivers available directly.
// Optional method calls reuse the const binding, unchanged parameter or typed
// `this` as their call receiver without a receiver assignment.
const values: readonly string[] = ['held'];
export const first = (values as readonly string[]).at?.(0);
export function contains(value: string) {
  return (value satisfies string).includes?.('e');
}
export function starts(this: string) {
  return this!.startsWith?.('h');
}