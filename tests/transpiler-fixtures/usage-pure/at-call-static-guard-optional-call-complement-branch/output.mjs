import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// core-js installs nothing for `Array.isArray` - no module here defines it, and the library calls it
// natively in its own internals - so no configuration can leave a build without it and the `?.` over
// it is dead text: the guard tested its argument on every path, and its complement branch narrows
// exactly like the plain call's. the rule reads the namespace and the static, so either position
// of the `?.` answers alike
export function optionalCall(value: number[] | string) {
  if (Array.isArray?.(value)) return null;
  return _atMaybeString(value).call(value, 0);
}
export function optionalReceiver(value: number[] | string) {
  if (Array?.isArray(value)) return null;
  return _includesMaybeString(value).call(value, 1);
}