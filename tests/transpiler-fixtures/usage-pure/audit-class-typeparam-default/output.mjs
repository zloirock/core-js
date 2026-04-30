import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// class with default type parameter `class C<T = string[]>` referenced as bare `C`.
// the default `string[]` must propagate so `c.x.at(0)` resolves through the array
// branch of the polyfill dispatch
class C<T = string[]> {
  x: T = null!;
}
declare const c: C;
_atMaybeArray(_ref = c.x).call(_ref, 0);