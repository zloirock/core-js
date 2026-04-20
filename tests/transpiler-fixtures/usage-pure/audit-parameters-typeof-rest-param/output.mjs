import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `...xs: T[]` stores `T[]` on RestElement.typeAnnotation; tuple element is T, so inner
// must be unwrapped one level to propagate the element type to chained ops
function fn(...xs: string[]) {
  return xs;
}
declare const args: Parameters<typeof fn>;
null == (_ref = _atMaybeArray(args).call(args, 0)) ? void 0 : _atMaybeString(_ref).call(_ref, -1);