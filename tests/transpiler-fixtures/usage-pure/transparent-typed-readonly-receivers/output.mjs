import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
import _startsWithMaybeString from "@core-js/pure/actual/string/instance/starts-with";
// Transparent TypeScript wrappers keep immutable receivers available directly.
// Optional method calls reuse the const binding, unchanged parameter or typed
// `this` as their call receiver without a receiver assignment.
const values: readonly string[] = ['held'];
export const first = _atMaybeArray(values as readonly string[])?.call(values as readonly string[], 0);
export function contains(value: string) {
  return _includesMaybeString(value satisfies string)?.call(value satisfies string, 'e');
}
export function starts(this: string) {
  return _startsWithMaybeString(this!)?.call(this!, 'h');
}