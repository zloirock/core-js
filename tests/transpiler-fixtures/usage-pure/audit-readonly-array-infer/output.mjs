import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
type ElementOf<T> = T extends ReadonlyArray<infer U> ? U : never;
function wrap<T extends readonly string[]>(x: T): ElementOf<T>[] {
  return _sliceMaybeArray(x).call(x);
}
_atMaybeArray(_ref = wrap(['a', 'b', 'c'])).call(_ref, 0);